package com.example.novelnest.mail;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public void sendPasswordResetOtp(String toEmail, String otp) {
        if (mailSender != null && !senderEmail.isEmpty()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(senderEmail);
                message.setTo(toEmail);
                message.setSubject("Your Password Reset OTP");
                message.setText("Your OTP for password reset is: " + otp + "\nThis OTP will expire in 5 minutes.");
                
                mailSender.send(message);
                log.info("Sent OTP email to {}", toEmail);
                return;
            } catch (Exception e) {
                log.error("Failed to send email to {}", toEmail, e);
            }
        }
        
        // Fallback for dev mode
        log.info("=========================================");
        log.info("Password reset OTP for {} is: {}", toEmail, otp);
        log.info("=========================================");
    }
}
