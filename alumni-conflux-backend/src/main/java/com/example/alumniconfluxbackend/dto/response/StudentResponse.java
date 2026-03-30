package com.example.alumniconfluxbackend.dto.response;

import java.util.List;

public class StudentResponse {

    private Integer studentId;
    private String institutionName;
    private Short expectedGraduationYear;

    private String department;
    private String degreeProgram;
    private String major;
    private Short currentSemester;

    private List<String> skills;
    private List<String> careerPreferences;

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public Short getExpectedGraduationYear() {
        return expectedGraduationYear;
    }

    public void setExpectedGraduationYear(Short expectedGraduationYear) {
        this.expectedGraduationYear = expectedGraduationYear;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDegreeProgram() {
        return degreeProgram;
    }

    public void setDegreeProgram(String degreeProgram) {
        this.degreeProgram = degreeProgram;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public Short getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(Short currentSemester) {
        this.currentSemester = currentSemester;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getCareerPreferences() {
        return careerPreferences;
    }

    public void setCareerPreferences(List<String> careerPreferences) {
        this.careerPreferences = careerPreferences;
    }
}
