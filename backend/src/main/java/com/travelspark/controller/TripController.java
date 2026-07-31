package com.travelspark.controller;

import com.travelspark.dto.BudgetBreakdownDto;
import com.travelspark.dto.ItineraryItemDto;
import com.travelspark.dto.ItineraryItemRequest;
import com.travelspark.dto.TripDto;
import com.travelspark.dto.TripRequest;
import com.travelspark.service.TripService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@Tag(name = "Trips")
public class TripController {

    private final TripService tripService;

    @GetMapping
    public ResponseEntity<List<TripDto>> getMyTrips(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.getTripsForUser(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDto> getTrip(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.getTripById(id, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<TripDto> createTrip(@Valid @RequestBody TripRequest request,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        TripDto created = tripService.createTrip(request, userDetails.getUsername());
        return ResponseEntity.created(URI.create("/api/trips/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripDto> updateTrip(@PathVariable Long id,
                                               @Valid @RequestBody TripRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.updateTrip(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        tripService.deleteTrip(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ---- Itinerary ----

    @GetMapping("/{id}/itinerary")
    public ResponseEntity<List<ItineraryItemDto>> getItinerary(@PathVariable Long id,
                                                                @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.getItinerary(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/itinerary")
    public ResponseEntity<ItineraryItemDto> addItineraryItem(@PathVariable Long id,
                                                              @Valid @RequestBody ItineraryItemRequest request,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        ItineraryItemDto created = tripService.addItineraryItem(id, request, userDetails.getUsername());
        return ResponseEntity.created(URI.create("/api/trips/" + id + "/itinerary/" + created.getId())).body(created);
    }

    @PutMapping("/{id}/itinerary/{itemId}")
    public ResponseEntity<ItineraryItemDto> updateItineraryItem(@PathVariable Long id,
                                                                @PathVariable Long itemId,
                                                                @Valid @RequestBody ItineraryItemRequest request,
                                                                @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.updateItineraryItem(id, itemId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}/itinerary/{itemId}")
    public ResponseEntity<Void> deleteItineraryItem(@PathVariable Long id,
                                                    @PathVariable Long itemId,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        tripService.deleteItineraryItem(id, itemId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ---- Budget ----

    @GetMapping("/{id}/budget")
    public ResponseEntity<BudgetBreakdownDto> getBudget(@PathVariable Long id,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.getBudgetBreakdown(id, userDetails.getUsername()));
    }
}
