package com.travelspark.repository;

import com.travelspark.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Favorite> findByUserIdAndDestinationId(Long userId, Long destinationId);
    boolean existsByUserIdAndDestinationId(Long userId, Long destinationId);
    void deleteByUserIdAndDestinationId(Long userId, Long destinationId);
}
