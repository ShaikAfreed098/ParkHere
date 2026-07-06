package com.parkhere.service;

import com.parkhere.dto.VehicleDto;
import com.parkhere.entity.AuditLog;
import com.parkhere.entity.User;
import com.parkhere.entity.Vehicle;
import com.parkhere.exception.BadRequestException;
import com.parkhere.exception.ResourceNotFoundException;
import com.parkhere.mapper.VehicleMapper;
import com.parkhere.repository.AuditLogRepository;
import com.parkhere.repository.UserRepository;
import com.parkhere.repository.VehicleRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public VehicleService(VehicleRepository vehicleRepository, UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found"));
    }

    @Transactional(readOnly = true)
    public List<VehicleDto> getMyVehicles() {
        User user = getCurrentUser();
        return vehicleRepository.findByUserId(user.getId()).stream()
                .map(VehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleDto addVehicle(VehicleDto dto) {
        User user = getCurrentUser();
        
        if (vehicleRepository.findByRegistrationNumber(dto.getRegistrationNumber()).isPresent()) {
            throw new BadRequestException("Vehicle with this registration number is already registered.");
        }

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .registrationNumber(dto.getRegistrationNumber().toUpperCase())
                .type(dto.getType())
                .modelName(dto.getModelName())
                .build();

        vehicleRepository.save(vehicle);

        auditLogRepository.save(AuditLog.builder()
                .action("VEHICLE_ADDED")
                .entityName("Vehicle")
                .entityId(vehicle.getId())
                .performedBy(user.getEmail())
                .details("Registered vehicle " + vehicle.getRegistrationNumber())
                .build());

        return VehicleMapper.toDto(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        User user = getCurrentUser();
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized to delete this vehicle");
        }

        vehicleRepository.delete(vehicle);

        auditLogRepository.save(AuditLog.builder()
                .action("VEHICLE_DELETED")
                .entityName("Vehicle")
                .entityId(id)
                .performedBy(user.getEmail())
                .details("Unregistered vehicle " + vehicle.getRegistrationNumber())
                .build());
    }
}
