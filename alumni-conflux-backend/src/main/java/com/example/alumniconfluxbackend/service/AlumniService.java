package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.request.AlumniRequest;
import com.example.alumniconfluxbackend.dto.response.AlumniResponse;

public interface AlumniService {
    AlumniResponse createOrUpdateAlumni(Integer userId, AlumniRequest request);

    AlumniResponse getAlumniByUserId(Integer userId);
    java.util.List<AlumniResponse> getAllAlumni();
}
