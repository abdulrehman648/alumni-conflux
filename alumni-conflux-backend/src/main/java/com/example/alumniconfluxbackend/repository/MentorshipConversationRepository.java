package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.MentorshipConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorshipConversationRepository extends JpaRepository<MentorshipConversation, Integer> {
    Optional<MentorshipConversation> findByRequestId(Integer requestId);
    List<MentorshipConversation> findByStudentUserIdOrMentorUserIdOrderByCreatedAtDesc(Integer studentUserId, Integer mentorUserId);
}