package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.request.JobApplicationRequest;
import com.example.alumniconfluxbackend.dto.request.JobRequest;
import com.example.alumniconfluxbackend.dto.response.JobApplicationResponse;
import com.example.alumniconfluxbackend.dto.response.JobResponse;
import com.example.alumniconfluxbackend.model.Job;
import com.example.alumniconfluxbackend.model.JobApplication;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.repository.JobApplicationRepository;
import com.example.alumniconfluxbackend.repository.JobRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.JobService;
import com.example.alumniconfluxbackend.util.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobServiceImpl implements JobService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    public JobServiceImpl(JobRepository jobRepository,
                          JobApplicationRepository jobApplicationRepository,
                          UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public JobResponse createJob(Integer userId, JobRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ALUMNI || user.getAlumni() == null) {
            throw new RuntimeException("Only ALUMNI can post jobs");
        }

        Job job = new Job();
        job.setAlumni(user.getAlumni());
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getAlumni() == null) {
            return List.of();
        }
        return jobRepository.findByAlumniId(user.getAlumni().getId())
                .stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobResponse> searchJobsByTitle(String title) {
        return jobRepository.findByTitleContainingIgnoreCase(title)
                .stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());
    }

    @Override
    public JobApplicationResponse applyForJob(Integer userId, Integer jobId, JobApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getAlumni().getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot apply to your own job");
        }

        if (jobApplicationRepository.existsByJobIdAndApplicantId(jobId, userId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setApplicant(user);
        application.setResumeUrl(request.getResumeUrl());

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
        return jobApplicationRepository.findByApplicantId(userId)
                .stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

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
        res.setCreatedAt(job.getCreatedAt() != null
                ? job.getCreatedAt().format(DATE_FORMATTER) : null);
        res.setAlumniId(job.getAlumni().getId());
        res.setAlumniUserId(job.getAlumni().getUser().getId());
        res.setAlumniName(job.getAlumni().getUser().getFullName());
        return res;
    }

    private JobApplicationResponse mapToApplicationResponse(JobApplication app) {
        JobApplicationResponse res = new JobApplicationResponse();
        res.setId(app.getId());
        res.setJobId(app.getJob().getId());
        res.setJobTitle(app.getJob().getTitle());
        res.setCompany(app.getJob().getCompany());
        
        User applicant = app.getApplicant();
        res.setApplicantUserId(applicant.getId());
        res.setApplicantName(applicant.getFullName());
        res.setApplicantRole(applicant.getRole().toString());
        
        // Link to profile ID if available
        if (applicant.getStudent() != null) {
            res.setApplicantId(applicant.getStudent().getId());
        } else if (applicant.getAlumni() != null) {
            res.setApplicantId(applicant.getAlumni().getId());
        }

        res.setStatus(app.getStatus());
        res.setResumeUrl(app.getResumeUrl());
        res.setAppliedAt(app.getAppliedAt() != null
                ? app.getAppliedAt().format(DATE_FORMATTER) : null);
        return res;
    }
}
