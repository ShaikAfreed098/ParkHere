package com.parkhere.service;

import com.parkhere.dto.DashboardMetricsDto;
import com.parkhere.entity.Booking;
import com.parkhere.entity.ParkingLot;
import com.parkhere.entity.Payment;
import com.parkhere.entity.Floor;
import com.parkhere.entity.ParkingSlot;
import com.parkhere.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final FloorRepository floorRepository;

    public AdminService(BookingRepository bookingRepository, PaymentRepository paymentRepository,
                        UserRepository userRepository, ParkingLotRepository parkingLotRepository,
                        ParkingSlotRepository parkingSlotRepository, FloorRepository floorRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.parkingLotRepository = parkingLotRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.floorRepository = floorRepository;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsDto getDashboardMetrics() {
        // 1. Basic Stats (directly using DB-level aggregates)
        BigDecimal totalRevenueVal = paymentRepository.sumTotalRevenue();
        BigDecimal totalRevenue = totalRevenueVal != null ? totalRevenueVal : BigDecimal.ZERO;

        long totalBookings = bookingRepository.count();
        long activeBookings = bookingRepository.countByStatus("ACTIVE");
        long totalUsers = userRepository.count();

        long totalSlots = parkingSlotRepository.count();
        long occupiedSlots = parkingSlotRepository.countOccupiedOrReservedSlots();
        double occupancyRate = totalSlots > 0 ? ((double) occupiedSlots / totalSlots) * 100 : 0.0;

        // 2. Revenue Chart Data (Aggregated by Month at database level)
        List<Object[]> monthlyRevList = paymentRepository.getMonthlyRevenueMetrics();
        List<Object[]> monthlyBkgList = bookingRepository.getMonthlyBookingsCount();

        Map<Integer, BigDecimal> monthlyRev = new HashMap<>();
        Map<Integer, Long> monthlyBkg = new HashMap<>();
        for (int i = 1; i <= 12; i++) {
            monthlyRev.put(i, BigDecimal.ZERO);
            monthlyBkg.put(i, 0L);
        }

        for (Object[] row : monthlyRevList) {
            if (row[0] != null) {
                int month = ((Number) row[0]).intValue();
                BigDecimal val = (BigDecimal) row[1];
                monthlyRev.put(month, val);
            }
        }

        for (Object[] row : monthlyBkgList) {
            if (row[0] != null) {
                int month = ((Number) row[0]).intValue();
                long count = ((Number) row[1]).longValue();
                monthlyBkg.put(month, count);
            }
        }

        String[] monthsShort = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<DashboardMetricsDto.RevenueData> revenueDataList = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            BigDecimal val = monthlyRev.get(i + 1);
            long bkgs = monthlyBkg.get(i + 1);

            revenueDataList.add(DashboardMetricsDto.RevenueData.builder()
                    .month(monthsShort[i])
                    .revenue(val)
                    .bookings(bkgs)
                    .build());
        }

        // 3. Vehicle Type counts (Aggregated at database level)
        List<Object[]> vehicleCountsList = bookingRepository.getBookingCountByVehicleType();
        Map<String, Long> vehicleCounts = new HashMap<>();
        vehicleCounts.put("CAR", 0L);
        vehicleCounts.put("SUV", 0L);
        vehicleCounts.put("EV", 0L);
        vehicleCounts.put("BIKE", 0L);
        vehicleCounts.put("MINI_TRUCK", 0L);

        for (Object[] row : vehicleCountsList) {
            if (row[0] != null) {
                String type = ((String) row[0]).toUpperCase();
                long count = ((Number) row[1]).longValue();
                vehicleCounts.put(type, count);
            }
        }

        long carVal = vehicleCounts.get("CAR");
        long suvVal = vehicleCounts.get("SUV");
        long evVal = vehicleCounts.get("EV");
        long bikeVal = vehicleCounts.get("BIKE");
        long truckVal = vehicleCounts.get("MINI_TRUCK");

        List<DashboardMetricsDto.VehicleData> vehicleDataList = Arrays.asList(
                new DashboardMetricsDto.VehicleData("Car", carVal, "#2563EB"),
                new DashboardMetricsDto.VehicleData("SUV", suvVal, "#14B8A6"),
                new DashboardMetricsDto.VehicleData("EV", evVal, "#22C55E"),
                new DashboardMetricsDto.VehicleData("Bike", bikeVal, "#F59E0B"),
                new DashboardMetricsDto.VehicleData("Truck", truckVal, "#8B5CF6")
        );

        // 4. Utilization per ParkingLot (Calculated in a single DB query!)
        List<Object[]> lotUtils = parkingSlotRepository.getParkingLotUtilization();
        List<DashboardMetricsDto.UtilizationData> utilizationDataList = lotUtils.stream().map(row -> {
            String name = (String) row[1];
            double rate = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            return DashboardMetricsDto.UtilizationData.builder()
                    .name(name.replace("ParkHere ", ""))
                    .value(Math.round(rate * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());

        // 5. Daily bookings distribution (Aggregated at database level)
        List<Object[]> dailyCountsList = bookingRepository.getDailyBookingsDistribution();
        Map<Integer, Long> dailyCounts = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            dailyCounts.put(i, 0L); // 0 = Sunday, 1 = Monday, etc. (standard EXTRACT(DOW))
        }
        for (Object[] row : dailyCountsList) {
            if (row[0] != null) {
                int dow = ((Number) row[0]).intValue();
                long count = ((Number) row[1]).longValue();
                dailyCounts.put(dow, count);
            }
        }

        List<DashboardMetricsDto.DailyData> dailyDataList = new ArrayList<>();
        // Group by Mon to Sun sequence to match original layout
        int[] dowSequence = {1, 2, 3, 4, 5, 6, 0}; // Mon (1) to Sun (0)
        String[] daysSequenceLabels = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};

        for (int i = 0; i < 7; i++) {
            int dow = dowSequence[i];
            long count = dailyCounts.get(dow);
            dailyDataList.add(new DashboardMetricsDto.DailyData(daysSequenceLabels[i], count));
        }

        return DashboardMetricsDto.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .totalUsers(totalUsers)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .revenueData(revenueDataList)
                .vehicleData(vehicleDataList)
                .utilizationData(utilizationDataList)
                .dailyData(dailyDataList)
                .build();
    }
}
