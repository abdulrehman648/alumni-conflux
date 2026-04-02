package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.JobApplicationRequest;
import com.example.alumniconfluxbackend.dto.request.JobRequest;
import com.example.alumniconfluxbackend.dto.response.JobApplicationResponse;
import com.example.alumniconfluxbackend.dto.response.JobResponse;
import com.example.alumniconfluxbackend.facade.JobFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobFacade jobFacade;

    public JobController(JobFacade jobFacade) {
        this.jobFacade = jobFacade;
    }

    // Alumni posts a new job
    // POST /api/jobs/{userId}
    @PostMapping("/{userId}")
    public ResponseEntity<JobResponse> createJob(
            @PathVariable Integer userId,
            @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobFacade.createJob(userId, request));
    }

    // Alumni updates their job
    // PUT /api/jobs/{userId}/{jobId}
    @PutMapping("/{userId}/{jobId}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Integer userId,
            @PathVariable Integer jobId,
            @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobFacade.updateJob(userId, jobId, request));
    }

    // Alumni deletes their job
    // DELETE /api/jobs/{userId}/{jobId}
    @DeleteMapping("/{userId}/{jobId}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Integer userId,
            @PathVariable Integer jobId) {
        jobFacade.deleteJob(userId, jobId);
        return ResponseEntity.noContent().build();
    }

    // Get a single job by id (public)
    // GET /api/jobs/{jobId}
    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Integer jobId) {
        return ResponseEntity.ok(jobFacade.getJobById(jobId));
    }

    // Get all posted jobs (public – for browse/feed)
    // GET /api/jobs
    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobFacade.getAllJobs());
    }

    // Alumni gets all jobs they posted
    // GET /api/jobs/alumni/{userId}
    @GetMapping("/alumni/{userId}")
    public ResponseEntity<List<JobResponse>> getJobsByAlumni(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(jobFacade.getJobsByAlumni(userId));
    }

    // Search jobs by title (public)
    // GET /api/jobs/search?title=...
    @GetMapping("/search")
    public ResponseEntity<List<JobResponse>> searchJobsByTitle(
            @RequestParam String title) {
        return ResponseEntity.ok(jobFacade.searchJobsByTitle(title));
    }

    // Alumni or Student applies to a job
    // POST /api/jobs/{jobId}/apply/{userId}
    @PostMapping("/{jobId}/apply/{userId}")
    public ResponseEntity<JobApplicationResponse> applyForJob(
            @PathVariable Integer jobId,
            @PathVariable Integer userId,
            @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(jobFacade.applyForJob(userId, jobId, request));
    }

    // Alumni views all applications on their job
    // GET /api/jobs/{jobId}/applications/{userId}
    @GetMapping("/{jobId}/applications/{userId}")
    public ResponseEntity<List<JobApplicationResponse>> getApplicationsForJob(
            @PathVariable Integer jobId,
            @PathVariable Integer userId) {
        return ResponseEntity.ok(jobFacade.getApplicationsForJob(userId, jobId));
    }

    // User (alumni/student) views all jobs they have applied to
    // GET /api/jobs/applications/my/{userId}
    @GetMapping("/applications/my/{userId}")
    public ResponseEntity<List<JobApplicationResponse>> getMyApplications(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(jobFacade.getMyApplications(userId));
    }
}
