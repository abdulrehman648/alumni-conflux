package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.dto.request.SignupRequest;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.service.OtpService;
import com.example.alumniconfluxbackend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SignupFacade {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public SignupFacade(UserService userService, PasswordEncoder passwordEncoder, OtpService otpService) {
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
        this.otpService = otpService;
    }

    public void checkEmail(String email) {
        if (userService.emailExists(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        otpService.generateOtp(email);
    }

    public void checkUsername(String username) {
        if (userService.usernameExists(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
    }

    public void verifyOtp(String email, String otp) {
        if (!otpService.validateOtp(email, otp, false)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
    }

    public User signup(SignupRequest request) {
        if (!otpService.validateOtp(request.getEmail(), request.getOtp(), true)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        if (userService.usernameExists(request.getUsername())) {
             throw new IllegalArgumentException("Username already exists");
        }
        if (userService.emailExists(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        return userService.registerUser(user);
    }

    public Map<String, Object> buildResponse(User savedUser) {
        return Map.of(
                "userId",   savedUser.getId(),
                "id",       savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "username", savedUser.getUsername(),
                "email",    savedUser.getEmail(),
                "role",     savedUser.getRole()
        );
    }
}
