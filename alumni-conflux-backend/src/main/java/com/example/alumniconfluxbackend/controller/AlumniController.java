package com.example.alumniconfluxbackend.controller;

import com.example.alumniconfluxbackend.dto.request.AlumniRequest;
import com.example.alumniconfluxbackend.dto.response.AlumniResponse;
import com.example.alumniconfluxbackend.facade.AlumniFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alumni")
public class AlumniController {
    private final AlumniFacade alumniFacade;

    public AlumniController(AlumniFacade alumniFacade) {
        this.alumniFacade = alumniFacade;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<AlumniResponse> create(
            @PathVariable Integer userId,
            @RequestBody AlumniRequest request) {

        return ResponseEntity.ok(alumniFacade.saveAlumni(userId, request));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<AlumniResponse> update(
            @PathVariable Integer userId,
            @RequestBody AlumniRequest request) {

        return ResponseEntity.ok(alumniFacade.saveAlumni(userId, request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AlumniResponse> getAlumni(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(alumniFacade.getAlumni(userId));
    }
}
