package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.response.MentorshipRequestResponse;
import com.example.alumniconfluxbackend.dto.response.MentorshipResponse;

import java.util.List;

public interface MentorshipService {
    List<MentorshipResponse> getAvailableMentors();
    void updateMentorshipAvailability(Integer userId, boolean isAvailable);
    MentorshipRequestResponse requestMentorship(Integer userId, Integer alumniId, String message);
    List<MentorshipRequestResponse> getReceivedRequests(Integer userId);
    List<MentorshipRequestResponse> getSentRequests(Integer userId);
    MentorshipRequestResponse updateRequestStatus(Integer userId, Integer requestId, String status);
}
