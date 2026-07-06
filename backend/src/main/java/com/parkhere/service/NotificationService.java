package com.parkhere.service;

import com.parkhere.dto.NotificationDto;
import com.parkhere.entity.Notification;
import com.parkhere.entity.User;
import com.parkhere.exception.BadRequestException;
import com.parkhere.exception.ResourceNotFoundException;
import com.parkhere.mapper.NotificationMapper;
import com.parkhere.repository.NotificationRepository;
import com.parkhere.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found"));
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getMyNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(NotificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long id) {
        User user = getCurrentUser();
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notif.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to notification");
        }

        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(n -> !n.getIsRead())
                .collect(Collectors.toList());

        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
