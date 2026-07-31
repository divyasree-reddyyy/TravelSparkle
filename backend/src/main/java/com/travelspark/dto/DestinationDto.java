package com.travelspark.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class DestinationDto {
    private Long id;
    private String title;
    private String country;
    private String category;
    private String description;
    private Double rating;
    private BigDecimal estimatedBudget;
    private Integer durationDays;
    private String imageUrl;
    private Boolean featured;
    private Instant createdAt;
}
