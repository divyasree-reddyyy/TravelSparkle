package com.travelspark.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TripRequest {
    @NotBlank
    private String name;

    private Long destinationId;

    private LocalDate startDate;
    private LocalDate endDate;

    @Min(1)
    private Integer travelers = 1;

    @DecimalMin("0.0")
    private BigDecimal budget = BigDecimal.ZERO;

    private String notes;
}
