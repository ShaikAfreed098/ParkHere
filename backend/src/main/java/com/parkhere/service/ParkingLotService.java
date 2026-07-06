package com.parkhere.service;

import com.parkhere.dto.FloorDto;
import com.parkhere.dto.ParkingLotDto;
import com.parkhere.dto.ParkingSlotDto;
import com.parkhere.entity.Floor;
import com.parkhere.entity.ParkingLot;
import com.parkhere.entity.ParkingSlot;
import com.parkhere.exception.ResourceNotFoundException;
import com.parkhere.mapper.FloorMapper;
import com.parkhere.mapper.ParkingLotMapper;
import com.parkhere.mapper.ParkingSlotMapper;
import com.parkhere.repository.BookingRepository;
import com.parkhere.repository.FloorRepository;
import com.parkhere.repository.ParkingLotRepository;
import com.parkhere.repository.ParkingSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingLotService {

    private final ParkingLotRepository parkingLotRepository;
    private final FloorRepository floorRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final BookingRepository bookingRepository;

    public ParkingLotService(ParkingLotRepository parkingLotRepository, FloorRepository floorRepository,
                              ParkingSlotRepository parkingSlotRepository, BookingRepository bookingRepository) {
        this.parkingLotRepository = parkingLotRepository;
        this.floorRepository = floorRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<ParkingLotDto> getAllLots() {
        return parkingLotRepository.findAll().stream()
                .map(ParkingLotMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParkingLotDto> searchLots(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllLots();
        }
        return parkingLotRepository.searchLots(query).stream()
                .map(ParkingLotMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParkingLotDto getLotDetails(Long id) {
        ParkingLot lot = parkingLotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found with id: " + id));
        return ParkingLotMapper.toDto(lot);
    }

    @Transactional(readOnly = true)
    public List<FloorDto> getLotFloors(Long lotId) {
        return floorRepository.findByParkingLotIdOrderByFloorNumberAsc(lotId).stream()
                .map(FloorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParkingSlotDto> getSlotsByFloor(Long floorId) {
        return parkingSlotRepository.findByFloorIdOrderBySlotNumberAsc(floorId).stream()
                .map(ParkingSlotMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParkingSlotDto> getSlotsAvailability(Long floorId, LocalDateTime start, LocalDateTime end) {
        List<ParkingSlot> slots = parkingSlotRepository.findByFloorIdOrderBySlotNumberAsc(floorId);
        
        return slots.stream().map(slot -> {
            ParkingSlotDto dto = ParkingSlotMapper.toDto(slot);
            
            // If the base status is already occupied or disabled, keep it
            if ("OCCUPIED".equals(slot.getStatus()) || "DISABLED".equals(slot.getStatus())) {
                dto.setStatus(slot.getStatus());
            } else {
                // Otherwise, check if there is an overlapping active booking
                boolean isBooked = bookingRepository.existsConflictingBooking(slot.getId(), start, end);
                if (isBooked) {
                    dto.setStatus("OCCUPIED"); // Mark as occupied/reserved for this time range
                } else {
                    dto.setStatus("AVAILABLE");
                }
            }
            return dto;
        }).collect(Collectors.toList());
    }
}
