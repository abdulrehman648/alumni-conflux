package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.response.ConversationMessageResponse;
import com.example.alumniconfluxbackend.dto.response.ConversationResponse;
import com.example.alumniconfluxbackend.model.MentorshipRequest;

import java.util.List;
import java.util.Optional;

public interface MentorshipChatService {
    ConversationResponse ensureConversationForRequest(MentorshipRequest request);
    Optional<ConversationResponse> findConversationByRequestId(Integer requestId);
    ConversationResponse getConversationByRequestId(Integer requestId, Integer userId);
    List<ConversationResponse> getConversationsForUser(Integer userId);
    List<ConversationMessageResponse> getMessages(Integer userId, Integer conversationId);
    ConversationMessageResponse sendMessage(Integer userId, Integer conversationId, String content);
}