package com.example.alumniconfluxbackend.service;

public interface AIChatService {
    /**
     * Gets career advice for a student based on their profile and the alumni knowledge base.
     * @param studentUserId The ID of the student asking for advice.
     * @param userMessage The specific question or message from the student.
     * @return AI generated advice string.
     */
    String getCareerAdvice(Integer studentUserId, String userMessage);
}
