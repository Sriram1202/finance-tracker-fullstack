package com.myfinance.tracker.dto;

import java.time.LocalDate;

public class TransactionDto {
    private Long id;
    private String description;
    private double amount;
    private LocalDate date;
    private String type;
    private String categoryName;

    // Constructor
    public TransactionDto(Long id, String description, double amount, LocalDate date, String type, String categoryName) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.type = type;
        this.categoryName = categoryName;
    }

    // Getters
    public Long getId() { return id; }
    public String getDescription() { return description; }
    public double getAmount() { return amount; }
    public LocalDate getDate() { return date; }
    public String getType() { return type; }
    public String getCategoryName() { return categoryName; }
}
