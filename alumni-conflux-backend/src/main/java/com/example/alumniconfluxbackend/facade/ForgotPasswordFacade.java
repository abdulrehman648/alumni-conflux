package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.service.OtpService;
import com.example.alumniconfluxbackend.service.UserService;
import org.springframework.stereotype.Component;

@Component
public class ForgotPasswordFacade {

    private final UserService userService;
    private final OtpService otpService;

    public ForgotPasswordFacade(UserService userService, OtpService otpService) {
        this.userService = userService;
        this.otpService = otpService;
    }

    public void generateResetOtp(String email) {
        userService.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        otpService.generateOtp(email, "FORGOT_PASSWORD");
    }

    public void resetPassword(String email, String otp, String newPassword) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        if (!otpService.validateOtp(email, otp, true)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        userService.updatePassword(user, newPassword);
    }
}
