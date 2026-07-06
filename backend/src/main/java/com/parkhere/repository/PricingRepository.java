package com.parkhere.repository;

import com.parkhere.entity.Pricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PricingRepository extends JpaRepository<Pricing, Long> {
    List<Pricing> findByParkingLotId(Long parkingLotId);
    Optional<Pricing> findByParkingLotIdAndVehicleType(Long parkingLotId, String vehicleType);
}
