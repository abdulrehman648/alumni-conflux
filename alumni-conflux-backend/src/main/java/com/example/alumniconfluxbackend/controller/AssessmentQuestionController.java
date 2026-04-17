package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.model.AssessmentQuestion;
import com.example.alumniconfluxbackend.repository.AssessmentQuestionRepository;
import com.example.alumniconfluxbackend.util.AssessmentType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assessment/questions")
@CrossOrigin(origins = "*")
public class AssessmentQuestionController {

    private final AssessmentQuestionRepository assessmentQuestionRepository;

    public AssessmentQuestionController(AssessmentQuestionRepository assessmentQuestionRepository) {
        this.assessmentQuestionRepository = assessmentQuestionRepository;
    }

    @GetMapping("/{assessmentType}")
    public ResponseEntity<List<AssessmentQuestion>> getQuestionsByType(
            @PathVariable AssessmentType assessmentType) {
        return ResponseEntity.ok(
                assessmentQuestionRepository.findByAssessmentTypeAndActiveTrueOrderByDisplayOrderAsc(assessmentType)
        );
    }
}