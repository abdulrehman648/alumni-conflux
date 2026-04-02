package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.EventRequest;
import com.example.alumniconfluxbackend.dto.response.EventRegistrationResponse;
import com.example.alumniconfluxbackend.dto.response.EventResponse;
import com.example.alumniconfluxbackend.facade.EventFacade;
import com.example.alumniconfluxbackend.util.EventStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventFacade eventFacade;

    public EventController(EventFacade eventFacade) {
        this.eventFacade = eventFacade;
    }

    // Alumni or Admin requests event creation (Admin-created is automatically
    // approved)
    @PostMapping("/request/{userId}")
    public ResponseEntity<EventResponse> requestEvent(
            @PathVariable Integer userId,
            @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventFacade.createEventRequest(userId, request));
    }

    // Admin approves or rejects event request
    @PatchMapping("/{eventId}/status")
    public ResponseEntity<EventResponse> updateEventStatus(
            @PathVariable Integer eventId,
            @RequestParam EventStatus status) {
        return ResponseEntity.ok(eventFacade.updateEventStatus(eventId, status));
    }

    // Admin views all pending event requests
    @GetMapping("/pending")
    public ResponseEntity<List<EventResponse>> getPendingEventRequests() {
        return ResponseEntity.ok(eventFacade.getPendingEventRequests());
    }

    // Users view available (Approved) events based on their audience
    @GetMapping("/available/{userId}")
    public ResponseEntity<List<EventResponse>> getAvailableEvents(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(eventFacade.getAvailableEvents(userId));
    }

    // User registers for an event
    @PostMapping("/{eventId}/register/{userId}")
    public ResponseEntity<EventRegistrationResponse> registerForEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        return ResponseEntity.ok(eventFacade.registerForEvent(userId, eventId));
    }

    // User views events they created
    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<EventResponse>> getEventsCreatedByUser(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(eventFacade.getEventsCreatedByUser(userId));
    }

    // User views events they have registered for
    @GetMapping("/registered/{userId}")
    public ResponseEntity<List<EventRegistrationResponse>> getEventsRegisteredByUser(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(eventFacade.getEventsRegisteredByUser(userId));
    }

    // View attendees for a specific event (only for the creator or admin)
    @GetMapping("/{eventId}/attendees/{userId}")
    public ResponseEntity<List<EventRegistrationResponse>> getAttendeesForEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        return ResponseEntity.ok(eventFacade.getAttendeesForEvent(userId, eventId));
    }

    // Get a specific event by id
    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventById(
            @PathVariable Integer eventId) {
        return ResponseEntity.ok(eventFacade.getEventById(eventId));
    }
}
