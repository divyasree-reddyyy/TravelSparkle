package com.travelspark.service;

import com.travelspark.dto.DestinationDto;
import com.travelspark.dto.TripDto;
import com.travelspark.dto.UserDto;
import com.travelspark.entity.Destination;
import com.travelspark.entity.Trip;
import com.travelspark.entity.User;
import com.travelspark.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final TripRepository tripRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .displayName(u.getDisplayName())
                        .role(u.getRole().name())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<TripDto> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(t -> TripDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .destinationId(t.getDestination() != null ? t.getDestination().getId() : null)
                        .destinationTitle(t.getDestination() != null ? t.getDestination().getTitle() : null)
                        .startDate(t.getStartDate())
                        .endDate(t.getEndDate())
                        .travelers(t.getTravelers())
                        .budget(t.getBudget())
                        .notes(t.getNotes())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDestinations", destinationRepository.count());
        stats.put("totalTrips", tripRepository.count());
        stats.put("featuredDestinations", destinationRepository.findByFeaturedTrue().size());
        return stats;
    }
}
