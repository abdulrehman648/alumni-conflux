package com.example.alumniconfluxbackend.dto.request;

public class ContributionRequest {
    private Double amount;
    private String transactionId;
    private String note;
    private Integer alumniId;

    // Getters and Setters
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Integer getAlumniId() { return alumniId; }
    public void setAlumniId(Integer alumniId) { this.alumniId = alumniId; }
}
