package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.response.MentorshipRequestResponse;
import com.example.alumniconfluxbackend.dto.response.MentorshipResponse;

import java.util.List;
import java.util.Optional;

public interface MentorshipService {
    List<MentorshipResponse> getAvailableMentors();
    List<MentorshipResponse> getRecommendedMentors(Integer userId);
    void updateMentorshipAvailability(Integer userId, boolean isAvailable);
    MentorshipRequestResponse requestMentorship(Integer userId, Integer alumniId, String message);
    List<MentorshipRequestResponse> getReceivedRequests(Integer userId);
    List<MentorshipRequestResponse> getSentRequests(Integer userId);
    MentorshipRequestResponse updateRequestStatus(Integer userId, Integer requestId, String status);
    Optional<Integer> findConversationIdByRequestId(Integer requestId);
}
