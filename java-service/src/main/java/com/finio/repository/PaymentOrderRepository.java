package com.finio.repository;

import com.finio.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderNo(String orderNo);
    List<PaymentOrder> findBySpaceIdAndStatusOrderByCreatedAtDesc(Long spaceId, PaymentOrder.Status status);
    List<PaymentOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
}
