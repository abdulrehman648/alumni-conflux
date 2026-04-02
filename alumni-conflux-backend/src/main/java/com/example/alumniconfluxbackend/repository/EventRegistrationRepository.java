package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Integer> {
    List<EventRegistration> findByEventId(Integer eventId);
    List<EventRegistration> findByStudent_StudentId(Integer studentId);
    List<EventRegistration> findByAlumniId(Integer alumniId);
    boolean existsByEventIdAndStudent_StudentId(Integer eventId, Integer studentId);
    boolean existsByEventIdAndAlumniId(Integer eventId, Integer alumniId);
    long countByEventId(Integer eventId);
}
