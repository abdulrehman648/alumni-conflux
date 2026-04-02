package com.example.alumniconfluxbackend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private static final int OTP_EXPIRY_MINUTES = 5;

    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public OtpService(org.springframework.mail.javamail.JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpStorage.put(email, new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        System.out.println("Generated OTP for " + email + ": " + otp); // For debugging purposes
        sendOtpEmail(email, otp);
        return otp;
    }

    private void sendOtpEmail(String email, String otp) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Your Verification Code");
            message.setText("Your verification code for Alumni Conflux is: " + otp + "\n\nThis code will expire in "
                    + OTP_EXPIRY_MINUTES + " minutes.");
            mailSender.send(message);
            System.out.println("OTP email sent successfully to " + email);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: Failed to send OTP email to " + email + ". Error: " + e.getMessage());
            System.err.println("For development, use this OTP: " + otp);
        }
    }

    public boolean validateOtp(String email, String otp, boolean removeAfterValidation) {
        OtpData data = otpStorage.get(email);
        if (data == null) {
            return false;
        }
        if (data.expiryTime.isBefore(LocalDateTime.now())) {
            otpStorage.remove(email);
            return false;
        }
        boolean isValid = data.otp.equals(otp);
        if (isValid && removeAfterValidation) {
            otpStorage.remove(email);
        }
        return isValid;
    }

    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;

        OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}
