package com.example.alumniconfluxbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentorship_conversations")
public class MentorshipConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "request_id", nullable = false, unique = true)
    private Integer requestId;

    @Column(name = "student_user_id", nullable = false)
    private Integer studentUserId;

    @Column(name = "mentor_user_id", nullable = false)
    private Integer mentorUserId;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public Integer getStudentUserId() {
        return studentUserId;
    }

    public void setStudentUserId(Integer studentUserId) {
        this.studentUserId = studentUserId;
    }

    public Integer getMentorUserId() {
        return mentorUserId;
    }

    public void setMentorUserId(Integer mentorUserId) {
        this.mentorUserId = mentorUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}