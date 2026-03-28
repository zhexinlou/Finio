package com.finio.controller;

import com.finio.dto.ApiResponse;
import com.finio.dto.CreateSpaceRequest;
import com.finio.dto.InviteRequest;
import com.finio.entity.AuditLog;
import com.finio.entity.Space;
import com.finio.entity.SpaceMember;
import com.finio.entity.UserEntity;
import com.finio.exception.BizException;
import com.finio.repository.AuditLogRepository;
import com.finio.repository.SpaceMemberRepository;
import com.finio.repository.SpaceRepository;
import com.finio.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spaces")
public class SpaceController {

    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public SpaceController(SpaceRepository spaceRepository,
                           SpaceMemberRepository spaceMemberRepository,
                           UserRepository userRepository,
                           AuditLogRepository auditLogRepository) {
        this.spaceRepository = spaceRepository;
        this.spaceMemberRepository = spaceMemberRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/my")
    public ApiResponse<List<Map<String, Object>>> mySpaces(@AuthenticationPrincipal UserEntity user) {
        List<SpaceMember> memberships = spaceMemberRepository.findByUserId(user.getId());
        List<Map<String, Object>> result = memberships.stream().map(m -> {
            Space space = spaceRepository.findById(m.getSpaceId()).orElse(null);
            if (space == null) return null;
            long count = spaceMemberRepository.countBySpaceId(space.getId());
            return Map.<String, Object>of(
                "id", space.getId(),
                "name", space.getName(),
                "role", m.getRole().name(),
                "memberCount", count,
                "plan", space.getPlan().name()
            );
        }).filter(m -> m != null).toList();
        return ApiResponse.ok(result);
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> createSpace(@AuthenticationPrincipal UserEntity user,
                                                         @Valid @RequestBody CreateSpaceRequest req) {
        Space space = new Space();
        space.setName(req.getName());
        space.setOwnerId(user.getId());
        space.setPlan(Space.Plan.FREE);
        spaceRepository.save(space);

        SpaceMember member = new SpaceMember();
        member.setSpaceId(space.getId());
        member.setUserId(user.getId());
        member.setRole(SpaceMember.MemberRole.OWNER);
        spaceMemberRepository.save(member);

        audit(user.getId(), space.getId(), "SPACE_CREATE", "创建空间: " + space.getName());

        return ApiResponse.ok(Map.of(
            "id", space.getId(),
            "name", space.getName()
        ));
    }

    @PutMapping("/{spaceId}")
    public ApiResponse<Map<String, Object>> updateSpace(@AuthenticationPrincipal UserEntity user,
                                                         @PathVariable Long spaceId,
                                                         @RequestBody Map<String, String> body) {
        requireRole(spaceId, user.getId(), SpaceMember.MemberRole.ADMIN);
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new BizException("空间不存在"));

        if (body.containsKey("name")) {
            space.setName(body.get("name"));
        }
        spaceRepository.save(space);
        audit(user.getId(), spaceId, "SPACE_UPDATE", "更新空间: " + space.getName());
        return ApiResponse.ok(Map.of("id", space.getId(), "name", space.getName()));
    }

    @DeleteMapping("/{spaceId}")
    public ApiResponse<Void> deleteSpace(@AuthenticationPrincipal UserEntity user,
                                          @PathVariable Long spaceId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new BizException("空间不存在"));
        if (!space.getOwnerId().equals(user.getId())) {
            throw new BizException(403, "只有空间拥有者才能删除空间");
        }

        spaceMemberRepository.findBySpaceId(spaceId).forEach(spaceMemberRepository::delete);
        spaceRepository.delete(space);
        audit(user.getId(), spaceId, "SPACE_DELETE", "删除空间: " + space.getName());
        return ApiResponse.ok("空间已删除", null);
    }

    @GetMapping("/{spaceId}/members")
    public ApiResponse<List<Map<String, Object>>> getMembers(@AuthenticationPrincipal UserEntity user,
                                                              @PathVariable Long spaceId) {
        if (!spaceMemberRepository.existsBySpaceIdAndUserId(spaceId, user.getId())) {
            throw new BizException(403, "无权访问该空间");
        }

        List<SpaceMember> members = spaceMemberRepository.findBySpaceId(spaceId);
        List<Map<String, Object>> result = members.stream().map(m -> {
            UserEntity memberUser = userRepository.findById(m.getUserId()).orElse(null);
            if (memberUser == null) return null;
            return Map.<String, Object>of(
                "id", m.getId(),
                "userId", m.getUserId(),
                "userName", memberUser.getName(),
                "userEmail", memberUser.getEmail(),
                "role", m.getRole().name(),
                "joinedAt", m.getJoinedAt().toString()
            );
        }).filter(m -> m != null).toList();
        return ApiResponse.ok(result);
    }

    @PostMapping("/{spaceId}/invite")
    public ApiResponse<Void> inviteMember(@AuthenticationPrincipal UserEntity user,
                                           @PathVariable Long spaceId,
                                           @Valid @RequestBody InviteRequest req) {
        requireRole(spaceId, user.getId(), SpaceMember.MemberRole.ADMIN);

        UserEntity invitedUser = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BizException("该邮箱用户不存在，请先让对方注册"));

        if (spaceMemberRepository.existsBySpaceIdAndUserId(spaceId, invitedUser.getId())) {
            throw new BizException("该用户已在空间中");
        }

        SpaceMember member = new SpaceMember();
        member.setSpaceId(spaceId);
        member.setUserId(invitedUser.getId());
        member.setRole(SpaceMember.MemberRole.valueOf(req.getRole()));
        spaceMemberRepository.save(member);

        audit(user.getId(), spaceId, "MEMBER_INVITE",
                "邀请成员: " + invitedUser.getEmail() + " 角色: " + req.getRole());
        return ApiResponse.ok("邀请成功", null);
    }

    @PutMapping("/{spaceId}/members/{memberId}/role")
    public ApiResponse<Void> updateMemberRole(@AuthenticationPrincipal UserEntity user,
                                               @PathVariable Long spaceId,
                                               @PathVariable Long memberId,
                                               @RequestBody Map<String, String> body) {
        requireRole(spaceId, user.getId(), SpaceMember.MemberRole.ADMIN);
        SpaceMember target = spaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new BizException("成员不存在"));
        if (!target.getSpaceId().equals(spaceId)) {
            throw new BizException("成员不属于该空间");
        }
        if (target.getRole() == SpaceMember.MemberRole.OWNER) {
            throw new BizException("不能修改拥有者角色");
        }

        target.setRole(SpaceMember.MemberRole.valueOf(body.get("role")));
        spaceMemberRepository.save(target);
        audit(user.getId(), spaceId, "MEMBER_ROLE_UPDATE", "修改成员角色: " + memberId);
        return ApiResponse.ok("角色已更新", null);
    }

    @DeleteMapping("/{spaceId}/members/{memberId}")
    public ApiResponse<Void> removeMember(@AuthenticationPrincipal UserEntity user,
                                           @PathVariable Long spaceId,
                                           @PathVariable Long memberId) {
        requireRole(spaceId, user.getId(), SpaceMember.MemberRole.ADMIN);

        SpaceMember target = spaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new BizException("成员不存在"));
        if (!target.getSpaceId().equals(spaceId)) {
            throw new BizException("成员不属于该空间");
        }
        if (target.getRole() == SpaceMember.MemberRole.OWNER) {
            throw new BizException("不能移除空间拥有者");
        }

        spaceMemberRepository.delete(target);
        audit(user.getId(), spaceId, "MEMBER_REMOVE", "移除成员: " + memberId);
        return ApiResponse.ok("已移除", null);
    }

    /**
     * Check that the user has at least the given role in the space.
     * OWNER > ADMIN > MEMBER
     */
    private void requireRole(Long spaceId, Long userId, SpaceMember.MemberRole minRole) {
        SpaceMember m = spaceMemberRepository.findBySpaceIdAndUserId(spaceId, userId)
                .orElseThrow(() -> new BizException(403, "无权操作"));
        if (minRole == SpaceMember.MemberRole.ADMIN
                && m.getRole() == SpaceMember.MemberRole.MEMBER) {
            throw new BizException(403, "需要管理员权限");
        }
        if (minRole == SpaceMember.MemberRole.OWNER
                && m.getRole() != SpaceMember.MemberRole.OWNER) {
            throw new BizException(403, "需要拥有者权限");
        }
    }

    private void audit(Long userId, Long spaceId, String action, String detail) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setSpaceId(spaceId);
        log.setAction(action);
        log.setDetail(detail);
        auditLogRepository.save(log);
    }
}
