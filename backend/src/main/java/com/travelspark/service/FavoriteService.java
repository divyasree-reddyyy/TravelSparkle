package com.travelspark.service;

import com.travelspark.dto.DestinationDto;
import com.travelspark.entity.Destination;
import com.travelspark.entity.Favorite;
import com.travelspark.entity.User;
import com.travelspark.exception.BadRequestException;
import com.travelspark.exception.ResourceNotFoundException;
import com.travelspark.repository.DestinationRepository;
import com.travelspark.repository.FavoriteRepository;
import com.travelspark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;

    @Transactional(readOnly = true)
    public List<DestinationDto> getFavorites(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(Favorite::getDestination)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void addFavorite(Long destinationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (favoriteRepository.existsByUserIdAndDestinationId(user.getId(), destinationId)) {
            return;
        }
        Destination dest = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found: " + destinationId));
        favoriteRepository.save(Favorite.builder()
                .user(user)
                .destination(dest)
                .build());
    }

    public void removeFavorite(Long destinationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        favoriteRepository.deleteByUserIdAndDestinationId(user.getId(), destinationId);
    }

    private DestinationDto toDto(Destination d) {
        return DestinationDto.builder()
                .id(d.getId())
                .title(d.getTitle())
                .country(d.getCountry())
                .category(d.getCategory().name().toLowerCase())
                .description(d.getDescription())
                .rating(d.getRating())
                .estimatedBudget(d.getEstimatedBudget())
                .durationDays(d.getDurationDays())
                .imageUrl(d.getImageUrl())
                .featured(d.getFeatured())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
