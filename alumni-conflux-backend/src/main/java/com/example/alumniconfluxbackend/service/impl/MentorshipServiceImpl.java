package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.response.MentorshipRequestResponse;
import com.example.alumniconfluxbackend.dto.response.MentorshipResponse;
import com.example.alumniconfluxbackend.model.Alumni;
import com.example.alumniconfluxbackend.model.MentorshipRequest;
import com.example.alumniconfluxbackend.model.Student;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.repository.AlumniRepository;
import com.example.alumniconfluxbackend.repository.MentorshipRequestRepository;
import com.example.alumniconfluxbackend.repository.StudentRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.MentorshipChatService;
import com.example.alumniconfluxbackend.service.MentorshipService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class MentorshipServiceImpl implements MentorshipService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AlumniRepository alumniRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final MentorshipChatService mentorshipChatService;

    public MentorshipServiceImpl(AlumniRepository alumniRepository,
            MentorshipRequestRepository mentorshipRequestRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            MentorshipChatService mentorshipChatService) {
        this.alumniRepository = alumniRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.mentorshipChatService = mentorshipChatService;
    }

    @Override
    public List<MentorshipResponse> getAvailableMentors() {
        return alumniRepository.findByIsAvailableForMentorshipTrue()
                .stream()
                .filter(this::isAlumniMentorReady)
                .map(this::mapToMentorshipResponse)
                .collect(Collectors.toList());
    }

        @Override
        public List<MentorshipResponse> getRecommendedMentors(Integer userId) {
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student profile not found. Please complete your profile first."));

        return alumniRepository.findByIsAvailableForMentorshipTrue()
            .stream()
            .filter(this::isAlumniMentorReady)
            .map(alumni -> buildRecommendation(student, alumni))
            .sorted(Comparator.comparingInt((MentorshipResponse mentor) -> mentor.getMatchScore() != null ? mentor.getMatchScore() : 0)
                .reversed()
                .thenComparing(MentorshipResponse::getName, String.CASE_INSENSITIVE_ORDER))
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

        if (isAvailable && !isAlumniMentorReady(alumni)) {
            throw new RuntimeException("Complete alumni details and mentor readiness before enabling mentorship");
        }

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

        if (!request.getMentor().getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to respond to this request");
        }

        request.setStatus(status.toUpperCase());
        mentorshipRequestRepository.save(request);

        if ("ACCEPTED".equals(request.getStatus())) {
            mentorshipChatService.ensureConversationForRequest(request);
        }

        return mapToRequestResponse(request);
    }

    private MentorshipResponse mapToMentorshipResponse(Alumni alumni) {
        MentorshipResponse res = new MentorshipResponse();
        res.setId(alumni.getId());
        res.setAlumniId(alumni.getId());
        res.setUserId(alumni.getUser().getId());
        res.setName(alumni.getUser().getFullName());
        res.setIndustry(alumni.getIndustry());
        res.setCurrentCompany(alumni.getCurrentCompany());
        res.setAvailable(alumni.isAvailableForMentorship());
        return res;
    }

    private MentorshipResponse buildRecommendation(Student student, Alumni alumni) {
        MentorshipResponse response = mapToMentorshipResponse(alumni);
        RecommendationScore recommendationScore = scoreMatch(student, alumni);
        response.setMatchScore(recommendationScore.score);
        response.setMatchReasons(recommendationScore.reasons);
        return response;
    }

    private RecommendationScore scoreMatch(Student student, Alumni alumni) {
        List<String> studentSkills = normalize(student.getDetails() != null ? student.getDetails().getSkills() : Collections.emptyList());
        List<String> studentPreferences = normalize(student.getDetails() != null ? student.getDetails().getCareerPreferences() : Collections.emptyList());
        List<String> mentorSkills = normalize(alumni.getDetails() != null ? alumni.getDetails().getSkills() : Collections.emptyList());
        List<String> mentorCareerPath = normalize(alumni.getDetails() != null ? alumni.getDetails().getCareerPath() : Collections.emptyList());

        Set<String> sharedSkills = intersection(studentSkills, mentorSkills);
        Set<String> sharedCareerSignals = new LinkedHashSet<>();

        for (String preference : studentPreferences) {
            if (mentorCareerPath.contains(preference)
                    || matchesText(preference, alumni.getIndustry())
                    || matchesText(preference, alumni.getCurrentCompany())) {
                sharedCareerSignals.add(preference);
            }
        }

        int score = 10;
        List<String> reasons = new ArrayList<>();

        if (!sharedSkills.isEmpty()) {
            score += Math.min(60, sharedSkills.size() * 15);
            reasons.add("Shared skills: " + String.join(", ", sharedSkills));
        }

        if (!sharedCareerSignals.isEmpty()) {
            score += Math.min(25, sharedCareerSignals.size() * 12);
            reasons.add("Career alignment: " + String.join(", ", sharedCareerSignals));
        }

        if (matchesText(student.getInstitutionName(), alumni.getInstitutionName())) {
            score += 5;
            reasons.add("Same institution background");
        }

        if (matchesText(student.getDetails() != null ? student.getDetails().getDepartment() : null, alumni.getIndustry())) {
            score += 5;
            reasons.add("Aligned field of study and industry");
        }

        score = Math.min(score, 100);

        if (reasons.isEmpty()) {
            reasons.add("Strong available mentor option");
        }

        return new RecommendationScore(score, reasons);
    }

    private List<String> normalize(List<String> values) {
        if (values == null) {
            return List.of();
        }

        return values.stream()
                .filter(value -> value != null && !value.trim().isEmpty())
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toList());
    }

    private boolean isAlumniMentorReady(Alumni alumni) {
        if (alumni == null || alumni.getDetails() == null) {
            return false;
        }

        return hasText(alumni.getInstitutionName())
                && alumni.getGraduationYear() != null
                && hasText(alumni.getIndustry())
                && hasText(alumni.getCurrentCompany())
                && hasText(alumni.getDetails().getJobTitle())
                && hasText(alumni.getDetails().getExperienceLevel())
                && hasValues(alumni.getDetails().getSkills());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean hasValues(List<String> values) {
        if (values == null || values.isEmpty()) {
            return false;
        }

        return values.stream().anyMatch(this::hasText);
    }

    private Set<String> intersection(List<String> left, List<String> right) {
        Set<String> shared = new LinkedHashSet<>(left);
        shared.retainAll(new HashSet<>(right));
        return shared;
    }

    private boolean matchesText(String left, String right) {
        if (left == null || right == null) {
            return false;
        }

        String normalizedLeft = left.trim().toLowerCase(Locale.ROOT);
        String normalizedRight = right.trim().toLowerCase(Locale.ROOT);
        return !normalizedLeft.isEmpty() && !normalizedRight.isEmpty()
                && (normalizedLeft.contains(normalizedRight) || normalizedRight.contains(normalizedLeft));
    }

    private static class RecommendationScore {
        private final int score;
        private final List<String> reasons;

        private RecommendationScore(int score, List<String> reasons) {
            this.score = score;
            this.reasons = reasons;
        }
    }

    private MentorshipRequestResponse mapToRequestResponse(MentorshipRequest request) {
        MentorshipRequestResponse res = new MentorshipRequestResponse();
        res.setId(request.getId());
        res.setRequesterId(request.getRequester().getId());
        res.setRequesterName(request.getRequester().getFullName());
        res.setMentorId(request.getMentor().getId());
        res.setMentorName(request.getMentor().getUser().getFullName());
        mentorshipChatService.findConversationByRequestId(request.getId())
            .ifPresent(conversation -> res.setConversationId(conversation.getId()));
        res.setStatus(request.getStatus());
        res.setMessage(request.getMessage());
        res.setCreatedAt(request.getCreatedAt().format(DATE_FORMATTER));
        return res;
    }

    @Override
    public java.util.Optional<Integer> findConversationIdByRequestId(Integer requestId) {
        return mentorshipChatService.findConversationByRequestId(requestId)
                .map(conversation -> conversation.getId());
    }
}
