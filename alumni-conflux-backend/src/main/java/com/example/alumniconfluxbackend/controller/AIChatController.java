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

    /**
     * Get career advice for a student.
     * @param userId The ID of the student asking for advice.
     * @return AI-generated career advice based on alumni database.
     */
    @PostMapping("/career-advice/{userId}")
    public ResponseEntity<String> getCareerAdvice(@PathVariable Integer userId, @RequestBody String message) {
        return ResponseEntity.ok(aiChatService.getCareerAdvice(userId, message));
    }
}
