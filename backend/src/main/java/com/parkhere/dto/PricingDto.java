package com.parkhere.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingDto {
    private Long id;
    private Long parkingLotId;
    private String vehicleType;
    private BigDecimal pricePerHour;
}
