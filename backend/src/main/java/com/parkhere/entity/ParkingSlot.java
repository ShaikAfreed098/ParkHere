package com.parkhere.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "parking_slots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"floor_id", "slot_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private Floor floor;

    @Column(name = "slot_number", nullable = false)
    private String slotNumber;

    @Column(nullable = false)
    private String type; // BIKE, CAR, SUV, EV, ACCESSIBLE

    @Column(nullable = false)
    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED, RESERVED, DISABLED

    @Version
    @Column(nullable = false)
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
