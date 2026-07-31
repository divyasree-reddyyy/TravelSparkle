package com.travelspark.controller;

import com.travelspark.dto.DestinationDto;
import com.travelspark.dto.DestinationRequest;
import com.travelspark.dto.ReviewDto;
import com.travelspark.dto.ReviewRequest;
import com.travelspark.service.DestinationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
@Tag(name = "Destinations")
public class DestinationController {

    private final DestinationService destinationService;

    @GetMapping
    public ResponseEntity<List<DestinationDto>> getDestinations(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean featured) {
        return ResponseEntity.ok(destinationService.getAllDestinations(category, featured));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DestinationDto> getDestination(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getDestinationById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationDto> createDestination(@Valid @RequestBody DestinationRequest request) {
        DestinationDto created = destinationService.createDestination(request);
        return ResponseEntity.created(URI.create("/api/destinations/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationDto> updateDestination(@PathVariable Long id, @Valid @RequestBody DestinationRequest request) {
        return ResponseEntity.ok(destinationService.updateDestination(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDestination(@PathVariable Long id) {
        destinationService.deleteDestination(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getReviewsForDestination(id));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ReviewDto> addReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(destinationService.addReview(id, userDetails.getUsername(), request));
    }
}
