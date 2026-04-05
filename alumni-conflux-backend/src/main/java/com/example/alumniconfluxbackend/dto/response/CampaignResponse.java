package com.example.alumniconfluxbackend.dto.response;

import com.example.alumniconfluxbackend.model.details.AccountDetails;
import com.example.alumniconfluxbackend.util.CampaignType;
import java.time.LocalDateTime;

public class CampaignResponse {
    private Integer id;
    private String title;
    private String description;
    private CampaignType type;
    private AccountDetails accountDetails;
    private Double targetAmount;
    private Double collectedAmount;
    private LocalDateTime deadline;
    private String createdBy;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public CampaignType getType() { return type; }
    public void setType(CampaignType type) { this.type = type; }
    public AccountDetails getAccountDetails() { return accountDetails; }
    public void setAccountDetails(AccountDetails accountDetails) { this.accountDetails = accountDetails; }
    public Double getTargetAmount() { return targetAmount; }
    public void setTargetAmount(Double targetAmount) { this.targetAmount = targetAmount; }
    public Double getCollectedAmount() { return collectedAmount; }
    public void setCollectedAmount(Double collectedAmount) { this.collectedAmount = collectedAmount; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
