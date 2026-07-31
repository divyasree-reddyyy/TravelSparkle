package com.travelspark.controller;

import com.travelspark.dto.DestinationDto;
import com.travelspark.service.FavoriteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<DestinationDto>> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(favoriteService.getFavorites(userDetails.getUsername()));
    }

    @PostMapping("/{destinationId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long destinationId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        favoriteService.addFavorite(destinationId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{destinationId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long destinationId,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        favoriteService.removeFavorite(destinationId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
