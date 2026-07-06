package com.parkhere.repository;

import com.parkhere.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {
    List<Floor> findByParkingLotIdOrderByFloorNumberAsc(Long parkingLotId);
    Optional<Floor> findByParkingLotIdAndFloorNumber(Long parkingLotId, Integer floorNumber);
}
