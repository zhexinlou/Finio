package com.finio.controller;

import com.finio.dto.ApiResponse;
import com.finio.entity.Space;
import com.finio.entity.SpaceMember;
import com.finio.entity.UserEntity;
import com.finio.repository.SpaceMemberRepository;
import com.finio.repository.SpaceRepository;
import com.finio.repository.UserRepository;
import com.finio.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * WeChat OAuth 2.0 login flow:
 * 1. Frontend redirects to WeChat auth page with appId and redirect_uri
 * 2. WeChat redirects back with authorization code
 * 3. Backend exchanges code for access_token + openid
 * 4. Backend finds or creates user, returns JWT
 */
@RestController
@RequestMapping("/api/auth/wechat")
public class WeChatAuthController {

    private static final Logger log = LoggerFactory.getLogger(WeChatAuthController.class);

    @Value("${finio.wechat.app-id:}")
    private String appId;

    @Value("${finio.wechat.app-secret:}")
    private String appSecret;

    private final UserRepository userRepository;
    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final WebClient webClient;

    public WeChatAuthController(UserRepository userRepository,
                                 SpaceRepository spaceRepository,
                                 SpaceMemberRepository spaceMemberRepository,
                                 JwtUtil jwtUtil,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.spaceRepository = spaceRepository;
        this.spaceMemberRepository = spaceMemberRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.webClient = WebClient.builder().build();
    }

    /**
     * Get WeChat login URL for frontend redirect
     */
    @GetMapping("/login-url")
    public ApiResponse<Map<String, String>> getLoginUrl(@RequestParam String redirectUri) {
        if (appId.isEmpty()) {
            return ApiResponse.error(503, "微信登录暂未配置，请使用邮箱登录");
        }

        String url = "https://open.weixin.qq.com/connect/qrconnect"
                + "?appid=" + appId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code"
                + "&scope=snsapi_login"
                + "&state=" + UUID.randomUUID().toString().substring(0, 8)
                + "#wechat_redirect";
        return ApiResponse.ok(Map.of("url", url));
    }

    /**
     * Handle WeChat OAuth callback - exchange code for user info
     */
    @PostMapping("/callback")
    public ApiResponse<Map<String, Object>> callback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isEmpty()) {
            return ApiResponse.badRequest("授权码不能为空");
        }

        if (appId.isEmpty() || appSecret.isEmpty()) {
            return ApiResponse.error(503, "微信登录暂未配置");
        }

        try {
            // Step 1: Exchange code for access token
            Map<String, Object> tokenResp = webClient.get()
                    .uri("https://api.weixin.qq.com/sns/oauth2/access_token"
                            + "?appid=" + appId
                            + "&secret=" + appSecret
                            + "&code=" + code
                            + "&grant_type=authorization_code")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (tokenResp == null || tokenResp.containsKey("errcode")) {
                String errMsg = tokenResp != null ? (String) tokenResp.get("errmsg") : "未知错误";
                return ApiResponse.badRequest("微信授权失败: " + errMsg);
            }

            String accessToken = (String) tokenResp.get("access_token");
            String openId = (String) tokenResp.get("openid");

            // Step 2: Get user info
            Map<String, Object> userInfo = webClient.get()
                    .uri("https://api.weixin.qq.com/sns/userinfo"
                            + "?access_token=" + accessToken
                            + "&openid=" + openId
                            + "&lang=zh_CN")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String nickname = userInfo != null ? (String) userInfo.get("nickname") : "微信用户";
            String headimgurl = userInfo != null ? (String) userInfo.get("headimgurl") : null;

            // Step 3: Find or create user
            UserEntity user = userRepository.findByWechatOpenId(openId).orElse(null);
            if (user == null) {
                user = new UserEntity();
                user.setName(nickname);
                user.setEmail("wx_" + openId.substring(0, 8) + "@finio.placeholder");
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setWechatOpenId(openId);
                user.setAvatarUrl(headimgurl);
                userRepository.save(user);

                // Create personal space
                Space space = new Space();
                space.setName(nickname + "的空间");
                space.setOwnerId(user.getId());
                spaceRepository.save(space);

                SpaceMember member = new SpaceMember();
                member.setSpaceId(space.getId());
                member.setUserId(user.getId());
                member.setRole(SpaceMember.MemberRole.OWNER);
                spaceMemberRepository.save(member);
            } else {
                // Update user info
                user.setName(nickname);
                user.setAvatarUrl(headimgurl);
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);
            }

            String jwt = jwtUtil.generateToken(user.getId(), user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

            return ApiResponse.ok(Map.of(
                "token", jwt,
                "refreshToken", refreshToken,
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole().name()
                )
            ));
        } catch (Exception e) {
            log.error("WeChat login error", e);
            return ApiResponse.error(500, "微信登录失败，请稍后重试");
        }
    }
}
