package com.parkhere.repository;

import com.parkhere.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByFloorIdOrderBySlotNumberAsc(Long floorId);
    Optional<ParkingSlot> findByFloorIdAndSlotNumber(Long floorId, String slotNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ParkingSlot s WHERE s.id = :id")
    Optional<ParkingSlot> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT COUNT(s) FROM ParkingSlot s WHERE s.status = 'OCCUPIED' OR s.status = 'RESERVED'")
    long countOccupiedOrReservedSlots();

    @Query("SELECT l.id, l.name, " +
           "CAST(SUM(CASE WHEN s.status = 'OCCUPIED' OR s.status = 'RESERVED' THEN 1 ELSE 0 END) AS double) / COUNT(s.id) * 100.0 " +
           "FROM ParkingSlot s JOIN s.floor f JOIN f.parkingLot l " +
           "GROUP BY l.id, l.name")
    List<Object[]> getParkingLotUtilization();
}
