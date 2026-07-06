package com.parkhere.mapper;

import com.parkhere.dto.NotificationDto;
import com.parkhere.entity.Notification;

public class NotificationMapper {
    public static NotificationDto toDto(Notification notif) {
        if (notif == null) return null;
        return NotificationDto.builder()
                .id(notif.getId())
                .userId(notif.getUser().getId())
                .title(notif.getTitle())
                .message(notif.getMessage())
                .isRead(notif.getIsRead())
                .type(notif.getType())
                .createdAt(notif.getCreatedAt())
                .build();
    }
}
