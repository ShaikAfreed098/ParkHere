package com.parkhere.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userPhone;
    private Long parkingSlotId;
    private String slotNumber;
    private String floorName;
    private Long parkingLotId;
    private String parkingLotName;
    private String parkingLotAddress;
    private String parkingLotImage;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationHours;
    private BigDecimal baseAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String status;
    private String qrCodeData;
    private LocalDateTime qrExpiresAt;
    private LocalDateTime createdAt;
    
    private String invoiceNumber;
    private String transactionId;
    private String paymentMethod;
    private String paymentStatus;
}
