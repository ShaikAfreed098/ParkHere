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

    long countByStatus(String status);

    @Query("SELECT EXTRACT(MONTH FROM b.createdAt) as monthNum, COUNT(b.id) as bookingsCount " +
           "FROM Booking b GROUP BY EXTRACT(MONTH FROM b.createdAt)")
    List<Object[]> getMonthlyBookingsCount();

    @Query("SELECT b.parkingSlot.type, COUNT(b.id) FROM Booking b GROUP BY b.parkingSlot.type")
    List<Object[]> getBookingCountByVehicleType();

    @Query("SELECT EXTRACT(DOW FROM b.createdAt) as dayNum, COUNT(b.id) FROM Booking b GROUP BY EXTRACT(DOW FROM b.createdAt)")
    List<Object[]> getDailyBookingsDistribution();

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.parkingSlot.id = :slotId AND b.status = 'ACTIVE' AND " +
           "((b.startTime < :end AND b.endTime > :start))")
    boolean existsConflictingBooking(@Param("slotId") Long slotId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
