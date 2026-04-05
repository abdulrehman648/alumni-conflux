package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.ContributionRequest;
import com.example.alumniconfluxbackend.dto.response.CampaignResponse;
import com.example.alumniconfluxbackend.dto.response.ContributionResponse;
import com.example.alumniconfluxbackend.service.CampaignService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/alumni/campaigns")
public class AlumniCampaignController {

    private final CampaignService campaignService;

    public AlumniCampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public ResponseEntity<List<CampaignResponse>> getActiveCampaigns() {
        return ResponseEntity.ok(campaignService.getActiveCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignResponse> getCampaignById(@PathVariable Integer id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @PostMapping(value = "/{id}/contribute", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContributionResponse> submitContribution(
            @PathVariable Integer id,
            @RequestParam("amount") Double amount,
            @RequestParam("alumniId") Integer alumniId,
            @RequestParam(value = "transactionId", required = false) String transactionId,
            @RequestParam(value = "note", required = false) String note,
            @RequestPart("screenshot") MultipartFile screenshot) {
        ContributionRequest request = new ContributionRequest();
        request.setAmount(amount);
        request.setAlumniId(alumniId);
        request.setTransactionId(transactionId);
        request.setNote(note);
        return ResponseEntity.ok(campaignService.submitContribution(id, request, screenshot));
    }

    @GetMapping("/my-contributions/{alumniId}")
    public ResponseEntity<List<ContributionResponse>> getMyContributions(@PathVariable Integer alumniId) {
        return ResponseEntity.ok(campaignService.getAlumniContributions(alumniId));
    }
}
