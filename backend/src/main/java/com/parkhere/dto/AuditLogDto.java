package com.parkhere.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private Long id;
    private String action;
    private String entityName;
    private Long entityId;
    private String performedBy;
    private LocalDateTime timestamp;
    private String details;
}
