package com.parkhere.service;

import com.parkhere.dto.BookingDto;
import com.parkhere.dto.BookingRequest;
import com.parkhere.entity.*;
import com.parkhere.exception.ConcurrentBookingException;
import com.parkhere.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private ParkingSlotRepository parkingSlotRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PricingRepository pricingRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private QrService qrService;

    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private BookingService bookingService;

    private User mockUser;
    private ParkingLot mockLot;
    private Floor mockFloor;
    private ParkingSlot mockSlot;
    private Pricing mockPricing;

    @BeforeEach
    public void setUp() {
        // Setup Security Context Mocking
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("rahul@parkhere.in");

        // Setup Entities
        mockUser = User.builder()
                .id(1L)
                .email("rahul@parkhere.in")
                .firstName("Rahul")
                .lastName("Sharma")
                .phone("+919876543210")
                .isVerified(true)
                .build();

        mockLot = ParkingLot.builder()
                .id(1L)
                .name("ParkHere Banjara Hills")
                .address("Road No. 1, Banjara Hills, Hyderabad")
                .build();

        mockFloor = Floor.builder()
                .id(1L)
                .parkingLot(mockLot)
                .floorName("Ground Floor")
                .floorNumber(0)
                .build();

        mockSlot = ParkingSlot.builder()
                .id(1L)
                .floor(mockFloor)
                .slotNumber("A-01")
                .type("CAR")
                .status("AVAILABLE")
                .version(0L)
                .build();

        mockPricing = Pricing.builder()
                .id(1L)
                .parkingLot(mockLot)
                .vehicleType("CAR")
                .pricePerHour(BigDecimal.valueOf(50.00))
                .build();
    }

    @Test
    public void testCreateBooking_Success() {
        // Mock Repository lookups
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(parkingSlotRepository.findById(anyLong())).thenReturn(Optional.of(mockSlot));
        when(bookingRepository.existsConflictingBooking(anyLong(), any(), any())).thenReturn(false);
        when(pricingRepository.findByParkingLotIdAndVehicleType(anyLong(), anyString())).thenReturn(Optional.of(mockPricing));
        when(parkingSlotRepository.save(any(ParkingSlot.class))).thenReturn(mockSlot);

        BookingRequest request = BookingRequest.builder()
                .parkingSlotId(1L)
                .startTime(LocalDateTime.now().plusHours(1))
                .endTime(LocalDateTime.now().plusHours(3))
                .paymentMethod("UPI")
                .build();

        BookingDto result = bookingService.createBooking(request);

        assertNotNull(result);
        assertEquals("ACTIVE", result.getStatus());
        assertEquals("A-01", result.getSlotNumber());
        assertEquals("Ground Floor", result.getFloorName());
        assertEquals("ParkHere Banjara Hills", result.getParkingLotName());
        
        // Duration: 2 hours. Price: 50/hour. Base = 100. GST (18%) = 18. Total = 118.
        assertEquals(0, result.getBaseAmount().compareTo(BigDecimal.valueOf(100.00)));
        assertEquals(0, result.getTaxAmount().compareTo(BigDecimal.valueOf(18.00)));
        assertEquals(0, result.getTotalAmount().compareTo(BigDecimal.valueOf(118.00)));

        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(paymentRepository, times(1)).save(any(Payment.class));
        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(emailService, times(1)).sendBookingConfirmationEmail(anyString(), any(Booking.class));
    }

    @Test
    public void testCreateBooking_DoubleBookingConflict() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(parkingSlotRepository.findById(anyLong())).thenReturn(Optional.of(mockSlot));
        // Simulate overlapping booking exists
        when(bookingRepository.existsConflictingBooking(anyLong(), any(), any())).thenReturn(true);

        BookingRequest request = BookingRequest.builder()
                .parkingSlotId(1L)
                .startTime(LocalDateTime.now().plusHours(1))
                .endTime(LocalDateTime.now().plusHours(3))
                .paymentMethod("UPI")
                .build();

        assertThrows(ConcurrentBookingException.class, () -> bookingService.createBooking(request));

        verify(bookingRepository, never()).save(any(Booking.class));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    public void testCreateBooking_OptimisticLockingFailure() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(parkingSlotRepository.findById(anyLong())).thenReturn(Optional.of(mockSlot));
        when(bookingRepository.existsConflictingBooking(anyLong(), any(), any())).thenReturn(false);
        when(pricingRepository.findByParkingLotIdAndVehicleType(anyLong(), anyString())).thenReturn(Optional.of(mockPricing));
        
        // Simulate optimistic locking collision
        when(parkingSlotRepository.save(any(ParkingSlot.class)))
                .thenThrow(new ObjectOptimisticLockingFailureException(ParkingSlot.class, 1L));

        BookingRequest request = BookingRequest.builder()
                .parkingSlotId(1L)
                .startTime(LocalDateTime.now().plusHours(1))
                .endTime(LocalDateTime.now().plusHours(3))
                .paymentMethod("UPI")
                .build();

        assertThrows(ConcurrentBookingException.class, () -> bookingService.createBooking(request));

        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
