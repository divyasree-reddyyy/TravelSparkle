package com.travelspark.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReviewDto {
    private Long id;
    private Long destinationId;
    private String displayName;
    private Integer rating;
    private String comment;
    private Instant createdAt;
}
