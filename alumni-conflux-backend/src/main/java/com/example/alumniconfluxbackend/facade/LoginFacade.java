package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.dto.request.LoginRequest;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class LoginFacade {

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    public LoginFacade(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object>  login(LoginRequest request) {
        User user = userService.findByEmailAndUsername(request.getEmailOrUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password");
        }
        
        return buildResponse(user);
    }

    private Map<String, Object> buildResponse(User user) {
        return Map.of(
                "userId",   user.getId(),
                "id",       user.getId(),
                "fullName",    user.getFullName(),
                "username", user.getUsername(),
                "email",    user.getEmail(),
                "role",     user.getRole()
        );
    }
}
