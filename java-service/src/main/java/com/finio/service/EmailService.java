package com.finio.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Email service for sending transactional emails.
 *
 * In production, integrate with:
 * - Alibaba Cloud DirectMail (aliyun.com/product/directmail)
 * - Tencent Cloud SES
 * - SendGrid / Mailgun
 *
 * For now, logs emails to console for development.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${finio.email.from:noreply@finio.ai}")
    private String fromAddress;

    @Value("${finio.email.enabled:false}")
    private boolean enabled;

    @Value("${finio.app.base-url:http://localhost:3000}")
    private String baseUrl;

    /**
     * Send registration welcome email
     */
    public void sendWelcome(String toEmail, String userName) {
        String subject = "欢迎加入 Finio！";
        String body = String.format("""
            <h2>你好，%s！</h2>
            <p>欢迎使用 Finio — AI 驱动的财务管理平台。</p>
            <p>你可以：</p>
            <ul>
                <li>与 AI 助手对话，获取专业财务分析</li>
                <li>上传财务文件，自动生成报表</li>
                <li>创建企业空间，邀请团队协作</li>
            </ul>
            <p><a href="%s/dashboard" style="color:#1e3a5f;">立即开始 →</a></p>
            <p>—— Finio 团队</p>
            """, userName, baseUrl);

        send(toEmail, subject, body);
    }

    /**
     * Send password reset email
     */
    public void sendPasswordReset(String toEmail, String userName, String resetToken) {
        String resetUrl = baseUrl + "/reset-password?token=" + resetToken;
        String subject = "Finio 密码重置";
        String body = String.format("""
            <h2>你好，%s</h2>
            <p>我们收到了重置你 Finio 账户密码的请求。</p>
            <p><a href="%s" style="display:inline-block;padding:12px 24px;background:#1e3a5f;color:#fff;border-radius:8px;text-decoration:none;">重置密码</a></p>
            <p>如果你没有发起此请求，请忽略此邮件。链接将在1小时后失效。</p>
            <p>—— Finio 团队</p>
            """, userName, resetUrl);

        send(toEmail, subject, body);
    }

    /**
     * Send space invite email
     */
    public void sendSpaceInvite(String toEmail, String inviterName, String spaceName) {
        String subject = inviterName + " 邀请你加入 " + spaceName;
        String body = String.format("""
            <h2>你已被邀请加入企业空间</h2>
            <p><strong>%s</strong> 邀请你加入 <strong>%s</strong> 的工作空间。</p>
            <p><a href="%s/dashboard/space" style="display:inline-block;padding:12px 24px;background:#1e3a5f;color:#fff;border-radius:8px;text-decoration:none;">查看空间</a></p>
            <p>—— Finio 团队</p>
            """, inviterName, spaceName, baseUrl);

        send(toEmail, subject, body);
    }

    /**
     * Send payment receipt
     */
    public void sendPaymentReceipt(String toEmail, String userName, String orderNo, String amount, String plan) {
        String subject = "Finio 支付成功 — " + orderNo;
        String body = String.format("""
            <h2>支付成功</h2>
            <p>你好，%s。你的 Finio 订阅已成功激活。</p>
            <table style="border-collapse:collapse;">
                <tr><td style="padding:4px 12px;color:#666;">订单号</td><td style="padding:4px 12px;">%s</td></tr>
                <tr><td style="padding:4px 12px;color:#666;">金额</td><td style="padding:4px 12px;">¥%s</td></tr>
                <tr><td style="padding:4px 12px;color:#666;">方案</td><td style="padding:4px 12px;">%s</td></tr>
            </table>
            <p>—— Finio 团队</p>
            """, userName, orderNo, amount, plan);

        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String htmlBody) {
        if (!enabled) {
            log.info("[EMAIL-DEV] To: {} | Subject: {} | Body length: {}", to, subject, htmlBody.length());
            return;
        }

        // TODO: Integrate actual email provider
        // Example with Aliyun DirectMail:
        //   directMailClient.sendMail(fromAddress, to, subject, htmlBody);
        log.info("[EMAIL] Sent to: {} | Subject: {}", to, subject);
    }
}
