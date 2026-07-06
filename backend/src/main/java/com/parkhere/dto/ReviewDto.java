package com.parkhere.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long parkingLotId;
    private Double rating;
    private String comment;
    private LocalDateTime createdAt;
}
