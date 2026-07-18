package com.parkhere.service;

import com.parkhere.dto.AuthResponse;
import com.parkhere.dto.LoginRequest;
import com.parkhere.dto.RegisterRequest;
import com.parkhere.dto.UserDto;
import com.parkhere.entity.AuditLog;
import com.parkhere.entity.Role;
import com.parkhere.entity.User;
import com.parkhere.exception.BadRequestException;
import com.parkhere.exception.ResourceNotFoundException;
import com.parkhere.mapper.UserMapper;
import com.parkhere.repository.AuditLogRepository;
import com.parkhere.repository.RoleRepository;
import com.parkhere.repository.UserRepository;
import com.parkhere.security.JwtTokenProvider;
import com.parkhere.security.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Random;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final AuditLogRepository auditLogRepository;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider,
                       EmailService emailService, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));
        
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException("Default User Role not found"));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .isVerified(false)
                .verificationToken(otp)
                .otpGeneratedAt(LocalDateTime.now())
                .roles(new HashSet<>(Collections.singletonList(userRole)))
                .build();

        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), otp);

        auditLogRepository.save(AuditLog.builder()
                .action("REGISTER_INITIATED")
                .entityName("User")
                .entityId(user.getId())
                .performedBy(user.getEmail())
                .details("Verification OTP sent to email")
                .build());
    }

    @Transactional
    public void verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getIsVerified()) {
            throw new BadRequestException("User is already verified");
        }

        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(otp)) {
            throw new BadRequestException("Invalid OTP code");
        }

        if (user.getOtpGeneratedAt() == null || user.getOtpGeneratedAt().plusMinutes(10).isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new code.");
        }

        user.setIsVerified(true);
        user.setVerificationToken(null);
        user.setOtpGeneratedAt(null);
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .action("REGISTER_VERIFIED")
                .entityName("User")
                .entityId(user.getId())
                .performedBy(user.getEmail())
                .details("Email verified successfully. Account activated.")
                .build());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Bad credentials"));

        if (!user.getIsVerified()) {
            throw new BadRequestException("Account is not verified. Please verify your email first.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        auditLogRepository.save(AuditLog.builder()
                .action("LOGIN_SUCCESS")
                .entityName("User")
                .entityId(user.getId())
                .performedBy(user.getEmail())
                .details("Successful authentication")
                .build());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserMapper.toDto(user))
                .build();
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        user.setPasswordResetToken(token);
        user.setResetTokenGeneratedAt(LocalDateTime.now());
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), token);

        auditLogRepository.save(AuditLog.builder()
                .action("PASSWORD_RESET_REQUESTED")
                .entityName("User")
                .entityId(user.getId())
                .performedBy(user.getEmail())
                .details("Reset token generated and emailed")
                .build());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (user.getResetTokenGeneratedAt() == null || user.getResetTokenGeneratedAt().plusHours(1).isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired. Please request a new token.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setResetTokenGeneratedAt(null);
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .action("PASSWORD_RESET_SUCCESS")
                .entityName("User")
                .entityId(user.getId())
                .performedBy(user.getEmail())
                .details("Password reset completed successfully")
                .build());
    }
}
