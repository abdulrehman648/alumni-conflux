package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.Event;
import com.example.alumniconfluxbackend.util.EventStatus;
import com.example.alumniconfluxbackend.util.TargetAudience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {
    
    List<Event> findByStatus(EventStatus status);
    
    @Query("SELECT e FROM Event e WHERE e.status = 'APPROVED' AND (e.targetAudience = 'ALL' OR e.targetAudience = :audience)")
    List<Event> findAvailableEventsForAudience(@Param("audience") TargetAudience audience);
    
    List<Event> findByCreatorId(Integer alumniId);
    List<Event> findByAdminCreatorId(Integer adminId);
}
