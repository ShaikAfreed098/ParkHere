package com.parkhere.mapper;

import com.parkhere.dto.VehicleDto;
import com.parkhere.entity.Vehicle;

public class VehicleMapper {
    public static VehicleDto toDto(Vehicle vehicle) {
        if (vehicle == null) return null;
        return VehicleDto.builder()
                .id(vehicle.getId())
                .userId(vehicle.getUser().getId())
                .registrationNumber(vehicle.getRegistrationNumber())
                .type(vehicle.getType())
                .modelName(vehicle.getModelName())
                .build();
    }
}
