package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.response.MentorshipRequestResponse;
import com.example.alumniconfluxbackend.dto.response.MentorshipResponse;
import com.example.alumniconfluxbackend.service.MentorshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentorship")
@CrossOrigin(origins = "*")
public class MentorshipController {

    private final MentorshipService mentorshipService;

    public MentorshipController(MentorshipService mentorshipService) {
        this.mentorshipService = mentorshipService;
    }

    @GetMapping("/mentors")
    public ResponseEntity<List<MentorshipResponse>> getAvailableMentors() {
        return ResponseEntity.ok(mentorshipService.getAvailableMentors());
    }

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<MentorshipResponse>> getRecommendedMentors(@PathVariable Integer userId) {
        return ResponseEntity.ok(mentorshipService.getRecommendedMentors(userId));
    }

    @PutMapping("/availability/{userId}")
    public ResponseEntity<Void> updateAvailability(@PathVariable Integer userId, @RequestParam boolean isAvailable) {
        mentorshipService.updateMentorshipAvailability(userId, isAvailable);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request/{userId}/{alumniId}")
    public ResponseEntity<MentorshipRequestResponse> requestMentorship(
            @PathVariable Integer userId,
            @PathVariable Integer alumniId,
            @RequestParam(required = false) String message) {
        return ResponseEntity.ok(mentorshipService.requestMentorship(userId, alumniId, message));
    }

    @GetMapping("/requests/received/{userId}")
    public ResponseEntity<List<MentorshipRequestResponse>> getReceivedRequests(@PathVariable Integer userId) {
        return ResponseEntity.ok(mentorshipService.getReceivedRequests(userId));
    }

    @GetMapping("/requests/sent/{userId}")
    public ResponseEntity<List<MentorshipRequestResponse>> getSentRequests(@PathVariable Integer userId) {
        return ResponseEntity.ok(mentorshipService.getSentRequests(userId));
    }

    @PutMapping("/requests/{requestId}/status/{userId}")
    public ResponseEntity<MentorshipRequestResponse> updateRequestStatus(
            @PathVariable Integer requestId,
            @PathVariable Integer userId,
            @RequestParam String status) {
        return ResponseEntity.ok(mentorshipService.updateRequestStatus(userId, requestId, status));
    }
}
