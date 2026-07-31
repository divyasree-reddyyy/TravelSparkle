package com.travelspark.service;

import com.travelspark.dto.DestinationDto;
import com.travelspark.dto.DestinationRequest;
import com.travelspark.dto.ReviewDto;
import com.travelspark.dto.ReviewRequest;
import com.travelspark.entity.Destination;
import com.travelspark.entity.Review;
import com.travelspark.entity.User;
import com.travelspark.exception.ResourceNotFoundException;
import com.travelspark.repository.DestinationRepository;
import com.travelspark.repository.ReviewRepository;
import com.travelspark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DestinationDto> getAllDestinations(String category, Boolean featured) {
        List<Destination> destinations;
        if (featured != null && featured) {
            destinations = destinationRepository.findByFeaturedTrue();
        } else if (category != null) {
            destinations = destinationRepository.findByCategory(Destination.Category.valueOf(category.toUpperCase()));
        } else {
            destinations = destinationRepository.findAll();
        }
        return destinations.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DestinationDto getDestinationById(Long id) {
        return toDto(destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found: " + id)));
    }

    public DestinationDto createDestination(DestinationRequest request) {
        Destination dest = Destination.builder()
                .title(request.getTitle())
                .country(request.getCountry())
                .category(Destination.Category.valueOf(request.getCategory().toUpperCase()))
                .description(request.getDescription())
                .rating(request.getRating())
                .estimatedBudget(request.getEstimatedBudget())
                .durationDays(request.getDurationDays())
                .imageUrl(request.getImageUrl() != null ? request.getImageUrl() : "")
                .featured(request.getFeatured() != null && request.getFeatured())
                .build();
        return toDto(destinationRepository.save(dest));
    }

    public DestinationDto updateDestination(Long id, DestinationRequest request) {
        Destination dest = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found: " + id));
        dest.setTitle(request.getTitle());
        dest.setCountry(request.getCountry());
        dest.setCategory(Destination.Category.valueOf(request.getCategory().toUpperCase()));
        dest.setDescription(request.getDescription());
        dest.setRating(request.getRating());
        dest.setEstimatedBudget(request.getEstimatedBudget());
        dest.setDurationDays(request.getDurationDays());
        if (request.getImageUrl() != null) dest.setImageUrl(request.getImageUrl());
        if (request.getFeatured() != null) dest.setFeatured(request.getFeatured());
        return toDto(destinationRepository.save(dest));
    }

    public void deleteDestination(Long id) {
        if (!destinationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Destination not found: " + id);
        }
        destinationRepository.deleteById(id);
    }

    public ReviewDto addReview(Long destinationId, String userEmail, ReviewRequest request) {
        Destination dest = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found: " + destinationId));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Review review = Review.builder()
                .user(user)
                .destination(dest)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);
        return ReviewDto.builder()
                .id(review.getId())
                .destinationId(destinationId)
                .displayName(user.getDisplayName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsForDestination(Long destinationId) {
        return reviewRepository.findByDestinationIdOrderByCreatedAtDesc(destinationId).stream()
                .map(r -> ReviewDto.builder()
                        .id(r.getId())
                        .destinationId(destinationId)
                        .displayName(r.getUser().getDisplayName())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
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
