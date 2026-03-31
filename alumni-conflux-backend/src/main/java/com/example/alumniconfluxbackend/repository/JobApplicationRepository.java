package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    List<JobApplication> findByJobId(Integer jobId);
    List<JobApplication> findByApplicantId(Integer applicantId);
    Optional<JobApplication> findByJobIdAndApplicantId(Integer jobId, Integer applicantId);
    boolean existsByJobIdAndApplicantId(Integer jobId, Integer applicantId);
}
