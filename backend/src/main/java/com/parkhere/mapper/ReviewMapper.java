package com.parkhere.mapper;

import com.parkhere.dto.ReviewDto;
import com.parkhere.entity.Review;

public class ReviewMapper {
    public static ReviewDto toDto(Review review) {
        if (review == null) return null;
        return ReviewDto.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFirstName() + " " + review.getUser().getLastName())
                .parkingLotId(review.getParkingLot().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
