package com.parkhere.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlotDto {
    private Long id;
    private Long floorId;
    private String slotNumber;
    private String type; // BIKE, CAR, SUV, EV, ACCESSIBLE
    private String status; // AVAILABLE, OCCUPIED, RESERVED, DISABLED
    private String floorName;
    private Integer floorNumber;
    private Long parkingLotId;
    private String parkingLotName;
}
