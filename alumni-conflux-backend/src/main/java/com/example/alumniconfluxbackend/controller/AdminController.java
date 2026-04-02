package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.AdminRequest;
import com.example.alumniconfluxbackend.dto.response.AdminResponse;
import com.example.alumniconfluxbackend.facade.AdminFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.alumniconfluxbackend.dto.response.UserResponse;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminFacade adminFacade;

    public AdminController(AdminFacade adminFacade) {
        this.adminFacade = adminFacade;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<AdminResponse> create(
            @PathVariable Integer userId,
            @RequestBody AdminRequest request) {
        return ResponseEntity.ok(adminFacade.saveAdmin(userId, request));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<AdminResponse> update(
            @PathVariable Integer userId,
            @RequestBody AdminRequest request) {
        return ResponseEntity.ok(adminFacade.saveAdmin(userId, request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AdminResponse> getAdmin(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(adminFacade.getAdmin(userId));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminFacade.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Integer userId) {
        adminFacade.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
