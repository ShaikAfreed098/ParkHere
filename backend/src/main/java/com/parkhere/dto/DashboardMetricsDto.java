package com.parkhere.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMetricsDto {
    private BigDecimal totalRevenue;
    private Long totalBookings;
    private Long activeBookings;
    private Long totalUsers;
    private Double occupancyRate;

    private List<RevenueData> revenueData;
    private List<VehicleData> vehicleData;
    private List<UtilizationData> utilizationData;
    private List<DailyData> dailyData;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueData {
        private String month;
        private BigDecimal revenue;
        private Long bookings;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VehicleData {
        private String name;
        private Long value;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UtilizationData {
        private String name;
        private Double value;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyData {
        private String day;
        private Long bookings;
    }
}
