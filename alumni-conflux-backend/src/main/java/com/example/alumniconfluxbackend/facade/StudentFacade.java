package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.dto.request.StudentRequest;
import com.example.alumniconfluxbackend.dto.response.StudentResponse;
import com.example.alumniconfluxbackend.service.StudentService;
import org.springframework.stereotype.Component;

@Component
public class StudentFacade {
    private final StudentService studentService;

    public StudentFacade(StudentService studentService) {
        this.studentService = studentService;
    }

    public StudentResponse saveStudent(Integer userId, StudentRequest request) {
        return studentService.createOrUpdateStudent(userId, request);
    }

    public StudentResponse getStudent(Integer userId) {
        return studentService.getStudentByUserId(userId);
    }
}
