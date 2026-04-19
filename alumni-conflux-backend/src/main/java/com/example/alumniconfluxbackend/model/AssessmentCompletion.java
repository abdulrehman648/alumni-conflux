package com.example.alumniconfluxbackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_completions")
public class AssessmentCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String profileTags;

    @Column(columnDefinition = "TEXT")
    private String profileSummary;

    @Column(nullable = false, name = "version")
    private Integer assessmentVersion;

    @PrePersist
    protected void onCreate() {
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }

    public AssessmentCompletion() {
    }

    public AssessmentCompletion(Integer userId, LocalDateTime completedAt, String profileTags,
            String profileSummary, Integer assessmentVersion) {
        this.userId = userId;
        this.completedAt = completedAt;
        this.profileTags = profileTags;
        this.profileSummary = profileSummary;
        this.assessmentVersion = assessmentVersion;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getProfileTags() {
        return profileTags;
    }

    public void setProfileTags(String profileTags) {
        this.profileTags = profileTags;
    }

    public String getProfileSummary() {
        return profileSummary;
    }

    public void setProfileSummary(String profileSummary) {
        this.profileSummary = profileSummary;
    }

    public Integer getAssessmentVersion() {
        return assessmentVersion;
    }

    public void setAssessmentVersion(Integer assessmentVersion) {
        this.assessmentVersion = assessmentVersion;
    }
}
