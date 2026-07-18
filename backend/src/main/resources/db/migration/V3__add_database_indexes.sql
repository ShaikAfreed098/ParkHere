-- Flyway Database Migration V3: Add Query Optimization Indexes

-- 1. Create Indexes for foreign keys to optimize query performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_parking_slot_id ON bookings(parking_slot_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_parking_slots_floor_id ON parking_slots(floor_id);
CREATE INDEX idx_floors_parking_lot_id ON floors(parking_lot_id);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);


