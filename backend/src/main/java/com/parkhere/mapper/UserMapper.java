package com.parkhere.mapper;

import com.parkhere.dto.UserDto;
import com.parkhere.entity.Role;
import com.parkhere.entity.User;
import java.util.stream.Collectors;

public class UserMapper {
    public static UserDto toDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .isVerified(user.getIsVerified())
                .roles(user.getRoles() == null ? null : 
                       user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }
}
