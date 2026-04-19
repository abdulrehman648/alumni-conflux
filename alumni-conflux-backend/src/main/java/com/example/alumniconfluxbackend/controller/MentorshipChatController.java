package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.ChatMessageRequest;
import com.example.alumniconfluxbackend.dto.response.ConversationMessageResponse;
import com.example.alumniconfluxbackend.dto.response.ConversationResponse;
import com.example.alumniconfluxbackend.service.MentorshipChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mentorship/conversations")
public class MentorshipChatController {

    private final MentorshipChatService chatService;

    public MentorshipChatController(MentorshipChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ConversationResponse>> getConversations(@PathVariable Integer userId) {
        return ResponseEntity.ok(chatService.getConversationsForUser(userId));
    }

    @GetMapping("/request/{requestId}/{userId}")
    public ResponseEntity<ConversationResponse> getConversationByRequest(
            @PathVariable Integer requestId,
            @PathVariable Integer userId) {
        return ResponseEntity.ok(chatService.getConversationByRequestId(requestId, userId));
    }

    @GetMapping("/{conversationId}/messages/{userId}")
    public ResponseEntity<List<ConversationMessageResponse>> getMessages(
            @PathVariable Integer conversationId,
            @PathVariable Integer userId,
            @RequestParam(required = false) String after) {
        return ResponseEntity.ok(chatService.getMessages(userId, conversationId));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ConversationMessageResponse> sendMessage(
            @PathVariable Integer conversationId,
            @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(
                request.getSenderUserId(),
                conversationId,
                request.getContent()));
    }
}