package com.parkhere.mapper;

import com.parkhere.dto.FloorDto;
import com.parkhere.entity.Floor;

public class FloorMapper {
    public static FloorDto toDto(Floor floor) {
        if (floor == null) return null;
        return FloorDto.builder()
                .id(floor.getId())
                .parkingLotId(floor.getParkingLot().getId())
                .floorName(floor.getFloorName())
                .floorNumber(floor.getFloorNumber())
                .build();
    }
}
