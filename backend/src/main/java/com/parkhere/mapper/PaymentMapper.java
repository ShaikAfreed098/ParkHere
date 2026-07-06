package com.parkhere.mapper;

import com.parkhere.dto.PaymentDto;
import com.parkhere.entity.Payment;

public class PaymentMapper {
    public static PaymentDto toDto(Payment payment) {
        if (payment == null) return null;
        return PaymentDto.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .status(payment.getStatus())
                .gstNumber(payment.getGstNumber())
                .invoiceNumber(payment.getInvoiceNumber())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
