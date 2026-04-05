package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.CampaignRequest;
import com.example.alumniconfluxbackend.dto.response.CampaignResponse;
import com.example.alumniconfluxbackend.dto.response.ContributionResponse;
import com.example.alumniconfluxbackend.service.CampaignService;
import com.example.alumniconfluxbackend.util.ContributionStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/campaigns")
public class AdminCampaignController {

    private final CampaignService campaignService;

    public AdminCampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @PostMapping
    public ResponseEntity<CampaignResponse> createCampaign(@RequestBody CampaignRequest request) {
        return ResponseEntity.ok(campaignService.createCampaign(request));
    }

    @GetMapping
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<List<ContributionResponse>> getCampaignContributions(@PathVariable Integer id) {
        return ResponseEntity.ok(campaignService.getCampaignContributions(id));
    }

    @PutMapping("/contributions/{contributionId}/verify")
    public ResponseEntity<ContributionResponse> verifyContribution(
            @PathVariable Integer contributionId,
            @RequestParam ContributionStatus status) {
        return ResponseEntity.ok(campaignService.verifyContribution(contributionId, status));
    }
}
