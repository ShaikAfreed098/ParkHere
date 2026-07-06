package com.parkhere.controller;

import com.parkhere.dto.AuditLogDto;
import com.parkhere.dto.DashboardMetricsDto;
import com.parkhere.entity.AuditLog;
import com.parkhere.mapper.AuditLogMapper;
import com.parkhere.repository.AuditLogRepository;
import com.parkhere.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AuditLogRepository auditLogRepository;

    public AdminController(AdminService adminService, AuditLogRepository auditLogRepository) {
        this.adminService = adminService;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsDto> getDashboardMetrics() {
        DashboardMetricsDto metrics = adminService.getDashboardMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs() {
        List<AuditLogDto> logs = auditLogRepository.findByOrderByTimestampDesc().stream()
                .map(AuditLogMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }
}
