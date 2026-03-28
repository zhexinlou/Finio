package com.finio.controller;

import com.finio.dto.ApiResponse;
import com.finio.dto.LoginRequest;
import com.finio.dto.RegisterRequest;
import com.finio.entity.AuditLog;
import com.finio.entity.Space;
import com.finio.entity.SpaceMember;
import com.finio.entity.UserEntity;
import com.finio.exception.BizException;
import com.finio.repository.AuditLogRepository;
import com.finio.repository.SpaceRepository;
import com.finio.repository.SpaceMemberRepository;
import com.finio.repository.UserRepository;
import com.finio.security.JwtUtil;
import com.finio.service.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginAttemptService loginAttemptService;

    public AuthController(UserRepository userRepository, SpaceRepository spaceRepository,
                          SpaceMemberRepository spaceMemberRepository,
                          AuditLogRepository auditLogRepository,
                          PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                          LoginAttemptService loginAttemptService) {
        this.userRepository = userRepository;
        this.spaceRepository = spaceRepository;
        this.spaceMemberRepository = spaceMemberRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.loginAttemptService = loginAttemptService;
    }

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BizException("该邮箱已被注册");
        }

        // Password strength check
        validatePasswordStrength(req.getPassword());

        UserEntity user = new UserEntity();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Create space
        Space space = new Space();
        if (req.getCompanyName() != null && !req.getCompanyName().isBlank()) {
            space.setName(req.getCompanyName());
            space.setPlan(Space.Plan.PRO);
        } else {
            space.setName(user.getName() + "的空间");
            space.setPlan(Space.Plan.FREE);
        }
        space.setOwnerId(user.getId());
        spaceRepository.save(space);

        SpaceMember member = new SpaceMember();
        member.setSpaceId(space.getId());
        member.setUserId(user.getId());
        member.setRole(SpaceMember.MemberRole.OWNER);
        spaceMemberRepository.save(member);

        // Audit
        audit(user.getId(), "USER_REGISTER", "用户注册: " + user.getEmail());

        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

        return ApiResponse.ok(Map.of(
            "token", accessToken,
            "refreshToken", refreshToken,
            "user", userToMap(user)
        ));
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest req,
                                                   HttpServletRequest request) {
        String ip = getClientIp(request);

        // Check lockout
        if (loginAttemptService.isBlocked(ip)) {
            throw new BizException(429, "登录失败次数过多，请15分钟后重试");
        }

        UserEntity user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            loginAttemptService.loginFailed(ip);
            throw new BizException(401, "邮箱或密码错误");
        }

        // Check if account is locked
        if (user.isLocked()) {
            throw new BizException(403, "账户已被锁定，请联系管理员");
        }

        loginAttemptService.loginSucceeded(ip);
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedAttempts(0);
        userRepository.save(user);

        audit(user.getId(), "USER_LOGIN", "用户登录: " + user.getEmail());

        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

        return ApiResponse.ok(Map.of(
            "token", accessToken,
            "refreshToken", refreshToken,
            "user", userToMap(user)
        ));
    }

    @PostMapping("/refresh")
    public ApiResponse<Map<String, Object>> refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || !jwtUtil.validateRefreshToken(refreshToken)) {
            throw new BizException(401, "刷新令牌无效或已过期，请重新登录");
        }

        Long userId = jwtUtil.getUserIdFromRefreshToken(refreshToken);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BizException(401, "用户不存在"));

        String newAccessToken = jwtUtil.generateToken(user.getId(), user.getEmail());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

        return ApiResponse.ok(Map.of(
            "token", newAccessToken,
            "refreshToken", newRefreshToken
        ));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            String resetToken = jwtUtil.generateResetToken(user.getId(), user.getEmail());
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            // TODO: send email with reset link containing resetToken
            audit(user.getId(), "PASSWORD_RESET_REQUEST", "密码重置请求: " + email);
        }
        // Always return success to prevent email enumeration
        return ApiResponse.ok("如果该邮箱已注册，重置密码邮件已发送", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");

        if (token == null || newPassword == null) {
            throw new BizException("参数不完整");
        }
        validatePasswordStrength(newPassword);

        UserEntity user = userRepository.findByResetToken(token).orElse(null);
        if (user == null || user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BizException("重置链接无效或已过期");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        audit(user.getId(), "PASSWORD_RESET", "密码已重置");
        return ApiResponse.ok("密码已重置，请使用新密码登录", null);
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(@AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            throw new BizException(401, "未登录");
        }
        return ApiResponse.ok(userToMap(user));
    }

    @PutMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(@AuthenticationPrincipal UserEntity user,
                                                           @RequestBody Map<String, String> body) {
        if (body.containsKey("name")) {
            user.setName(body.get("name"));
        }
        if (body.containsKey("avatarUrl")) {
            user.setAvatarUrl(body.get("avatarUrl"));
        }
        userRepository.save(user);
        audit(user.getId(), "PROFILE_UPDATE", "更新个人信息");
        return ApiResponse.ok(userToMap(user));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal UserEntity user,
                                             @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BizException("旧密码错误");
        }
        validatePasswordStrength(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        audit(user.getId(), "PASSWORD_CHANGE", "修改密码");
        return ApiResponse.ok("密码已修改", null);
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 6) {
            throw new BizException("密码至少需要6位");
        }
        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        if (!hasLetter || !hasDigit) {
            throw new BizException("密码需要同时包含字母和数字");
        }
    }

    private Map<String, Object> userToMap(UserEntity user) {
        return Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole().name()
        );
    }

    private void audit(Long userId, String action, String detail) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setDetail(detail);
        auditLogRepository.save(log);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
