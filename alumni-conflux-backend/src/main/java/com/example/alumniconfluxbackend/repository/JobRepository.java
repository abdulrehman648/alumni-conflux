package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Integer> {
    List<Job> findByAlumniId(Integer alumniId);
    List<Job> findByTitleContainingIgnoreCase(String title);
}
