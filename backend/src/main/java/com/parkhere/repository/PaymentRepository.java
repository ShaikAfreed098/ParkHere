package com.parkhere.repository;

import com.parkhere.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT SUM(p.booking.totalAmount) FROM Payment p WHERE p.status = 'SUCCESS'")
    java.math.BigDecimal sumTotalRevenue();

    @Query("SELECT EXTRACT(MONTH FROM p.booking.createdAt) as monthNum, SUM(p.booking.totalAmount) as revenue " +
           "FROM Payment p WHERE p.status = 'SUCCESS' GROUP BY EXTRACT(MONTH FROM p.booking.createdAt)")
    List<Object[]> getMonthlyRevenueMetrics();
}
