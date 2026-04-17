package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.AssessmentQuestion;
import com.example.alumniconfluxbackend.util.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Integer> {

    long countByAssessmentType(AssessmentType assessmentType);

    boolean existsByAssessmentTypeAndDisplayOrder(AssessmentType assessmentType, Integer displayOrder);

    List<AssessmentQuestion> findByAssessmentTypeAndActiveTrueOrderByDisplayOrderAsc(AssessmentType assessmentType);
}
