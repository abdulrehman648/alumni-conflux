package com.example.alumniconfluxbackend.facade;

import com.example.alumniconfluxbackend.dto.request.AdminRequest;
import com.example.alumniconfluxbackend.dto.response.AdminResponse;
import com.example.alumniconfluxbackend.service.AdminService;
import org.springframework.stereotype.Component;
import java.util.List;
import com.example.alumniconfluxbackend.dto.response.UserResponse;

@Component
public class AdminFacade {
    private final AdminService adminService;

    public AdminFacade(AdminService adminService) {
        this.adminService = adminService;
    }

    public AdminResponse saveAdmin(Integer userId, AdminRequest request) {
        return adminService.saveAdmin(userId, request);
    }

    public AdminResponse getAdmin(Integer userId) {
        return adminService.getAdmin(userId);
    }
    
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    public void deleteUser(Integer userId) {
        adminService.deleteUser(userId);
    }
}
