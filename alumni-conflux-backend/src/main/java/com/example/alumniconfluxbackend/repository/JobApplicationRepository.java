package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    List<JobApplication> findByJobId(Integer jobId);
    List<JobApplication> findByApplicantId(Integer userId);
    boolean existsByJobIdAndApplicantId(Integer jobId, Integer userId);
}
