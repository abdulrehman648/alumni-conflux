package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.request.CampaignRequest;
import com.example.alumniconfluxbackend.dto.request.ContributionRequest;
import com.example.alumniconfluxbackend.dto.response.CampaignResponse;
import com.example.alumniconfluxbackend.dto.response.ContributionResponse;
import com.example.alumniconfluxbackend.util.ContributionStatus;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface CampaignService {
    // Admin features
    CampaignResponse createCampaign(CampaignRequest request);
    List<CampaignResponse> getAllCampaigns();
    List<ContributionResponse> getCampaignContributions(Integer campaignId);
    ContributionResponse verifyContribution(Integer contributionId, ContributionStatus status);

    // Alumni features
    List<CampaignResponse> getActiveCampaigns();
    CampaignResponse getCampaignById(Integer campaignId);
    ContributionResponse submitContribution(Integer campaignId, ContributionRequest request, MultipartFile screenshot);
    List<ContributionResponse> getAlumniContributions(Integer alumniId);
}
