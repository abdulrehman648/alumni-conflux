package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.dto.request.AdminRequest;
import com.example.alumniconfluxbackend.dto.response.AdminResponse;

import java.util.List;
import com.example.alumniconfluxbackend.dto.response.UserResponse;

public interface AdminService {
    AdminResponse saveAdmin(Integer userId, AdminRequest request);
    AdminResponse getAdmin(Integer userId);
    List<UserResponse> getAllUsers();
    void deleteUser(Integer userId);
}
