package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.request.AlumniRequest;
import com.example.alumniconfluxbackend.dto.response.AlumniResponse;
import com.example.alumniconfluxbackend.model.Alumni;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.model.details.AlumniDetails;
import com.example.alumniconfluxbackend.repository.AlumniRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.AlumniService;
import com.example.alumniconfluxbackend.util.Role;
import org.springframework.stereotype.Service;

@Service
public class AlumniServiceImpl implements AlumniService {
    private final AlumniRepository alumniRepository;
    private final UserRepository userRepository;

    public AlumniServiceImpl(AlumniRepository alumniRepository,
                             UserRepository userRepository) {
        this.alumniRepository = alumniRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AlumniResponse createOrUpdateAlumni(Integer userId, AlumniRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ALUMNI) {
            throw new RuntimeException("Only ALUMNI allowed");
        }

        Alumni alumni = alumniRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Alumni newAlumni = new Alumni();
                    newAlumni.setUser(user);
                    user.setAlumni(newAlumni);
                    return newAlumni;
                });

        alumni.setInstitutionName(request.getInstitutionName());
        alumni.setGraduationYear(request.getGraduationYear());
        alumni.setIndustry(request.getIndustry());
        alumni.setCurrentCompany(request.getCurrentCompany());

        AlumniDetails details = alumni.getDetails();
        if (details == null) {
            details = new AlumniDetails();
        }

        details.setJobTitle(request.getJobTitle());
        details.setExperienceLevel(request.getExperienceLevel());
        details.setSkills(request.getSkills());
        details.setAchievements(request.getAchievements());

        alumni.setDetails(details);

        alumniRepository.save(alumni);

        return mapToResponse(alumni);
    }

    @Override
    public AlumniResponse getAlumniByUserId(Integer userId) {

        Alumni alumni = alumniRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        return mapToResponse(alumni);
    }

    private AlumniResponse mapToResponse(Alumni a) {

        AlumniResponse res = new AlumniResponse();

        res.setId(a.getId());
        res.setInstitutionName(a.getInstitutionName());
        res.setGraduationYear(a.getGraduationYear());
        res.setIndustry(a.getIndustry());
        res.setCurrentCompany(a.getCurrentCompany());

        res.setJobTitle(a.getDetails().getJobTitle());
        res.setExperienceLevel(a.getDetails().getExperienceLevel());
        res.setSkills(a.getDetails().getSkills());
        res.setAchievements(a.getDetails().getAchievements());

        return res;
    }
}
