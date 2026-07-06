package com.parkhere.controller;

import com.parkhere.dto.AuthResponse;
import com.parkhere.dto.LoginRequest;
import com.parkhere.dto.RegisterRequest;
import com.parkhere.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful. Please check your phone for verification code.");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String email, @RequestParam String otp) {
        authService.verifyEmail(email, otp);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully. You can now login.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset token sent to your email.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestParam String token, @RequestParam String password) {
        authService.resetPassword(token, password);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful.");
        return ResponseEntity.ok(response);
    }
}
