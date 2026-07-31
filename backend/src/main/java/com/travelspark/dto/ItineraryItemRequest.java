package com.travelspark.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItineraryItemRequest {
    @NotNull @Min(1)
    private Integer dayNumber;

    @NotBlank
    private String category;

    @NotBlank
    private String title;

    private String description;

    @DecimalMin("0.0")
    private BigDecimal cost = BigDecimal.ZERO;
}
