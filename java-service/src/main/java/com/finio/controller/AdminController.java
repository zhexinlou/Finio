package com.finio.controller;

import com.finio.dto.ApiResponse;
import com.finio.entity.AuditLog;
import com.finio.entity.UserEntity;
import com.finio.exception.BizException;
import com.finio.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;
    private final AuditLogRepository auditLogRepository;
    private final ConversationRepository conversationRepository;
    private final PaymentOrderRepository paymentOrderRepository;

    public AdminController(UserRepository userRepository, SpaceRepository spaceRepository,
                           SpaceMemberRepository spaceMemberRepository,
                           AuditLogRepository auditLogRepository,
                           ConversationRepository conversationRepository,
                           PaymentOrderRepository paymentOrderRepository) {
        this.userRepository = userRepository;
        this.spaceRepository = spaceRepository;
        this.spaceMemberRepository = spaceMemberRepository;
        this.auditLogRepository = auditLogRepository;
        this.conversationRepository = conversationRepository;
        this.paymentOrderRepository = paymentOrderRepository;
    }

    private void requireAdmin(UserEntity user) {
        if (user.getRole() != UserEntity.Role.ADMIN) {
            throw new BizException(403, "需要管理员权限");
        }
    }

    /**
     * Dashboard stats
     */
    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats(@AuthenticationPrincipal UserEntity user) {
        requireAdmin(user);
        return ApiResponse.ok(Map.of(
            "totalUsers", userRepository.count(),
            "totalSpaces", spaceRepository.count(),
            "totalConversations", conversationRepository.count(),
            "totalPayments", paymentOrderRepository.count(),
            "lockedUsers", userRepository.countByLockedTrue()
        ));
    }

    /**
     * List all users (paginated)
     */
    @GetMapping("/users")
    public ApiResponse<Page<UserEntity>> listUsers(@AuthenticationPrincipal UserEntity user,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        requireAdmin(user);
        return ApiResponse.ok(userRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size)));
    }

    /**
     * Lock/unlock user
     */
    @PutMapping("/users/{userId}/lock")
    public ApiResponse<Void> toggleLock(@AuthenticationPrincipal UserEntity admin,
                                         @PathVariable Long userId,
                                         @RequestBody Map<String, Boolean> body) {
        requireAdmin(admin);
        UserEntity target = userRepository.findById(userId)
                .orElseThrow(() -> new BizException("用户不存在"));
        target.setLocked(body.getOrDefault("locked", false));
        userRepository.save(target);
        return ApiResponse.ok(target.isLocked() ? "已锁定" : "已解锁", null);
    }

    /**
     * Set user as admin
     */
    @PutMapping("/users/{userId}/role")
    public ApiResponse<Void> setRole(@AuthenticationPrincipal UserEntity admin,
                                      @PathVariable Long userId,
                                      @RequestBody Map<String, String> body) {
        requireAdmin(admin);
        UserEntity target = userRepository.findById(userId)
                .orElseThrow(() -> new BizException("用户不存在"));
        target.setRole(UserEntity.Role.valueOf(body.get("role")));
        userRepository.save(target);
        return ApiResponse.ok("角色已更新", null);
    }

    /**
     * Audit logs (paginated)
     */
    @GetMapping("/audit-logs")
    public ApiResponse<Page<AuditLog>> auditLogs(@AuthenticationPrincipal UserEntity user,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "50") int size) {
        requireAdmin(user);
        return ApiResponse.ok(auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size)));
    }

    /**
     * Audit logs for a specific space
     */
    @GetMapping("/audit-logs/space/{spaceId}")
    public ApiResponse<Page<AuditLog>> spaceAuditLogs(@AuthenticationPrincipal UserEntity user,
                                                        @PathVariable Long spaceId,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "50") int size) {
        requireAdmin(user);
        return ApiResponse.ok(auditLogRepository.findBySpaceIdOrderByCreatedAtDesc(spaceId, PageRequest.of(page, size)));
    }
}
