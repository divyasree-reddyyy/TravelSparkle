package com.travelspark.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "budget_plans")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class BudgetPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Builder.Default
    private BigDecimal travelCost = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal stayCost = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal foodCost = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal activitiesCost = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal miscCost = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @Transient
    public BigDecimal getTotal() {
        return travelCost.add(stayCost).add(foodCost).add(activitiesCost).add(miscCost);
    }
}
