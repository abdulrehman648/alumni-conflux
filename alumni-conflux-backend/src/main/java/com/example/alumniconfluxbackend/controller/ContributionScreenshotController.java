package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.model.Contribution;
import com.example.alumniconfluxbackend.repository.ContributionRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/campaigns/contribution")
public class ContributionScreenshotController {

    private final ContributionRepository contributionRepository;

    public ContributionScreenshotController(ContributionRepository contributionRepository) {
        this.contributionRepository = contributionRepository;
    }

    @GetMapping("/{id}/screenshot")
    public ResponseEntity<byte[]> getScreenshot(@PathVariable Integer id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElse(null);

        if (contribution == null || contribution.getScreenshotData() == null) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        String contentType = contribution.getScreenshotType() != null 
                ? contribution.getScreenshotType() 
                : "image/jpeg";
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setCacheControl("max-age=604800"); // 1 week cache

        return new ResponseEntity<>(contribution.getScreenshotData(), headers, HttpStatus.OK);
    }
}
