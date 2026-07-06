package com.parkhere.mapper;

import com.parkhere.dto.AuditLogDto;
import com.parkhere.entity.AuditLog;

public class AuditLogMapper {
    public static AuditLogDto toDto(AuditLog log) {
        if (log == null) return null;
        return AuditLogDto.builder()
                .id(log.getId())
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .performedBy(log.getPerformedBy())
                .timestamp(log.getTimestamp())
                .details(log.getDetails())
                .build();
    }
}
