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

    public String generateOtp(String email, String purpose) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpStorage.put(email, new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        System.out.println("Generated OTP for " + email + " (" + purpose + "): " + otp); // For debugging purposes
        sendOtpEmail(email, otp, purpose);
        return otp;
    }

    public String generateOtp(String email) {
        return generateOtp(email, "Verification");
    }

    private void sendOtpEmail(String email, String otp, String purpose) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);

            String subject = "Your Verification Code";
            String body = "Your verification code for Alumni Conflux is: " + otp + "\n\nThis code will expire in "
                    + OTP_EXPIRY_MINUTES + " minutes.";

            if ("SIGNUP".equalsIgnoreCase(purpose)) {
                subject = "Welcome to Alumni Conflux - Verify Your Email";
                body = "Welcome to Alumni Conflux! To complete your registration, please use the following verification code:\n\n"
                        + "Verification Code: " + otp + "\n\n"
                        + "This code will expire in " + OTP_EXPIRY_MINUTES
                        + " minutes. If you did not request this, please ignore this email.";
            } else if ("FORGOT_PASSWORD".equalsIgnoreCase(purpose)) {
                subject = "Reset Your Password - Alumni Conflux";
                body = "We received a request to reset your password for your Alumni Conflux account. Please use the following code to proceed:\n\n"
                        + "Reset Code: " + otp + "\n\n"
                        + "This code will expire in " + OTP_EXPIRY_MINUTES + " minutes.";
            }

            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("OTP email sent successfully to " + email + " for " + purpose);
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
