package com.parkhere.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {
    @NotNull(message = "Parking slot ID is required")
    private Long parkingSlotId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private String vehicleRegistrationNumber;

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // UPI, GOOGLE_PAY, PHONEPE, PAYTM, DEBIT_CARD, CREDIT_CARD, NET_BANKING
}
