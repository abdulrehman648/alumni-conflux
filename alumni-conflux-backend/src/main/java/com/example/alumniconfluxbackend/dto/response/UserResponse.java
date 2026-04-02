package com.example.alumniconfluxbackend.dto.response;

public class UserResponse {
    private Integer id;
    private String fullName;
    private String username;
    private String email;
    private String role;

    public UserResponse() {}

    public UserResponse(Integer id, String fullName, String username, String email, String role) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
