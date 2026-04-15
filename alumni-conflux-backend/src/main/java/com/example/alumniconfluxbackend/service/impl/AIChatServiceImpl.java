package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.dto.response.StudentResponse;
import com.example.alumniconfluxbackend.service.AIChatService;
import com.example.alumniconfluxbackend.service.StudentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIChatServiceImpl implements AIChatService {

    private final StudentService studentService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api.key:REPLACE_WITH_YOUR_KEY}")
    private String apiKey;

    @Value("${openai.model:gpt-4o}")
    private String model;

    public AIChatServiceImpl(StudentService studentService) {
        this.studentService = studentService;
    }

    @Override
    public String getCareerAdvice(Integer studentUserId, String userMessage) {
        // 1. Fetch student data
        StudentResponse student = studentService.getStudentByUserId(studentUserId);
        if (student == null) {
             throw new RuntimeException("Student profile not found. Please complete your profile first.");
        }

        // 2. Construct the system prompt
        StringBuilder systemPromptBuilder = new StringBuilder();
        systemPromptBuilder.append("You are a professional University Career Counselor. ")
                .append("Your task is to provide helpful, concise, and personalized career advice to the student based on their message. ");
        
        systemPromptBuilder.append("\n\nHere is the student's profile context:\n");
        systemPromptBuilder.append("- Major: ").append(student.getMajor() != null ? student.getMajor() : "N/A").append("\n");
        systemPromptBuilder.append("- Skills: ").append(student.getSkills() != null && !student.getSkills().isEmpty() ? String.join(", ", student.getSkills()) : "N/A").append("\n");
        systemPromptBuilder.append("- Career Preferences: ").append(student.getCareerPreferences() != null && !student.getCareerPreferences().isEmpty() ? String.join(", ", student.getCareerPreferences()) : "N/A");

        // 3. Send request to OpenAI
        return callOpenAi(systemPromptBuilder.toString(), userMessage);
    }

    private String callOpenAi(String systemPrompt, String userPrompt) {
        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>) (Class) Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                @SuppressWarnings("unchecked")
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            } else {
                return "Error from AI Service: " + response.getStatusCode();
            }
        } catch (Exception e) {
            return "Failed to connect to AI Service. Please check if your API key is correctly configured in application.properties.";
        }
    }
}
