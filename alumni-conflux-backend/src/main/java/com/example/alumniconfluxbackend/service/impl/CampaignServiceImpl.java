package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.request.CampaignRequest;
import com.example.alumniconfluxbackend.dto.request.ContributionRequest;
import com.example.alumniconfluxbackend.dto.response.CampaignResponse;
import com.example.alumniconfluxbackend.dto.response.ContributionResponse;
import com.example.alumniconfluxbackend.model.Alumni;
import com.example.alumniconfluxbackend.model.Campaign;
import com.example.alumniconfluxbackend.model.Contribution;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.model.details.AccountDetails;
import com.example.alumniconfluxbackend.repository.AlumniRepository;
import com.example.alumniconfluxbackend.repository.CampaignRepository;
import com.example.alumniconfluxbackend.repository.ContributionRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.CampaignService;
import com.example.alumniconfluxbackend.service.FileStorageService;
import com.example.alumniconfluxbackend.util.ContributionStatus;
import com.example.alumniconfluxbackend.util.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CampaignServiceImpl implements CampaignService {

    private final CampaignRepository campaignRepository;
    private final ContributionRepository contributionRepository;
    private final UserRepository userRepository;
    private final AlumniRepository alumniRepository;
    private final FileStorageService fileStorageService;

    public CampaignServiceImpl(CampaignRepository campaignRepository,
            ContributionRepository contributionRepository,
            UserRepository userRepository,
            AlumniRepository alumniRepository,
            FileStorageService fileStorageService) {
        this.campaignRepository = campaignRepository;
        this.contributionRepository = contributionRepository;
        this.userRepository = userRepository;
        this.alumniRepository = alumniRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public CampaignResponse createCampaign(CampaignRequest request) {
        User creator = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (creator.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only Admins can create campaigns");
        }

        Campaign campaign = new Campaign();
        campaign.setTitle(request.getTitle());
        campaign.setDescription(request.getDescription());
        campaign.setType(request.getType());
        campaign.setAccountDetails(request.getAccountDetails());
        campaign.setTargetAmount(request.getTargetAmount());
        campaign.setDeadline(request.getDeadline());
        campaign.setCreatedBy(creator);

        campaignRepository.save(campaign);
        return mapToCampaignResponse(campaign);
    }

    @Override
    public List<CampaignResponse> getAllCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::mapToCampaignResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContributionResponse> getCampaignContributions(Integer campaignId) {
        return contributionRepository.findByCampaignId(campaignId).stream()
                .map(this::mapToContributionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ContributionResponse verifyContribution(Integer contributionId, ContributionStatus status) {
        Contribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new RuntimeException("Contribution not found"));

        if (contribution.getStatus() != ContributionStatus.PENDING) {
            throw new RuntimeException("Contribution is already processed");
        }

        contribution.setStatus(status);
        contribution.setVerifiedAt(LocalDateTime.now());

        if (status == ContributionStatus.VERIFIED) {
            Campaign campaign = contribution.getCampaign();
            campaign.setCollectedAmount(campaign.getCollectedAmount() + contribution.getAmount());
            campaignRepository.save(campaign);
        }

        contributionRepository.save(contribution);
        return mapToContributionResponse(contribution);
    }

    @Override
    public List<CampaignResponse> getActiveCampaigns() {
        return campaignRepository.findAll().stream()
                .filter(c -> c.getDeadline() == null || c.getDeadline().isAfter(LocalDateTime.now()))
                .map(this::mapToCampaignResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CampaignResponse getCampaignById(Integer campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        return mapToCampaignResponse(campaign);
    }

    @Override
    public ContributionResponse submitContribution(Integer campaignId, ContributionRequest request,
            MultipartFile screenshot) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        Alumni alumni = alumniRepository.findById(request.getAlumniId())
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        String screenshotUrl = fileStorageService.storeFile(screenshot);

        Contribution contribution = new Contribution();
        contribution.setCampaign(campaign);
        contribution.setAlumni(alumni);
        contribution.setAmount(request.getAmount());
        contribution.setTransactionId(request.getTransactionId());
        contribution.setNote(request.getNote());
        contribution.setScreenshotUrl("/api/uploads/profile_pictures/" + screenshotUrl); // Matches FileStorageService
                                                                                         // current path
        contribution.setStatus(ContributionStatus.PENDING);

        contributionRepository.save(contribution);
        return mapToContributionResponse(contribution);
    }

    @Override
    public List<ContributionResponse> getAlumniContributions(Integer alumniId) {
        return contributionRepository.findByAlumniId(alumniId).stream()
                .map(this::mapToContributionResponse)
                .collect(Collectors.toList());
    }

    private CampaignResponse mapToCampaignResponse(Campaign campaign) {
        CampaignResponse res = new CampaignResponse();
        res.setId(campaign.getId());
        res.setTitle(campaign.getTitle());
        res.setDescription(campaign.getDescription());
        res.setType(campaign.getType());
        res.setAccountDetails(campaign.getAccountDetails());
        res.setTargetAmount(campaign.getTargetAmount());
        res.setCollectedAmount(campaign.getCollectedAmount());
        res.setDeadline(campaign.getDeadline());
        res.setCreatedBy(campaign.getCreatedBy().getFullName());
        res.setCreatedAt(campaign.getCreatedAt());
        return res;
    }

    private ContributionResponse mapToContributionResponse(Contribution contribution) {
        ContributionResponse res = new ContributionResponse();
        res.setId(contribution.getId());
        res.setCampaignId(contribution.getCampaign().getId());
        res.setCampaignTitle(contribution.getCampaign().getTitle());
        res.setAlumniName(contribution.getAlumni().getUser().getFullName());
        res.setAmount(contribution.getAmount());
        res.setScreenshotUrl(contribution.getScreenshotUrl());
        res.setTransactionId(contribution.getTransactionId());
        res.setNote(contribution.getNote());
        res.setStatus(contribution.getStatus());
        res.setSubmittedAt(contribution.getSubmittedAt());
        res.setVerifiedAt(contribution.getVerifiedAt());
        return res;
    }
}
