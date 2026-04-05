package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.service.FileStorageService;
import com.example.alumniconfluxbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

    public UserController(UserService userService, FileStorageService fileStorageService) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/{userId}/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @PathVariable Integer userId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please select a file to upload"));
        }

        try {
            // Save the file and get the generated filename
            String fileName = fileStorageService.storeFile(file);

            // Construct the PUBLIC URL
            String imageUrl = "/api/uploads/profile_pictures/" + fileName;

            // Update user's profile picture in database
            userService.updateProfilePicture(userId, imageUrl);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile picture uploaded successfully",
                    "imageUrl", imageUrl));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to upload file: " + e.getMessage()));
        }
    }
}