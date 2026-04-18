package com.book.BookStore.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOrderConfirmationEmail(String toEmail, String customerName, String orderDetails) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Order Confirmation - BookStore");
            message.setText(buildOrderConfirmationText(customerName, orderDetails));

            mailSender.send(message);
            logger.info("Order confirmation email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send order confirmation email to: {}", toEmail, e);
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String customerName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to BookStore!");
            message.setText(buildWelcomeText(customerName));

            mailSender.send(message);
            logger.info("Welcome email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Password Reset - BookStore");
            message.setText(buildPasswordResetText(resetToken));

            mailSender.send(message);
            logger.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", toEmail, e);
        }
    }

    private String buildOrderConfirmationText(String customerName, String orderDetails) {
        return String.format(
                "Dear %s,\n\n" +
                        "Thank you for your order!\n\n" +
                        "Order Details:\n%s\n\n" +
                        "Your order has been confirmed and will be processed shortly.\n\n" +
                        "Best regards,\n" +
                        "BookStore Team",
                customerName, orderDetails);
    }

    private String buildWelcomeText(String customerName) {
        return String.format(
                "Dear %s,\n\n" +
                        "Welcome to BookStore! We're excited to have you as part of our community.\n\n" +
                        "You can now browse our collection of books, add them to your cart, and place orders.\n\n" +
                        "Happy reading!\n\n" +
                        "Best regards,\n" +
                        "BookStore Team",
                customerName);
    }

    private String buildPasswordResetText(String resetToken) {
        return String.format(
                "You have requested to reset your password.\n\n" +
                        "Your reset token is: %s\n\n" +
                        "Please use this token to reset your password within the next 15 minutes.\n\n" +
                        "If you didn't request this reset, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "BookStore Team",
                resetToken);
    }
}