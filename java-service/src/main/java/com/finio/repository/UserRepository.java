package com.finio.repository;

import com.finio.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByWechatOpenId(String wechatOpenId);
    Optional<UserEntity> findByResetToken(String resetToken);
    boolean existsByEmail(String email);
    Page<UserEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByLockedTrue();
}
