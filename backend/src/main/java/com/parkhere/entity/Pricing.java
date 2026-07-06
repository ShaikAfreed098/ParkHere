package com.parkhere.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pricings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"parking_lot_id", "vehicle_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pricing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_lot_id", nullable = false)
    private ParkingLot parkingLot;

    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType; // BIKE, CAR, SUV, EV, MINI_TRUCK

    @Column(name = "price_per_hour", nullable = false)
    private BigDecimal pricePerHour;
}
