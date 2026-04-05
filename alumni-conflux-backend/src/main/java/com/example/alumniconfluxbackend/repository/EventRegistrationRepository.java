package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Integer> {
    List<EventRegistration> findByEventId(Integer eventId);
    List<EventRegistration> findByUserId(Integer userId);
    boolean existsByEventIdAndUserId(Integer eventId, Integer userId);
    long countByEventId(Integer eventId);
}
