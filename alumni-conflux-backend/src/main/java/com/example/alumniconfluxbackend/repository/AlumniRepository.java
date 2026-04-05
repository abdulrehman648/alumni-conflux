package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.Alumni;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlumniRepository extends JpaRepository<Alumni, Integer> {
    Optional<Alumni> findByUserId(Integer userId);
    List<Alumni> findByIsAvailableForMentorshipTrue();
}
