package com.parkhere.controller;

import com.parkhere.dto.BookingDto;
import com.parkhere.dto.BookingRequest;
import com.parkhere.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingDto booking = bookingService.createBooking(request);
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingDto>> getMyBookings() {
        List<BookingDto> bookings = bookingService.getMyBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingDetails(@PathVariable Long id) {
        BookingDto booking = bookingService.getBookingDetails(id);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/qr/scan")
    public ResponseEntity<BookingDto> scanQrCode(@RequestParam String qrData) {
        BookingDto booking = bookingService.scanAndValidateQrCode(qrData);
        return ResponseEntity.ok(booking);
    }
}
