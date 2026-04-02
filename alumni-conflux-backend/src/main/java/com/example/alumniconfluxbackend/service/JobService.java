package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.request.JobApplicationRequest;
import com.example.alumniconfluxbackend.dto.request.JobRequest;
import com.example.alumniconfluxbackend.dto.response.JobApplicationResponse;
import com.example.alumniconfluxbackend.dto.response.JobResponse;

import java.util.List;

public interface JobService {
    JobResponse createJob(Integer userId, JobRequest request);
    JobResponse updateJob(Integer userId, Integer jobId, JobRequest request);
    void deleteJob(Integer userId, Integer jobId);
    JobResponse getJobById(Integer jobId);
    List<JobResponse> getAllJobs();
    List<JobResponse> getJobsByAlumni(Integer userId);
    List<JobResponse> searchJobsByTitle(String title);
    JobApplicationResponse applyForJob(Integer userId, Integer jobId, JobApplicationRequest request);
    List<JobApplicationResponse> getApplicationsForJob(Integer userId, Integer jobId);
    List<JobApplicationResponse> getMyApplications(Integer userId);
}
