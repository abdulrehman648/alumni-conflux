package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.request.EventRequest;
import com.example.alumniconfluxbackend.dto.response.EventRegistrationResponse;
import com.example.alumniconfluxbackend.dto.response.EventResponse;
import com.example.alumniconfluxbackend.model.Event;
import com.example.alumniconfluxbackend.model.EventRegistration;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.repository.EventRegistrationRepository;
import com.example.alumniconfluxbackend.repository.EventRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.EventService;
import com.example.alumniconfluxbackend.util.EventStatus;
import com.example.alumniconfluxbackend.util.Role;
import com.example.alumniconfluxbackend.util.TargetAudience;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventServiceImpl implements EventService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;

    public EventServiceImpl(EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public EventResponse createEventRequest(Integer userId, EventRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());

        if (user.getRole() == Role.ALUMNI && user.getAlumni() != null) {
            event.setCreator(user.getAlumni());
            event.setLocation(null); // Alumni cannot set location
        } else if (user.getRole() == Role.ADMIN) {
            event.setAdminCreator(user);
            event.setLocation(request.getLocation()); // Admin can set location
        } else {
            throw new RuntimeException("Only ALUMNI and ADMIN can create events");
        }

        event.setStatus(user.getRole() == Role.ADMIN ? EventStatus.APPROVED : EventStatus.PENDING);

        if (request.getTargetAudience() != null) {
            event.setTargetAudience(request.getTargetAudience());
        }

        eventRepository.save(event);
        return mapToEventResponse(event);
    }

    @Override
    public EventResponse updateEvent(Integer eventId, Integer userId, EventRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only ADMIN can update event details");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getEventDate() != null) event.setEventDate(request.getEventDate());
        if (request.getLocation() != null) event.setLocation(request.getLocation());
        if (request.getTargetAudience() != null) event.setTargetAudience(request.getTargetAudience());

        eventRepository.save(event);
        return mapToEventResponse(event);
    }

    @Override
    public EventResponse updateEventStatus(Integer eventId, EventStatus status) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(status);
        eventRepository.save(event);
        return mapToEventResponse(event);
    }

    @Override
    public List<EventResponse> getPendingEventRequests() {
        return eventRepository.findByStatus(EventStatus.PENDING)
                .stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventResponse> getAvailableEvents(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TargetAudience userAudience = mapRoleToAudience(user.getRole());

        return eventRepository.findAvailableEventsForAudience(userAudience)
                .stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventResponse> getEventsCreatedByUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Event> events;
        if (user.getRole() == Role.ALUMNI && user.getAlumni() != null) {
            events = eventRepository.findByCreatorId(user.getAlumni().getId());
        } else if (user.getRole() == Role.ADMIN) {
            events = eventRepository.findByAdminCreatorId(user.getId());
        } else {
            events = List.of();
        }

        return events.stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EventRegistrationResponse registerForEvent(Integer userId, Integer eventId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getStatus() != EventStatus.APPROVED) {
            throw new RuntimeException("Cannot register for an unapproved event");
        }

        if (eventRegistrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new RuntimeException("You are already registered for this event");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(user);

        eventRegistrationRepository.save(registration);
        return mapToRegistrationResponse(registration);
    }

    @Override
    public List<EventRegistrationResponse> getEventsRegisteredByUser(Integer userId) {
        return eventRegistrationRepository.findByUserId(userId)
                .stream()
                .map(this::mapToRegistrationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventRegistrationResponse> getAttendeesForEvent(Integer userId, Integer eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isCreator = (event.getCreator() != null && event.getCreator().getUser().getId().equals(userId))
                || (event.getAdminCreator() != null && event.getAdminCreator().getId().equals(userId));

        if (user.getRole() != Role.ADMIN && !isCreator) {
            throw new RuntimeException("Access denied to attendee list");
        }

        return eventRegistrationRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToRegistrationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EventResponse getEventById(Integer eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToEventResponse(event);
    }

    private TargetAudience mapRoleToAudience(Role role) {
        switch (role) {
            case STUDENT:
                return TargetAudience.STUDENT;
            case ALUMNI:
                return TargetAudience.ALUMNI;
            default:
                return TargetAudience.ALL;
        }
    }

    private EventResponse mapToEventResponse(Event event) {
        EventResponse res = new EventResponse();
        res.setId(event.getId());
        res.setTitle(event.getTitle());
        res.setDescription(event.getDescription());
        res.setEventDate(event.getEventDate() != null ? event.getEventDate().format(DATE_FORMATTER) : null);
        res.setLocation(event.getLocation());
        res.setStatus(event.getStatus());
        res.setTargetAudience(event.getTargetAudience());
        if (event.getCreator() != null) {
            res.setCreatorName(event.getCreator().getUser().getFullName());
            res.setCreatorUserId(event.getCreator().getUser().getId());
        } else if (event.getAdminCreator() != null) {
            res.setCreatorName(event.getAdminCreator().getFullName());
            res.setCreatorUserId(event.getAdminCreator().getId());
        }
        res.setCreatedAt(event.getCreatedAt() != null ? event.getCreatedAt().format(DATE_FORMATTER) : null);
        res.setAttendeeCount(eventRegistrationRepository.countByEventId(event.getId()));
        return res;
    }

    private EventRegistrationResponse mapToRegistrationResponse(EventRegistration reg) {
        EventRegistrationResponse res = new EventRegistrationResponse();
        res.setId(reg.getId());
        res.setEventId(reg.getEvent().getId());
        res.setEventTitle(reg.getEvent().getTitle());

        User regUser = reg.getUser();
        if (regUser != null) {
            res.setUserId(regUser.getId());
            res.setUserName(regUser.getFullName());
        }
        res.setRegistrationDate(
                reg.getRegistrationDate() != null ? reg.getRegistrationDate().format(DATE_FORMATTER) : null);
        return res;
    }
}
