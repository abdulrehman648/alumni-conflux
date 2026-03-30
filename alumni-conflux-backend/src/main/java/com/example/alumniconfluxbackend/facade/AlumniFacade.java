package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.dto.request.AlumniRequest;
import com.example.alumniconfluxbackend.dto.response.AlumniResponse;
import com.example.alumniconfluxbackend.service.AlumniService;
import org.springframework.stereotype.Component;

@Component
public class AlumniFacade {
    private final AlumniService alumniService;

    public AlumniFacade(AlumniService alumniService) {
        this.alumniService = alumniService;
    }

    public AlumniResponse saveAlumni(Integer userId, AlumniRequest request) {
        return alumniService.createOrUpdateAlumni(userId, request);
    }

    public AlumniResponse getAlumni(Integer userId) {
        return alumniService.getAlumniByUserId(userId);
    }
}
