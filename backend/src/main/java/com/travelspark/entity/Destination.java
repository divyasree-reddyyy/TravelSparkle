package com.travelspark.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "destinations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String country;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private BigDecimal estimatedBudget;

    @Column(nullable = false)
    private Integer durationDays;

    @Column(nullable = false)
    private String imageUrl;

    @Builder.Default
    private Boolean featured = false;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    public enum Category {
        BEACH, MOUNTAIN, CITY, ADVENTURE, SPIRITUAL, ISLAND
    }
}
