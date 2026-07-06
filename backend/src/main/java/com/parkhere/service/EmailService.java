package com.parkhere.service;

import com.parkhere.entity.Booking;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class EmailService {

    @Value("${app.email.mock-dir}")
    private String mockEmailDir;

    private void writeEmailToFile(String recipient, String subject, String body) {
        try {
            Files.createDirectories(Paths.get(mockEmailDir));
            String fileName = recipient.replace("@", "_at_").replace(".", "_") + "_" + System.currentTimeMillis() + ".txt";
            File emailFile = new File(mockEmailDir, fileName);
            
            try (FileWriter writer = new FileWriter(emailFile)) {
                writer.write("To: " + recipient + "\n");
                writer.write("Subject: " + subject + "\n");
                writer.write("Date: " + java.time.LocalDateTime.now() + "\n");
                writer.write("-----------------------------------------\n\n");
                writer.write(body);
            }
            
            log.info("Mock Email sent to {}. Saved to {}", recipient, emailFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to write mock email to file", e);
        }
    }

    public void sendVerificationEmail(String email, String otp) {
        String subject = "Verify your ParkHere Account";
        String body = "Namaste!\n\n" +
                "Thank you for registering with ParkHere, India's smart parking network.\n" +
                "Please use the following 6-digit OTP to verify your email address:\n\n" +
                "OTP Code: " + otp + "\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "Happy Parking!\n" +
                "Team ParkHere";
        writeEmailToFile(email, subject, body);
    }

    public void sendPasswordResetEmail(String email, String token) {
        String subject = "Reset your ParkHere Password";
        String body = "Namaste!\n\n" +
                "We received a request to reset the password for your ParkHere account.\n" +
                "Please use the following reset token to proceed:\n\n" +
                "Reset Token: " + token + "\n\n" +
                "Or enter it in the app screen. This token will expire in 1 hour.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "Team ParkHere";
        writeEmailToFile(email, subject, body);
    }

    public void sendBookingConfirmationEmail(String email, Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String subject = "Booking Confirmed - " + booking.getParkingSlot().getFloor().getParkingLot().getName();
        String body = "Namaste!\n\n" +
                "Your parking slot has been successfully reserved!\n\n" +
                "Booking Details:\n" +
                "-----------------------------------------\n" +
                "Parking Lot: " + booking.getParkingSlot().getFloor().getParkingLot().getName() + "\n" +
                "Address: " + booking.getParkingSlot().getFloor().getParkingLot().getAddress() + "\n" +
                "Floor: " + booking.getParkingSlot().getFloor().getFloorName() + "\n" +
                "Slot Number: " + booking.getParkingSlot().getSlotNumber() + "\n" +
                "Start Time: " + booking.getStartTime().format(formatter) + " IST\n" +
                "End Time: " + booking.getEndTime().format(formatter) + " IST\n" +
                "Total Duration: " + booking.getDurationHours() + " hour(s)\n" +
                "Total Amount Paid: \u20B9" + booking.getTotalAmount() + " (includes 18% GST)\n" +
                "-----------------------------------------\n\n" +
                "Your booking QR code is attached. Scan this QR code at the entry gate to check in.\n\n" +
                "Please arrive before your reservation expires.\n\n" +
                "Thank you for choosing ParkHere.\n" +
                "Team ParkHere";
        writeEmailToFile(email, subject, body);
    }
}
