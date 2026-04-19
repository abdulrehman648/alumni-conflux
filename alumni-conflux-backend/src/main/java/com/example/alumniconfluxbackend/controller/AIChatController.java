package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.service.AIChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private final AIChatService aiChatService;

    public AIChatController(AIChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/career-advice/{userId}")
    public ResponseEntity<String> getCareerAdvice(@PathVariable Integer userId, @RequestBody String message) {
        return ResponseEntity.ok(aiChatService.getCareerAdvice(userId, message));
    }
}
