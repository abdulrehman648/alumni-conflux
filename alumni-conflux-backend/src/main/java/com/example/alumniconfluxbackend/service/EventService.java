package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.request.EventRequest;
import com.example.alumniconfluxbackend.dto.response.EventRegistrationResponse;
import com.example.alumniconfluxbackend.dto.response.EventResponse;
import com.example.alumniconfluxbackend.util.EventStatus;

import java.util.List;

public interface EventService {
    EventResponse createEventRequest(Integer userId, EventRequest request);
    EventResponse updateEventStatus(Integer eventId, EventStatus status);
    List<EventResponse> getPendingEventRequests();
    List<EventResponse> getAvailableEvents(Integer userId);
    List<EventResponse> getEventsCreatedByUser(Integer userId);
    EventRegistrationResponse registerForEvent(Integer userId, Integer eventId);
    List<EventRegistrationResponse> getEventsRegisteredByUser(Integer userId);
    List<EventRegistrationResponse> getAttendeesForEvent(Integer userId, Integer eventId);
    EventResponse updateEvent(Integer eventId, Integer userId, EventRequest request);
    EventResponse getEventById(Integer eventId);
}
