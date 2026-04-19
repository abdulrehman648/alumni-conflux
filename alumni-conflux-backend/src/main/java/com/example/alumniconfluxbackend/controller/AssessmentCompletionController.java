package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.AssessmentCompletionRequest;
import com.example.alumniconfluxbackend.model.AssessmentCompletion;
import com.example.alumniconfluxbackend.repository.AssessmentCompletionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/assessment/completion")
@CrossOrigin(origins = "*")
public class AssessmentCompletionController {

    private final AssessmentCompletionRepository completionRepository;

    public AssessmentCompletionController(AssessmentCompletionRepository completionRepository) {
        this.completionRepository = completionRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCompletion(@PathVariable Integer userId) {
        Optional<AssessmentCompletion> completion = completionRepository.findByUserId(userId);
        if (completion.isPresent()) {
            return ResponseEntity.ok(completion.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> saveCompletion(@RequestBody AssessmentCompletionRequest request) {
        try {
            if (request.getUserId() == null) {
                return ResponseEntity.badRequest().body("UserId is required");
            }

            AssessmentCompletion completion = completionRepository
                    .findByUserId(request.getUserId())
                    .orElse(new AssessmentCompletion());

            completion.setUserId(request.getUserId());
            completion.setProfileTags(request.getProfileTags() != null ? String.join(",", request.getProfileTags()) : "");
            completion.setProfileSummary(request.getProfileSummary() != null ? request.getProfileSummary() : "");
            completion.setAssessmentVersion(request.getAssessmentVersion() != null ? request.getAssessmentVersion() : 1);
            
            // Ensure completedAt is set
            if (completion.getCompletedAt() == null) {
                completion.setCompletedAt(LocalDateTime.now());
            }

            AssessmentCompletion saved = completionRepository.save(completion);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving assessment completion: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteCompletion(@PathVariable Integer userId) {
        Optional<AssessmentCompletion> completion = completionRepository.findByUserId(userId);
        if (completion.isPresent()) {
            completionRepository.delete(completion.get());
            return ResponseEntity.ok().body("Completion record deleted");
        }
        return ResponseEntity.notFound().build();
    }
}
