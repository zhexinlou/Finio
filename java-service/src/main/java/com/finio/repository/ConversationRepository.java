package com.finio.repository;

import com.finio.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUserIdAndSpaceIdOrderByUpdatedAtDesc(Long userId, Long spaceId);
    List<Conversation> findBySpaceIdOrderByUpdatedAtDesc(Long spaceId);
}
