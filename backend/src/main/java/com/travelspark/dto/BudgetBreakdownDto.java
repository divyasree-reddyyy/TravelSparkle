package com.travelspark.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class BudgetBreakdownDto {
    private Long tripId;
    private String tripName;
    private java.math.BigDecimal tripBudget;
    private java.math.BigDecimal totalSpent;
    private java.math.BigDecimal remaining;
    private Map<String, java.math.BigDecimal> categoryBreakdown;
}
