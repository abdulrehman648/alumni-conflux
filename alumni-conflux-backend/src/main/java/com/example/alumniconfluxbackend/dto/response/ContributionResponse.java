package com.example.alumniconfluxbackend.dto.response;

import com.example.alumniconfluxbackend.util.ContributionStatus;
import java.time.LocalDateTime;

public class ContributionResponse {
    private Integer id;
    private Integer campaignId;
    private String campaignTitle;
    private String alumniName;
    private Double amount;
    private String screenshotUrl;
    private String transactionId;
    private String note;
    private ContributionStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getCampaignId() { return campaignId; }
    public void setCampaignId(Integer campaignId) { this.campaignId = campaignId; }
    public String getCampaignTitle() { return campaignTitle; }
    public void setCampaignTitle(String campaignTitle) { this.campaignTitle = campaignTitle; }
    public String getAlumniName() { return alumniName; }
    public void setAlumniName(String alumniName) { this.alumniName = alumniName; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getScreenshotUrl() { return screenshotUrl; }
    public void setScreenshotUrl(String screenshotUrl) { this.screenshotUrl = screenshotUrl; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public ContributionStatus getStatus() { return status; }
    public void setStatus(ContributionStatus status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
