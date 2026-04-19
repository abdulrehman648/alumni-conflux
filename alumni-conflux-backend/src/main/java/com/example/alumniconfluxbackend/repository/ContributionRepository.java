package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.Contribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, Integer> {
    List<Contribution> findByCampaignId(Integer campaignId);
    List<Contribution> findByAlumniId(Integer alumniId);
    List<Contribution> findByAlumniUserId(Integer userId);
}
