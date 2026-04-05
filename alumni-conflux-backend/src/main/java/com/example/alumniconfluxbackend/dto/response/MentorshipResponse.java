package com.example.alumniconfluxbackend.dto.response;

public class MentorshipResponse {
    private Integer id;
    private Integer alumniId;
    private Integer userId;
    private String name;
    private String industry;
    private String currentCompany;
    private boolean available;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getAlumniId() {
        return alumniId;
    }

    public void setAlumniId(Integer alumniId) {
        this.alumniId = alumniId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCurrentCompany() {
        return currentCompany;
    }

    public void setCurrentCompany(String currentCompany) {
        this.currentCompany = currentCompany;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
