package com.parkhere.mapper;

import com.parkhere.dto.BookingDto;
import com.parkhere.entity.Booking;
import com.parkhere.entity.Payment;

public class BookingMapper {
    public static BookingDto toDto(Booking booking, Payment payment) {
        if (booking == null) return null;
        
        BookingDto.BookingDtoBuilder builder = BookingDto.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userEmail(booking.getUser().getEmail())
                .userPhone(booking.getUser().getPhone())
                .parkingSlotId(booking.getParkingSlot().getId())
                .slotNumber(booking.getParkingSlot().getSlotNumber())
                .floorName(booking.getParkingSlot().getFloor().getFloorName())
                .parkingLotId(booking.getParkingSlot().getFloor().getParkingLot().getId())
                .parkingLotName(booking.getParkingSlot().getFloor().getParkingLot().getName())
                .parkingLotAddress(booking.getParkingSlot().getFloor().getParkingLot().getAddress())
                .parkingLotImage(booking.getParkingSlot().getFloor().getParkingLot().getImageUrl())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .durationHours(booking.getDurationHours())
                .baseAmount(booking.getBaseAmount())
                .taxAmount(booking.getTaxAmount())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .qrCodeData(booking.getQrCodeData())
                .qrExpiresAt(booking.getQrExpiresAt())
                .createdAt(booking.getCreatedAt());

        if (payment != null) {
            builder.invoiceNumber(payment.getInvoiceNumber())
                   .transactionId(payment.getTransactionId())
                   .paymentMethod(payment.getPaymentMethod())
                   .paymentStatus(payment.getStatus());
        }

        return builder.build();
    }
}
