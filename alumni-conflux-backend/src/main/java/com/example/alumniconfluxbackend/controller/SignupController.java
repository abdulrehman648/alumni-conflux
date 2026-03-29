package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.SignupRequest;
import com.example.alumniconfluxbackend.facade.SignupFacade;
import com.example.alumniconfluxbackend.model.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class SignupController {

    private final SignupFacade signupFacade;

    public SignupController(SignupFacade signupFacade) {
        this.signupFacade = signupFacade;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid SignupRequest request) {
        try {
            User savedUser = signupFacade.signup(request);
            Map<String, Object> response = signupFacade.buildResponse(savedUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", ex.getMessage()));
        }
    }
}
