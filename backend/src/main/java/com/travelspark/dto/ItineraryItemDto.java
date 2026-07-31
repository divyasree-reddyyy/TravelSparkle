package com.travelspark.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class ItineraryItemDto {
    private Long id;
    private Long tripId;
    private Integer dayNumber;
    private String category;
    private String title;
    private String description;
    private BigDecimal cost;
    private Instant createdAt;
}
