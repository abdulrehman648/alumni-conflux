package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.AssessmentCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssessmentCompletionRepository extends JpaRepository<AssessmentCompletion, Integer> {
    Optional<AssessmentCompletion> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);
}
