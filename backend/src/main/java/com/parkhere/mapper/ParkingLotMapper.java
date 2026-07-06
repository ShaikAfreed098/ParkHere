package com.parkhere.mapper;

import com.parkhere.dto.ParkingLotDto;
import com.parkhere.entity.ParkingLot;

public class ParkingLotMapper {
    public static ParkingLotDto toDto(ParkingLot lot) {
        if (lot == null) return null;
        return ParkingLotDto.builder()
                .id(lot.getId())
                .name(lot.getName())
                .address(lot.getAddress())
                .latitude(lot.getLatitude())
                .longitude(lot.getLongitude())
                .distance(lot.getDistance())
                .description(lot.getDescription())
                .rating(lot.getRating())
                .reviewsCount(lot.getReviewsCount())
                .imageUrl(lot.getImageUrl())
                .amenities(lot.getAmenities())
                .operatingHours(lot.getOperatingHours())
                .build();
    }
}
