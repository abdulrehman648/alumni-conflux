package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.dto.request.SignupRequest;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SignupFacade {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public SignupFacade(UserService userService, PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    public User signup(SignupRequest request) {
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
                "id",   savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "username", savedUser.getUsername(),
                "email",    savedUser.getEmail(),
                "role",     savedUser.getRole()
        );
    }
}
