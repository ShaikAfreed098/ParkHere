package com.parkhere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDto {
    private Long id;
    private Long userId;

    @NotBlank(message = "Registration number is required")
    @Pattern(regexp = "^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$", message = "Registration number must follow standard Indian format, e.g. AP39AB1234")
    private String registrationNumber;

    @NotBlank(message = "Vehicle type is required")
    private String type; // BIKE, CAR, SUV, EV, MINI_TRUCK

    private String modelName;
}
