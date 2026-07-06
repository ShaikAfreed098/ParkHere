package com.parkhere.controller;

import com.parkhere.dto.FloorDto;
import com.parkhere.dto.ParkingLotDto;
import com.parkhere.dto.ParkingSlotDto;
import com.parkhere.service.ParkingLotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/lots")
public class ParkingLotController {

    private final ParkingLotService parkingLotService;

    public ParkingLotController(ParkingLotService parkingLotService) {
        this.parkingLotService = parkingLotService;
    }

    @GetMapping
    public ResponseEntity<List<ParkingLotDto>> searchLots(@RequestParam(required = false) String search) {
        List<ParkingLotDto> lots = parkingLotService.searchLots(search);
        return ResponseEntity.ok(lots);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingLotDto> getLotDetails(@PathVariable Long id) {
        ParkingLotDto lot = parkingLotService.getLotDetails(id);
        return ResponseEntity.ok(lot);
    }

    @GetMapping("/{id}/floors")
    public ResponseEntity<List<FloorDto>> getLotFloors(@PathVariable Long id) {
        List<FloorDto> floors = parkingLotService.getLotFloors(id);
        return ResponseEntity.ok(floors);
    }

    @GetMapping("/floors/{floorId}/slots")
    public ResponseEntity<List<ParkingSlotDto>> getSlotsAvailability(
            @PathVariable Long floorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        if (startTime != null && endTime != null) {
            List<ParkingSlotDto> slots = parkingLotService.getSlotsAvailability(floorId, startTime, endTime);
            return ResponseEntity.ok(slots);
        } else {
            List<ParkingSlotDto> slots = parkingLotService.getSlotsByFloor(floorId);
            return ResponseEntity.ok(slots);
        }
    }
}
