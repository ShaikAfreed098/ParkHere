package com.parkhere.repository;

import com.parkhere.entity.ParkingLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long> {
    @Query("SELECT p FROM ParkingLot p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.address) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ParkingLot> searchLots(@Param("query") String query);
}
