package com.example.alumniconfluxbackend.dto.request;

import com.example.alumniconfluxbackend.model.details.AccountDetails;
import com.example.alumniconfluxbackend.util.CampaignType;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class CampaignRequest {
    private String title;
    private String description;
    private CampaignType type;
    private AccountDetails accountDetails;
    private Double targetAmount;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deadline;
    private Integer createdById;

    // Getters and Setters
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
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public Integer getCreatedById() { return createdById; }
    public void setCreatedById(Integer createdById) { this.createdById = createdById; }
}
