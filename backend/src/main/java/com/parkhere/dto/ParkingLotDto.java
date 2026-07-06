package com.parkhere.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingLotDto {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String distance;
    private String description;
    private Double rating;
    private Integer reviewsCount;
    private String imageUrl;
    private List<String> amenities;
    private String operatingHours;
}
