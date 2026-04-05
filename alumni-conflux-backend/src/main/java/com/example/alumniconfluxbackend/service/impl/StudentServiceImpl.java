package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.request.StudentRequest;
import com.example.alumniconfluxbackend.dto.response.StudentResponse;
import com.example.alumniconfluxbackend.model.Student;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.model.details.StudentDetails;
import com.example.alumniconfluxbackend.repository.StudentRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.StudentService;
import com.example.alumniconfluxbackend.util.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentServiceImpl(StudentRepository studentRepository,
            UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StudentResponse createOrUpdateStudent(Integer userId, StudentRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only student can be created");
        }

        Student student = studentRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Student newStudent = new Student();
                    newStudent.setUser(user);
                    user.setStudent(newStudent);
                    return newStudent;
                });

        student.setInstitutionName(request.getInstitutionName());
        student.setExpectedGraduationYear(request.getExpectedGraduationYear());

        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getUsername() != null)
            user.setUsername(request.getUsername());
        if (request.getEmail() != null)
            user.setEmail(request.getEmail());

        StudentDetails details = student.getDetails();
        if (details == null) {
            details = new StudentDetails();
        }

        details.setDepartment(request.getDepartment());
        details.setDegreeProgram(request.getDegreeProgram());
        details.setMajor(request.getMajor());
        details.setCurrentSemester(request.getCurrentSemester());
        details.setSkills(request.getSkills());
        details.setCareerPreferences(request.getCareerPreferences());

        student.setDetails(details);

        studentRepository.save(student);

        return mapToResponse(student);
    }

    @Override
    public StudentResponse getStudentByUserId(Integer userId) {

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return mapToResponse(student);
    }

    private StudentResponse mapToResponse(Student student) {

        StudentResponse res = new StudentResponse();

        res.setStudentId(student.getId());
        res.setInstitutionName(student.getInstitutionName());
        res.setExpectedGraduationYear(student.getExpectedGraduationYear());

        res.setDepartment(student.getDetails().getDepartment());
        res.setDegreeProgram(student.getDetails().getDegreeProgram());
        res.setMajor(student.getDetails().getMajor());
        res.setCurrentSemester(student.getDetails().getCurrentSemester());
        res.setSkills(student.getDetails().getSkills());
        res.setCareerPreferences(student.getDetails().getCareerPreferences());

        if (student.getUser() != null) {
            res.setFullName(student.getUser().getFullName());
            res.setUsername(student.getUser().getUsername());
            res.setEmail(student.getUser().getEmail());
        }
        res.setProfilePicture(student.getProfilePicture());

        return res;
    }
}