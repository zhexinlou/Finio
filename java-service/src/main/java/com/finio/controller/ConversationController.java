package com.finio.controller;

import com.finio.dto.ApiResponse;
import com.finio.entity.ChatMessage;
import com.finio.entity.Conversation;
import com.finio.entity.UserEntity;
import com.finio.exception.BizException;
import com.finio.repository.ChatMessageRepository;
import com.finio.repository.ConversationRepository;
import com.finio.repository.SpaceMemberRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SpaceMemberRepository spaceMemberRepository;

    public ConversationController(ConversationRepository conversationRepository,
                                   ChatMessageRepository chatMessageRepository,
                                   SpaceMemberRepository spaceMemberRepository) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.spaceMemberRepository = spaceMemberRepository;
    }

    @GetMapping
    public ApiResponse<List<Conversation>> list(@AuthenticationPrincipal UserEntity user,
                                                 @RequestParam Long spaceId) {
        verifySpaceAccess(spaceId, user.getId());
        return ApiResponse.ok(
            conversationRepository.findByUserIdAndSpaceIdOrderByUpdatedAtDesc(user.getId(), spaceId)
        );
    }

    @PostMapping
    public ApiResponse<Conversation> create(@AuthenticationPrincipal UserEntity user,
                                             @RequestBody Map<String, Object> body) {
        Long spaceId = ((Number) body.get("spaceId")).longValue();
        String title = (String) body.getOrDefault("title", "新对话");
        verifySpaceAccess(spaceId, user.getId());

        Conversation conv = new Conversation();
        conv.setUserId(user.getId());
        conv.setSpaceId(spaceId);
        conv.setTitle(title);
        conversationRepository.save(conv);
        return ApiResponse.ok(conv);
    }

    @GetMapping("/{id}/messages")
    public ApiResponse<List<ChatMessage>> messages(@AuthenticationPrincipal UserEntity user,
                                                    @PathVariable Long id) {
        Conversation conv = conversationRepository.findById(id)
                .orElseThrow(() -> new BizException("对话不存在"));
        verifySpaceAccess(conv.getSpaceId(), user.getId());
        return ApiResponse.ok(
            chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(id)
        );
    }

    @PostMapping("/{id}/messages")
    public ApiResponse<ChatMessage> addMessage(@AuthenticationPrincipal UserEntity user,
                                                @PathVariable Long id,
                                                @RequestBody Map<String, String> body) {
        Conversation conv = conversationRepository.findById(id)
                .orElseThrow(() -> new BizException("对话不存在"));
        verifySpaceAccess(conv.getSpaceId(), user.getId());

        ChatMessage msg = new ChatMessage();
        msg.setConversationId(id);
        msg.setRole(body.get("role"));
        msg.setType(body.getOrDefault("type", "text"));
        msg.setContent(body.get("content"));
        msg.setFilePath(body.get("filePath"));
        chatMessageRepository.save(msg);

        conv.setUpdatedAt(LocalDateTime.now());
        // Auto-title from first user message
        if ("user".equals(msg.getRole()) && "新对话".equals(conv.getTitle())) {
            String content = msg.getContent();
            conv.setTitle(content.length() > 30 ? content.substring(0, 30) + "..." : content);
        }
        conversationRepository.save(conv);

        return ApiResponse.ok(msg);
    }

    @PutMapping("/{id}")
    public ApiResponse<Conversation> update(@AuthenticationPrincipal UserEntity user,
                                             @PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        Conversation conv = conversationRepository.findById(id)
                .orElseThrow(() -> new BizException("对话不存在"));
        verifySpaceAccess(conv.getSpaceId(), user.getId());

        if (body.containsKey("title")) {
            conv.setTitle(body.get("title"));
        }
        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);
        return ApiResponse.ok(conv);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserEntity user,
                                     @PathVariable Long id) {
        Conversation conv = conversationRepository.findById(id)
                .orElseThrow(() -> new BizException("对话不存在"));
        verifySpaceAccess(conv.getSpaceId(), user.getId());

        chatMessageRepository.deleteByConversationId(id);
        conversationRepository.delete(conv);
        return ApiResponse.ok("已删除", null);
    }

    private void verifySpaceAccess(Long spaceId, Long userId) {
        if (!spaceMemberRepository.existsBySpaceIdAndUserId(spaceId, userId)) {
            throw new BizException(403, "无权访问该空间");
        }
    }
}
