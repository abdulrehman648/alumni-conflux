package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.request.StudentRequest;
import com.example.alumniconfluxbackend.dto.response.StudentResponse;

public interface StudentService {
    StudentResponse createOrUpdateStudent(Integer userId, StudentRequest request);

    StudentResponse getStudentByUserId(Integer userId);
}
