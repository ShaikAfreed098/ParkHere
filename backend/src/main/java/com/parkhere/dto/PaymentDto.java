package com.parkhere.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDto {
    private Long id;
    private Long bookingId;
    private String paymentMethod;
    private String transactionId;
    private String status;
    private String gstNumber;
    private String invoiceNumber;
    private LocalDateTime createdAt;
}
