-- Flyway Database Migration V1: Schema Initialization

-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roles Table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 3. Permissions Table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Roles - Permissions Join Table
CREATE TABLE roles_permissions (
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 5. Users - Roles Join Table
CREATE TABLE users_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 6. Vehicles Table
CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- BIKE, CAR, SUV, EV, MINI_TRUCK
    model_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Parking Lots Table
CREATE TABLE parking_lots (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    distance VARCHAR(50),
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    image_url TEXT,
    amenities VARCHAR(255)[] NOT NULL,
    operating_hours VARCHAR(100) DEFAULT '00:00 - 24:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Floors Table
CREATE TABLE floors (
    id BIGSERIAL PRIMARY KEY,
    parking_lot_id BIGINT REFERENCES parking_lots(id) ON DELETE CASCADE,
    floor_name VARCHAR(100) NOT NULL, -- e.g. B1, Ground Floor, 1st Floor
    floor_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parking_lot_id, floor_number)
);

-- 9. Parking Slots Table
CREATE TABLE parking_slots (
    id BIGSERIAL PRIMARY KEY,
    floor_id BIGINT REFERENCES floors(id) ON DELETE CASCADE,
    slot_number VARCHAR(50) NOT NULL, -- e.g. A-01, A-02, B-10
    type VARCHAR(50) NOT NULL, -- BIKE, CAR, SUV, EV, ACCESSIBLE
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, RESERVED, DISABLED
    version BIGINT NOT NULL DEFAULT 0, -- Optimistic locking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(floor_id, slot_number)
);

-- 10. Bookings Table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    parking_slot_id BIGINT REFERENCES parking_slots(id) ON DELETE RESTRICT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_hours INT NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, CANCELLED
    qr_code_data VARCHAR(255) NOT NULL UNIQUE,
    qr_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Payments Table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    payment_method VARCHAR(100) NOT NULL, -- UPI, GOOGLE_PAY, PHONEPE, PAYTM, DEBIT_CARD, CREDIT_CARD, NET_BANKING
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    gst_number VARCHAR(50),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Pricings Table
CREATE TABLE pricings (
    id BIGSERIAL PRIMARY KEY,
    parking_lot_id BIGINT REFERENCES parking_lots(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL, -- BIKE, CAR, SUV, EV, MINI_TRUCK
    price_per_hour DECIMAL(10,2) NOT NULL,
    UNIQUE(parking_lot_id, vehicle_type)
);

-- 13. Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- BOOKING_CONFIRMED, BOOKING_EXPIRING, ARRIVAL_REMINDER, GENERAL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Reviews Table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    parking_lot_id BIGINT REFERENCES parking_lots(id) ON DELETE CASCADE,
    rating DECIMAL(3,2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Audit Logs Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    performed_by VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- Indices for Fast Searching & Joins
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_parking_slots_floor ON parking_slots(floor_id);
CREATE INDEX idx_parking_slots_type_status ON parking_slots(type, status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_slot ON bookings(parking_slot_id);
CREATE INDEX idx_bookings_time ON bookings(start_time, end_time);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_reviews_lot ON reviews(parking_lot_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
