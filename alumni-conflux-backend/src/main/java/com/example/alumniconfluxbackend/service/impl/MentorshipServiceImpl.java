package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.response.MentorshipRequestResponse;
import com.example.alumniconfluxbackend.dto.response.MentorshipResponse;
import com.example.alumniconfluxbackend.model.Alumni;
import com.example.alumniconfluxbackend.model.MentorshipRequest;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.repository.AlumniRepository;
import com.example.alumniconfluxbackend.repository.MentorshipRequestRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.MentorshipService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MentorshipServiceImpl implements MentorshipService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AlumniRepository alumniRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final UserRepository userRepository;

    public MentorshipServiceImpl(AlumniRepository alumniRepository,
                                MentorshipRequestRepository mentorshipRequestRepository,
                                UserRepository userRepository) {
        this.alumniRepository = alumniRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<MentorshipResponse> getAvailableMentors() {
        return alumniRepository.findByIsAvailableForMentorshipTrue()
                .stream()
                .map(this::mapToMentorshipResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void updateMentorshipAvailability(Integer userId, boolean isAvailable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getAlumni() == null) {
            throw new RuntimeException("Only alumni can be mentors");
        }
        
        Alumni alumni = user.getAlumni();
        alumni.setAvailableForMentorship(isAvailable);
        alumniRepository.save(alumni);
    }

    @Override
    public MentorshipRequestResponse requestMentorship(Integer userId, Integer alumniId, String message) {
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Alumni mentor = alumniRepository.findById(alumniId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        if (!mentor.isAvailableForMentorship()) {
            throw new RuntimeException("This mentor is currently unavailable");
        }

        if (mentorshipRequestRepository.existsByRequesterIdAndMentorIdAndStatus(userId, alumniId, "PENDING")) {
            throw new RuntimeException("You already have a pending request for this mentor");
        }

        MentorshipRequest request = new MentorshipRequest();
        request.setRequester(requester);
        request.setMentor(mentor);
        request.setMessage(message);
        
        mentorshipRequestRepository.save(request);
        return mapToRequestResponse(request);
    }

    @Override
    public List<MentorshipRequestResponse> getReceivedRequests(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getAlumni() == null) {
            return List.of();
        }

        return mentorshipRequestRepository.findByMentorId(user.getAlumni().getId())
                .stream()
                .map(this::mapToRequestResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MentorshipRequestResponse> getSentRequests(Integer userId) {
        return mentorshipRequestRepository.findByRequesterId(userId)
                .stream()
                .map(this::mapToRequestResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MentorshipRequestResponse updateRequestStatus(Integer userId, Integer requestId, String status) {
        MentorshipRequest request = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Only the mentor can accept/reject
        if (!request.getMentor().getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to respond to this request");
        }

        request.setStatus(status.toUpperCase());
        mentorshipRequestRepository.save(request);
        return mapToRequestResponse(request);
    }

    private MentorshipResponse mapToMentorshipResponse(Alumni alumni) {
        MentorshipResponse res = new MentorshipResponse();
        res.setAlumniId(alumni.getId());
        res.setUserId(alumni.getUser().getId());
        res.setName(alumni.getUser().getFullName());
        res.setIndustry(alumni.getIndustry());
        res.setCurrentCompany(alumni.getCurrentCompany());
        res.setAvailable(alumni.isAvailableForMentorship());
        return res;
    }

    private MentorshipRequestResponse mapToRequestResponse(MentorshipRequest request) {
        MentorshipRequestResponse res = new MentorshipRequestResponse();
        res.setId(request.getId());
        res.setRequesterId(request.getRequester().getId());
        res.setRequesterName(request.getRequester().getFullName());
        res.setMentorId(request.getMentor().getId());
        res.setMentorName(request.getMentor().getUser().getFullName());
        res.setStatus(request.getStatus());
        res.setMessage(request.getMessage());
        res.setCreatedAt(request.getCreatedAt().format(DATE_FORMATTER));
        return res;
    }
}
