package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.dto.request.JobRequest;
import com.example.alumniconfluxbackend.dto.response.JobApplicationResponse;
import com.example.alumniconfluxbackend.dto.response.JobResponse;
import com.example.alumniconfluxbackend.service.JobService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JobFacade {

    private final JobService jobService;

    public JobFacade(JobService jobService) {
        this.jobService = jobService;
    }

    public JobResponse createJob(Integer userId, JobRequest request) {
        return jobService.createJob(userId, request);
    }

    public JobResponse updateJob(Integer userId, Integer jobId, JobRequest request) {
        return jobService.updateJob(userId, jobId, request);
    }

    public void deleteJob(Integer userId, Integer jobId) {
        jobService.deleteJob(userId, jobId);
    }

    public JobResponse getJobById(Integer jobId) {
        return jobService.getJobById(jobId);
    }

    public List<JobResponse> getAllJobs() {
        return jobService.getAllJobs();
    }

    public List<JobResponse> getJobsByAlumni(Integer userId) {
        return jobService.getJobsByAlumni(userId);
    }

    public JobApplicationResponse applyForJob(Integer userId, Integer jobId) {
        return jobService.applyForJob(userId, jobId);
    }

    public List<JobApplicationResponse> getApplicationsForJob(Integer userId, Integer jobId) {
        return jobService.getApplicationsForJob(userId, jobId);
    }

    public List<JobApplicationResponse> getMyApplications(Integer userId) {
        return jobService.getMyApplications(userId);
    }
}
