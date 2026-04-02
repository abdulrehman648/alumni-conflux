package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.dto.request.EventRequest;
import com.example.alumniconfluxbackend.dto.response.EventRegistrationResponse;
import com.example.alumniconfluxbackend.dto.response.EventResponse;
import com.example.alumniconfluxbackend.service.EventService;
import com.example.alumniconfluxbackend.util.EventStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EventFacade {

    private final EventService eventService;

    public EventFacade(EventService eventService) {
        this.eventService = eventService;
    }

    public EventResponse createEventRequest(Integer userId, EventRequest request) {
        return eventService.createEventRequest(userId, request);
    }

    public EventResponse updateEventStatus(Integer eventId, EventStatus status) {
        return eventService.updateEventStatus(eventId, status);
    }

    public List<EventResponse> getPendingEventRequests() {
        return eventService.getPendingEventRequests();
    }

    public List<EventResponse> getAvailableEvents(Integer userId) {
        return eventService.getAvailableEvents(userId);
    }

    public List<EventResponse> getEventsCreatedByUser(Integer userId) {
        return eventService.getEventsCreatedByUser(userId);
    }

    public EventRegistrationResponse registerForEvent(Integer userId, Integer eventId) {
        return eventService.registerForEvent(userId, eventId);
    }

    public List<EventRegistrationResponse> getEventsRegisteredByUser(Integer userId) {
        return eventService.getEventsRegisteredByUser(userId);
    }

    public List<EventRegistrationResponse> getAttendeesForEvent(Integer userId, Integer eventId) {
        return eventService.getAttendeesForEvent(userId, eventId);
    }

    public EventResponse getEventById(Integer eventId) {
        return eventService.getEventById(eventId);
    }
}
