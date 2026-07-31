package com.travelspark.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "itinerary_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ItineraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private Integer dayNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private BigDecimal cost = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    public enum Category {
        HOTEL, FOOD, TRANSPORT, SIGHTSEEING, NOTES
    }
}
