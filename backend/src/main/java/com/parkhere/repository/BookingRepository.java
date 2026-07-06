package com.parkhere.repository;

import com.parkhere.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Booking> findByQrCodeData(String qrCodeData);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.parkingSlot.id = :slotId AND b.status = 'ACTIVE' AND " +
           "((b.startTime < :end AND b.endTime > :start))")
    boolean existsConflictingBooking(@Param("slotId") Long slotId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
