package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.request.JobRequest;
import com.example.alumniconfluxbackend.dto.response.JobApplicationResponse;
import com.example.alumniconfluxbackend.dto.response.JobResponse;
import com.example.alumniconfluxbackend.model.Alumni;
import com.example.alumniconfluxbackend.model.Job;
import com.example.alumniconfluxbackend.model.JobApplication;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.repository.AlumniRepository;
import com.example.alumniconfluxbackend.repository.JobApplicationRepository;
import com.example.alumniconfluxbackend.repository.JobRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.JobService;
import com.example.alumniconfluxbackend.util.Role;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final AlumniRepository alumniRepository;
    private final UserRepository userRepository;

    public JobServiceImpl(JobRepository jobRepository,
                          JobApplicationRepository jobApplicationRepository,
                          AlumniRepository alumniRepository,
                          UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.alumniRepository = alumniRepository;
        this.userRepository = userRepository;
    }

    @Override
    public JobResponse createJob(Integer userId, JobRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ALUMNI) {
            throw new RuntimeException("Only ALUMNI can post jobs");
        }

        Alumni alumni = alumniRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Alumni profile not found"));

        Job job = new Job();
        job.setAlumni(alumni);
        mapRequestToJob(request, job);

        jobRepository.save(job);
        return mapToJobResponse(job);
    }

    @Override
    public JobResponse updateJob(Integer userId, Integer jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getAlumni().getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to update this job");
        }

        mapRequestToJob(request, job);
        jobRepository.save(job);
        return mapToJobResponse(job);
    }

    @Override
    public void deleteJob(Integer userId, Integer jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getAlumni().getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this job");
        }

        jobRepository.delete(job);
    }

    @Override
    public JobResponse getJobById(Integer jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return mapToJobResponse(job);
    }

    @Override
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll()
                .stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobResponse> getJobsByAlumni(Integer userId) {
        Alumni alumni = alumniRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Alumni profile not found"));

        return jobRepository.findByAlumniId(alumni.getId())
                .stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());
    }

    @Override
    public JobApplicationResponse applyForJob(Integer userId, Integer jobId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (jobApplicationRepository.existsByJobIdAndApplicantId(jobId, userId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setApplicant(user);

        jobApplicationRepository.save(application);
        return mapToApplicationResponse(application);
    }

    @Override
    public List<JobApplicationResponse> getApplicationsForJob(Integer userId, Integer jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getAlumni().getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the job poster can view applications");
        }

        return jobApplicationRepository.findByJobId(jobId)
                .stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobApplicationResponse> getMyApplications(Integer userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jobApplicationRepository.findByApplicantId(userId)
                .stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void mapRequestToJob(JobRequest request, Job job) {
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setJobType(request.getJobType());
        job.setSalary(request.getSalary());
        job.setApplyLink(request.getApplyLink());
    }

    private JobResponse mapToJobResponse(Job job) {
        JobResponse res = new JobResponse();
        res.setId(job.getId());
        res.setTitle(job.getTitle());
        res.setDescription(job.getDescription());
        res.setCompany(job.getCompany());
        res.setLocation(job.getLocation());
        res.setJobType(job.getJobType());
        res.setSalary(job.getSalary());
        res.setApplyLink(job.getApplyLink());
        res.setCreatedAt(job.getCreatedAt());
        res.setAlumniId(job.getAlumni().getId());
        res.setAlumniName(job.getAlumni().getUser().getFullName());
        return res;
    }

    private JobApplicationResponse mapToApplicationResponse(JobApplication app) {
        JobApplicationResponse res = new JobApplicationResponse();
        res.setId(app.getId());
        res.setJobId(app.getJob().getId());
        res.setJobTitle(app.getJob().getTitle());
        res.setCompany(app.getJob().getCompany());
        res.setApplicantId(app.getApplicant().getId());
        res.setApplicantName(app.getApplicant().getFullName());
        res.setStatus(app.getStatus());
        res.setAppliedAt(app.getAppliedAt());
        return res;
    }
}
