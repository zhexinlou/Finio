package com.finio.repository;

import com.finio.entity.SpaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SpaceMemberRepository extends JpaRepository<SpaceMember, Long> {
    List<SpaceMember> findByUserId(Long userId);
    List<SpaceMember> findBySpaceId(Long spaceId);
    Optional<SpaceMember> findBySpaceIdAndUserId(Long spaceId, Long userId);
    boolean existsBySpaceIdAndUserId(Long spaceId, Long userId);
    long countBySpaceId(Long spaceId);
}
