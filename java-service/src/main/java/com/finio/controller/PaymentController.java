package com.finio.controller;

import com.finio.dto.ApiResponse;
import com.finio.entity.PaymentOrder;
import com.finio.entity.Space;
import com.finio.entity.UserEntity;
import com.finio.exception.BizException;
import com.finio.repository.PaymentOrderRepository;
import com.finio.repository.SpaceRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentOrderRepository paymentOrderRepository;
    private final SpaceRepository spaceRepository;

    public PaymentController(PaymentOrderRepository paymentOrderRepository,
                              SpaceRepository spaceRepository) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.spaceRepository = spaceRepository;
    }

    /**
     * Create a payment order for plan upgrade
     */
    @PostMapping("/create")
    public ApiResponse<Map<String, Object>> createOrder(@AuthenticationPrincipal UserEntity user,
                                                         @RequestBody Map<String, Object> body) {
        Long spaceId = ((Number) body.get("spaceId")).longValue();
        String planStr = (String) body.get("plan");
        String channelStr = (String) body.get("channel");

        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new BizException("空间不存在"));

        PaymentOrder.Plan plan = PaymentOrder.Plan.valueOf(planStr);
        PaymentOrder.PaymentChannel channel = PaymentOrder.PaymentChannel.valueOf(channelStr);

        BigDecimal amount = switch (plan) {
            case PRO_MONTHLY -> new BigDecimal("99.00");
            case PRO_YEARLY -> new BigDecimal("999.00");
            case ENTERPRISE -> new BigDecimal("0.00"); // Contact sales
        };

        if (plan == PaymentOrder.Plan.ENTERPRISE) {
            throw new BizException("企业版请联系销售团队");
        }

        PaymentOrder order = new PaymentOrder();
        order.setOrderNo("FIN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6));
        order.setUserId(user.getId());
        order.setSpaceId(spaceId);
        order.setPlan(plan);
        order.setAmount(amount);
        order.setChannel(channel);
        order.setExpireAt(LocalDateTime.now().plusMinutes(30));
        paymentOrderRepository.save(order);

        // TODO: Call WeChat Pay / Alipay API to get payment URL/QR code
        // For now, return the order info
        return ApiResponse.ok(Map.of(
            "orderNo", order.getOrderNo(),
            "amount", order.getAmount(),
            "channel", order.getChannel().name(),
            "payUrl", "https://pay.example.com/" + order.getOrderNo() // Placeholder
        ));
    }

    /**
     * Payment callback from WeChat Pay / Alipay
     */
    @PostMapping("/callback/{channel}")
    public ApiResponse<Void> paymentCallback(@PathVariable String channel,
                                              @RequestBody Map<String, String> body) {
        String orderNo = body.get("orderNo");
        String thirdPartyOrderNo = body.get("thirdPartyOrderNo");

        PaymentOrder order = paymentOrderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new BizException("订单不存在"));

        if (order.getStatus() != PaymentOrder.Status.PENDING) {
            return ApiResponse.ok("已处理", null);
        }

        // Verify payment with third party (TODO: implement actual verification)
        order.setStatus(PaymentOrder.Status.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setThirdPartyOrderNo(thirdPartyOrderNo);
        paymentOrderRepository.save(order);

        // Upgrade space plan
        Space space = spaceRepository.findById(order.getSpaceId()).orElse(null);
        if (space != null) {
            space.setPlan(Space.Plan.PRO);
            spaceRepository.save(space);
        }

        return ApiResponse.ok("支付成功", null);
    }

    /**
     * Query order status
     */
    @GetMapping("/orders/{orderNo}")
    public ApiResponse<PaymentOrder> queryOrder(@AuthenticationPrincipal UserEntity user,
                                                 @PathVariable String orderNo) {
        PaymentOrder order = paymentOrderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new BizException("订单不存在"));
        if (!order.getUserId().equals(user.getId())) {
            throw new BizException(403, "无权查看此订单");
        }
        return ApiResponse.ok(order);
    }

    /**
     * My payment history
     */
    @GetMapping("/my")
    public ApiResponse<List<PaymentOrder>> myOrders(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(paymentOrderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }
}
