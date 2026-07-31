package com.travelspark.repository;

import com.travelspark.entity.BudgetPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetPlanRepository extends JpaRepository<BudgetPlan, Long> {
    Optional<BudgetPlan> findByTripId(Long tripId);
}
