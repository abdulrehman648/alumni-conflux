package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.request.AdminRequest;
import com.example.alumniconfluxbackend.dto.response.AdminResponse;
import com.example.alumniconfluxbackend.model.Admin;
import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.repository.AdminRepository;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.AdminService;
import com.example.alumniconfluxbackend.util.Role;
import com.example.alumniconfluxbackend.dto.response.UserResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public AdminServiceImpl(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AdminResponse saveAdmin(Integer userId, AdminRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only ADMIN can have an admin profile");
        }

        Admin admin = adminRepository.findByUserId(userId).orElse(new Admin());
        admin.setUser(user);
        admin.setPosition(request.getPosition());
        admin.setDepartment(request.getDepartment());
        admin.setBio(request.getBio());

        adminRepository.save(admin);
        return mapToResponse(admin);
    }

    @Override
    public AdminResponse getAdmin(Integer userId) {
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Admin profile not found"));
        return mapToResponse(admin);
    }
    
    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    private AdminResponse mapToResponse(Admin admin) {
        AdminResponse res = new AdminResponse();
        res.setId(admin.getId());
        res.setPosition(admin.getPosition());
        res.setDepartment(admin.getDepartment());
        res.setBio(admin.getBio());
        res.setUserId(admin.getUser().getId());
        res.setFullName(admin.getUser().getFullName());
        return res;
    }
}
