package com.parkhere.mapper;

import com.parkhere.dto.ParkingSlotDto;
import com.parkhere.entity.ParkingSlot;

public class ParkingSlotMapper {
    public static ParkingSlotDto toDto(ParkingSlot slot) {
        if (slot == null) return null;
        return ParkingSlotDto.builder()
                .id(slot.getId())
                .floorId(slot.getFloor().getId())
                .slotNumber(slot.getSlotNumber())
                .type(slot.getType())
                .status(slot.getStatus())
                .floorName(slot.getFloor().getFloorName())
                .floorNumber(slot.getFloor().getFloorNumber())
                .parkingLotId(slot.getFloor().getParkingLot().getId())
                .parkingLotName(slot.getFloor().getParkingLot().getName())
                .build();
    }
}
