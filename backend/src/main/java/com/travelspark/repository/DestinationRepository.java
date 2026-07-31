package com.travelspark.repository;

import com.travelspark.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    List<Destination> findByFeaturedTrue();
    List<Destination> findByCategory(Destination.Category category);
}
