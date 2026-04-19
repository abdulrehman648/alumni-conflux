package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.MentorshipConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorshipConversationMessageRepository extends JpaRepository<MentorshipConversationMessage, Integer> {
    List<MentorshipConversationMessage> findByConversationIdOrderByCreatedAtAsc(Integer conversationId);
    Optional<MentorshipConversationMessage> findTopByConversationIdOrderByCreatedAtDesc(Integer conversationId);
}