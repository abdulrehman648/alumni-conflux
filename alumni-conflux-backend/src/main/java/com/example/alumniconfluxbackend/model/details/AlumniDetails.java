package com.example.alumniconfluxbackend.model.details;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class AlumniDetails implements Serializable {
    private String jobTitle;
    private String experienceLevel;
    private List<String> skills = new ArrayList<>();
    private List<String> achievements = new ArrayList<>();

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<String> achievements) {
        this.achievements = achievements;
    }
}
