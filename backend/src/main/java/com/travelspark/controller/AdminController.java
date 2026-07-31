package com.travelspark.controller;

import com.travelspark.dto.DestinationDto;
import com.travelspark.dto.DestinationRequest;
import com.travelspark.dto.TripDto;
import com.travelspark.dto.UserDto;
import com.travelspark.service.AdminService;
import com.travelspark.service.DestinationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;
    private final DestinationService destinationService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/trips")
    public ResponseEntity<List<TripDto>> getAllTrips() {
        return ResponseEntity.ok(adminService.getAllTrips());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @PostMapping("/destinations")
    public ResponseEntity<DestinationDto> createDestination(@Valid @RequestBody DestinationRequest request) {
        DestinationDto created = destinationService.createDestination(request);
        return ResponseEntity.created(URI.create("/api/destinations/" + created.getId())).body(created);
    }

    @PutMapping("/destinations/{id}")
    public ResponseEntity<DestinationDto> updateDestination(@PathVariable Long id, @Valid @RequestBody DestinationRequest request) {
        return ResponseEntity.ok(destinationService.updateDestination(id, request));
    }

    @DeleteMapping("/destinations/{id}")
    public ResponseEntity<Void> deleteDestination(@PathVariable Long id) {
        destinationService.deleteDestination(id);
        return ResponseEntity.noContent().build();
    }
}
