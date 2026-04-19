package com.example.alumniconfluxbackend.dto.request;

import java.util.List;

public class AssessmentCompletionRequest {
    private Integer userId;
    private List<String> profileTags;
    private String profileSummary;
    private Integer assessmentVersion;

    // Constructors
    public AssessmentCompletionRequest() {
    }

    public AssessmentCompletionRequest(Integer userId, List<String> profileTags, String profileSummary,
            Integer assessmentVersion) {
        this.userId = userId;
        this.profileTags = profileTags;
        this.profileSummary = profileSummary;
        this.assessmentVersion = assessmentVersion;
    }

    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public List<String> getProfileTags() {
        return profileTags;
    }

    public void setProfileTags(List<String> profileTags) {
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
