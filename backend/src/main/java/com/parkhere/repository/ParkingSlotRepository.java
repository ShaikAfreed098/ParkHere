package com.parkhere.repository;

import com.parkhere.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByFloorIdOrderBySlotNumberAsc(Long floorId);
    Optional<ParkingSlot> findByFloorIdAndSlotNumber(Long floorId, String slotNumber);
}
