package com.travelspark.service;

import com.travelspark.dto.BudgetBreakdownDto;
import com.travelspark.dto.ItineraryItemDto;
import com.travelspark.dto.ItineraryItemRequest;
import com.travelspark.dto.TripDto;
import com.travelspark.dto.TripRequest;
import com.travelspark.entity.*;
import com.travelspark.exception.ResourceNotFoundException;
import com.travelspark.repository.DestinationRepository;
import com.travelspark.repository.ItineraryItemRepository;
import com.travelspark.repository.TripRepository;
import com.travelspark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TripService {

    private final TripRepository tripRepository;
    private final ItineraryItemRepository itineraryRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TripDto> getTripsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return tripRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TripDto getTripById(Long id, String email) {
        Trip trip = getOwnedTrip(id, email);
        return toDto(trip);
    }

    public TripDto createTrip(TripRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Destination dest = null;
        if (request.getDestinationId() != null) {
            dest = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));
        }
        Trip trip = Trip.builder()
                .user(user)
                .name(request.getName())
                .destination(dest)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .travelers(request.getTravelers())
                .budget(request.getBudget())
                .notes(request.getNotes())
                .build();
        return toDto(tripRepository.save(trip));
    }

    public TripDto updateTrip(Long id, TripRequest request, String email) {
        Trip trip = getOwnedTrip(id, email);
        trip.setName(request.getName());
        if (request.getDestinationId() != null) {
            trip.setDestination(destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination not found")));
        }
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setTravelers(request.getTravelers());
        trip.setBudget(request.getBudget());
        trip.setNotes(request.getNotes());
        return toDto(tripRepository.save(trip));
    }

    public void deleteTrip(Long id, String email) {
        Trip trip = getOwnedTrip(id, email);
        tripRepository.delete(trip);
    }

    // ---- Itinerary ----

    @Transactional(readOnly = true)
    public List<ItineraryItemDto> getItinerary(Long tripId, String email) {
        getOwnedTrip(tripId, email);
        return itineraryRepository.findByTripIdOrderByDayNumberAscCreatedAtAsc(tripId).stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());
    }

    public ItineraryItemDto addItineraryItem(Long tripId, ItineraryItemRequest request, String email) {
        Trip trip = getOwnedTrip(tripId, email);
        ItineraryItem item = ItineraryItem.builder()
                .trip(trip)
                .dayNumber(request.getDayNumber())
                .category(ItineraryItem.Category.valueOf(request.getCategory().toUpperCase()))
                .title(request.getTitle())
                .description(request.getDescription() != null ? request.getDescription() : "")
                .cost(request.getCost())
                .build();
        return toItemDto(itineraryRepository.save(item));
    }

    public ItineraryItemDto updateItineraryItem(Long tripId, Long itemId, ItineraryItemRequest request, String email) {
        getOwnedTrip(tripId, email);
        ItineraryItem item = itineraryRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary item not found: " + itemId));
        item.setDayNumber(request.getDayNumber());
        item.setCategory(ItineraryItem.Category.valueOf(request.getCategory().toUpperCase()));
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription() != null ? request.getDescription() : "");
        item.setCost(request.getCost());
        return toItemDto(itineraryRepository.save(item));
    }

    public void deleteItineraryItem(Long tripId, Long itemId, String email) {
        getOwnedTrip(tripId, email);
        if (!itineraryRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Itinerary item not found: " + itemId);
        }
        itineraryRepository.deleteById(itemId);
    }

    @Transactional(readOnly = true)
    public BudgetBreakdownDto getBudgetBreakdown(Long tripId, String email) {
        Trip trip = getOwnedTrip(tripId, email);
        List<ItineraryItem> items = itineraryRepository.findByTripIdOrderByDayNumberAscCreatedAtAsc(tripId);
        Map<String, BigDecimal> breakdown = new LinkedHashMap<>();
        for (ItineraryItem.Category cat : ItineraryItem.Category.values()) {
            breakdown.put(cat.name().toLowerCase(), BigDecimal.ZERO);
        }
        BigDecimal total = BigDecimal.ZERO;
        for (ItineraryItem item : items) {
            BigDecimal cost = item.getCost();
            breakdown.merge(item.getCategory().name().toLowerCase(), cost, BigDecimal::add);
            total = total.add(cost);
        }
        return BudgetBreakdownDto.builder()
                .tripId(tripId)
                .tripName(trip.getName())
                .tripBudget(trip.getBudget())
                .totalSpent(total)
                .remaining(trip.getBudget().subtract(total))
                .categoryBreakdown(breakdown)
                .build();
    }

    private Trip getOwnedTrip(Long tripId, String email) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
        if (!trip.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Trip not found: " + tripId);
        }
        return trip;
    }

    private TripDto toDto(Trip t) {
        return TripDto.builder()
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
                .build();
    }

    private ItineraryItemDto toItemDto(ItineraryItem i) {
        return ItineraryItemDto.builder()
                .id(i.getId())
                .tripId(i.getTrip().getId())
                .dayNumber(i.getDayNumber())
                .category(i.getCategory().name().toLowerCase())
                .title(i.getTitle())
                .description(i.getDescription())
                .cost(i.getCost())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
