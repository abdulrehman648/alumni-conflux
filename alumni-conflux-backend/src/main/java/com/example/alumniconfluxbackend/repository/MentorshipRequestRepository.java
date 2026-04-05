package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.MentorshipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Integer> {
    List<MentorshipRequest> findByMentorId(Integer alumniId);
    List<MentorshipRequest> findByRequesterId(Integer userId);
    boolean existsByRequesterIdAndMentorIdAndStatus(Integer userId, Integer alumniId, String status);
}
