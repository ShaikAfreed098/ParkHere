package com.parkhere.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloorDto {
    private Long id;
    private Long parkingLotId;
    private String floorName;
    private Integer floorNumber;
}
