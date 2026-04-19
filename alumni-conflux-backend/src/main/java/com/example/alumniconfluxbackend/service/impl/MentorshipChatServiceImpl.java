package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.response.ConversationMessageResponse;
import com.example.alumniconfluxbackend.dto.response.ConversationResponse;
import com.example.alumniconfluxbackend.model.MentorshipConversation;
import com.example.alumniconfluxbackend.model.MentorshipConversationMessage;
import com.example.alumniconfluxbackend.model.MentorshipRequest;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.repository.MentorshipConversationMessageRepository;
import com.example.alumniconfluxbackend.repository.MentorshipConversationRepository;
import com.example.alumniconfluxbackend.repository.MentorshipRequestRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.MentorshipChatService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MentorshipChatServiceImpl implements MentorshipChatService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final MentorshipConversationRepository conversationRepository;
    private final MentorshipConversationMessageRepository messageRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final UserRepository userRepository;

    public MentorshipChatServiceImpl(MentorshipConversationRepository conversationRepository,
            MentorshipConversationMessageRepository messageRepository,
            MentorshipRequestRepository mentorshipRequestRepository,
            UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ConversationResponse ensureConversationForRequest(MentorshipRequest request) {
        MentorshipConversation conversation = conversationRepository.findByRequestId(request.getId())
                .orElseGet(() -> {
                    MentorshipConversation created = new MentorshipConversation();
                    created.setRequestId(request.getId());
                    created.setStudentUserId(request.getRequester().getId());
                    created.setMentorUserId(request.getMentor().getUser().getId());
                    return conversationRepository.save(created);
                });

        return mapToConversationResponse(conversation);
    }

    @Override
    public Optional<ConversationResponse> findConversationByRequestId(Integer requestId) {
        return mentorshipRequestRepository.findById(requestId)
                .filter(request -> "ACCEPTED".equals(request.getStatus()))
                .map(this::ensureConversationForRequest);
    }

    @Override
    public ConversationResponse getConversationByRequestId(Integer requestId, Integer userId) {
        ConversationResponse conversation = findConversationByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.getStudentUserId().equals(userId) && !conversation.getMentorUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to access this conversation");
        }
        return conversation;
    }

    @Override
    public List<ConversationResponse> getConversationsForUser(Integer userId) {
        return conversationRepository.findByStudentUserIdOrMentorUserIdOrderByCreatedAtDesc(userId, userId)
                .stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ConversationMessageResponse> getMessages(Integer userId, Integer conversationId) {
        MentorshipConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        validateParticipant(conversation, userId);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ConversationMessageResponse sendMessage(Integer userId, Integer conversationId, String content) {
        MentorshipConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        validateParticipant(conversation, userId);

        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message cannot be empty");
        }

        MentorshipConversationMessage message = new MentorshipConversationMessage();
        message.setConversationId(conversationId);
        message.setSenderUserId(userId);
        message.setContent(content.trim());
        messageRepository.save(message);
        return mapToMessageResponse(message);
    }

    private ConversationResponse mapToConversationResponse(MentorshipConversation conversation) {
        ConversationResponse response = new ConversationResponse();
        response.setId(conversation.getId());
        response.setRequestId(conversation.getRequestId());
        response.setStudentUserId(conversation.getStudentUserId());
        response.setMentorUserId(conversation.getMentorUserId());
        response.setCreatedAt(conversation.getCreatedAt().format(DATE_FORMATTER));
        response.setStudentName(resolveUserName(conversation.getStudentUserId()));
        response.setMentorName(resolveUserName(conversation.getMentorUserId()));

        messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId())
                .ifPresent(latest -> {
                    response.setLastMessage(latest.getContent());
                    response.setLastMessageAt(latest.getCreatedAt().format(DATE_FORMATTER));
                });

        return response;
    }

    private ConversationMessageResponse mapToMessageResponse(MentorshipConversationMessage message) {
        ConversationMessageResponse response = new ConversationMessageResponse();
        response.setId(message.getId());
        response.setConversationId(message.getConversationId());
        response.setSenderUserId(message.getSenderUserId());
        response.setSenderName(resolveUserName(message.getSenderUserId()));
        response.setContent(message.getContent());
        response.setCreatedAt(message.getCreatedAt().format(DATE_FORMATTER));
        return response;
    }

    private void validateParticipant(MentorshipConversation conversation, Integer userId) {
        if (!conversation.getStudentUserId().equals(userId) && !conversation.getMentorUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to access this conversation");
        }
    }

    private String resolveUserName(Integer userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse("Unknown user");
    }
}