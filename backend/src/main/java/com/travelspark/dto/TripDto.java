package com.travelspark.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class TripDto {
    private Long id;
    private String name;
    private Long destinationId;
    private String destinationTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer travelers;
    private BigDecimal budget;
    private String notes;
    private Instant createdAt;
}
