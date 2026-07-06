package com.parkhere.service;

import com.parkhere.dto.BookingDto;
import com.parkhere.dto.BookingRequest;
import com.parkhere.entity.*;
import com.parkhere.exception.BadRequestException;
import com.parkhere.exception.ConcurrentBookingException;
import com.parkhere.exception.ResourceNotFoundException;
import com.parkhere.mapper.BookingMapper;
import com.parkhere.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;
    private final PricingRepository pricingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmailService emailService;
    private final QrService qrService;

    public BookingService(BookingRepository bookingRepository, ParkingSlotRepository parkingSlotRepository,
                          UserRepository userRepository, PricingRepository pricingRepository,
                          PaymentRepository paymentRepository, NotificationRepository notificationRepository,
                          AuditLogRepository auditLogRepository, EmailService emailService, QrService qrService) {
        this.bookingRepository = bookingRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.userRepository = userRepository;
        this.pricingRepository = pricingRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.emailService = emailService;
        this.qrService = qrService;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found"));
    }

    @Transactional
    public BookingDto createBooking(BookingRequest request) {
        User user = getCurrentUser();

        // 1. Fetch slot
        ParkingSlot slot = parkingSlotRepository.findById(request.getParkingSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found"));

        if ("DISABLED".equals(slot.getStatus())) {
            throw new BadRequestException("This slot is disabled and cannot be booked.");
        }

        // 2. Overlap validation (Double booking prevention)
        boolean isBooked = bookingRepository.existsConflictingBooking(
                slot.getId(), request.getStartTime(), request.getEndTime()
        );
        if (isBooked) {
            throw new ConcurrentBookingException("This slot has already been reserved for the selected time range.");
        }

        // 3. Pricing calculations
        ParkingLot lot = slot.getFloor().getParkingLot();
        String vehicleType = slot.getType(); // BIKE, CAR, SUV, EV, ACCESSIBLE
        
        // Map ACCESSIBLE to CAR for pricing if pricing not defined
        String lookupType = "ACCESSIBLE".equals(vehicleType) ? "CAR" : vehicleType;
        
        Pricing pricing = pricingRepository.findByParkingLotIdAndVehicleType(lot.getId(), lookupType)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing schema not configured for " + vehicleType + " in this lot"));

        long hours = Duration.between(request.getStartTime(), request.getEndTime()).toHours();
        if (hours <= 0) {
            hours = 1; // Minimum 1 hour charge
        }

        BigDecimal rate = pricing.getPricePerHour();
        BigDecimal baseAmount = rate.multiply(BigDecimal.valueOf(hours));
        BigDecimal taxAmount = baseAmount.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP); // 18% GST (9% CGST + 9% SGST)
        BigDecimal totalAmount = baseAmount.add(taxAmount);

        // 4. Generate QR Code details
        String qrData = "PH-BKG-" + UUID.randomUUID().toString().substring(0, 13).toUpperCase();

        // 5. Apply Optimistic Locking
        try {
            // Modify a value on the slot to trigger version increment & collision checks
            slot.setUpdatedAt(LocalDateTime.now());
            parkingSlotRepository.save(slot);
        } catch (ObjectOptimisticLockingFailureException e) {
            log.warn("Optimistic locking collision detected on slot {}", slot.getId());
            throw new ConcurrentBookingException("Slot reservation collision. Please try booking again.");
        }

        // 6. Save Booking
        Booking booking = Booking.builder()
                .user(user)
                .parkingSlot(slot)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationHours((int) hours)
                .baseAmount(baseAmount)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .status("ACTIVE")
                .qrCodeData(qrData)
                .qrExpiresAt(request.getEndTime())
                .build();

        bookingRepository.save(booking);

        // 7. Save Payment (Mock success payment setup)
        String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String invoiceNum = "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + System.currentTimeMillis() % 100000;
        
        Payment payment = Payment.builder()
                .booking(booking)
                .paymentMethod(request.getPaymentMethod())
                .transactionId(txnId)
                .status("SUCCESS")
                .gstNumber("36AAAAA1111A1Z1") // Standard Indian GSTIN format
                .invoiceNumber(invoiceNum)
                .build();

        paymentRepository.save(payment);

        // 8. Create Notification
        Notification notif = Notification.builder()
                .user(user)
                .title("Booking Confirmed")
                .message("Your slot " + slot.getSlotNumber() + " at " + lot.getName() + " has been booked successfully.")
                .type("BOOKING_CONFIRMED")
                .isRead(false)
                .build();
        notificationRepository.save(notif);

        // 9. Send Email
        emailService.sendBookingConfirmationEmail(user.getEmail(), booking);

        // 10. Audit Logging
        auditLogRepository.save(AuditLog.builder()
                .action("BOOKING_CREATED")
                .entityName("Booking")
                .entityId(booking.getId())
                .performedBy(user.getEmail())
                .details("Created slot booking: Slot=" + slot.getSlotNumber() + ", Lot=" + lot.getName() + ", Invoice=" + invoiceNum)
                .build());

        return BookingMapper.toDto(booking, payment);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized to cancel this booking");
        }

        if (!"ACTIVE".equals(booking.getStatus())) {
            throw new BadRequestException("Only active bookings can be cancelled.");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        // Save notification
        Notification notif = Notification.builder()
                .user(user)
                .title("Booking Cancelled")
                .message("Your reservation " + booking.getQrCodeData() + " was cancelled successfully.")
                .type("GENERAL")
                .isRead(false)
                .build();
        notificationRepository.save(notif);

        // Audit Logging
        auditLogRepository.save(AuditLog.builder()
                .action("BOOKING_CANCELLED")
                .entityName("Booking")
                .entityId(booking.getId())
                .performedBy(user.getEmail())
                .details("Cancelled slot booking: Slot=" + booking.getParkingSlot().getSlotNumber())
                .build());
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(booking -> {
                    Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
                    return BookingMapper.toDto(booking, payment);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingDetails(Long id) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Admin or Owner can fetch details
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> "ROLE_ADMIN".equals(role.getName()));
        if (!booking.getUser().getId().equals(user.getId()) && !isAdmin) {
            throw new BadRequestException("Unauthorized access to booking details");
        }

        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        return BookingMapper.toDto(booking, payment);
    }

    @Transactional
    public BookingDto scanAndValidateQrCode(String qrCodeData) {
        Booking booking = bookingRepository.findByQrCodeData(qrCodeData)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR Code. Booking record not found."));

        if (!"ACTIVE".equals(booking.getStatus())) {
            throw new BadRequestException("Booking is not in active state (Status: " + booking.getStatus() + ")");
        }

        if (LocalDateTime.now().isAfter(booking.getQrExpiresAt())) {
            booking.setStatus("COMPLETED"); // Expired slot defaults to completed
            bookingRepository.save(booking);
            throw new BadRequestException("This booking QR code has expired.");
        }

        // Complete the booking check-in/out
        booking.setStatus("COMPLETED");
        bookingRepository.save(booking);

        // Audit Logging
        auditLogRepository.save(AuditLog.builder()
                .action("QR_SCANNED_SUCCESS")
                .entityName("Booking")
                .entityId(booking.getId())
                .performedBy("Gate Controller")
                .details("Validated check-in QR for slot " + booking.getParkingSlot().getSlotNumber())
                .build());

        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        return BookingMapper.toDto(booking, payment);
    }
}
