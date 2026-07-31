package com.travelspark.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DestinationRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String country;

    @NotBlank
    private String category;

    @NotBlank
    private String description;

    @NotNull @DecimalMin("0.0") @DecimalMax("5.0")
    private Double rating;

    @NotNull @DecimalMin("0.0")
    private BigDecimal estimatedBudget;

    @NotNull @Min(1)
    private Integer durationDays;

    private String imageUrl;

    private Boolean featured;
}
