-- Flyway Database Migration V2: Seed Data

-- 1. Insert Roles
INSERT INTO roles (id, name) VALUES 
(1, 'ROLE_USER'),
(2, 'ROLE_ADMIN');

-- 2. Insert Permissions
INSERT INTO permissions (id, name) VALUES
(1, 'READ_PARKING'),
(2, 'WRITE_PARKING'),
(3, 'MANAGE_USERS'),
(4, 'MANAGE_BOOKINGS');

-- 3. Link Roles and Permissions
INSERT INTO roles_permissions (role_id, permission_id) VALUES
(1, 1), -- USER can read parking
(1, 4), -- USER can manage bookings
(2, 1), -- ADMIN can do all
(2, 2),
(2, 3),
(2, 4);

-- 4. Seed Users (Bcrypt encrypted passwords for 'password')
-- Hash: $2a$10$wK1VfK.g1Lz5c5l6C/myeuJsz6E1zFkQ32mQ4wQGjE6B1516tN3zS
INSERT INTO users (id, email, password, first_name, last_name, phone, is_verified) VALUES
(1, 'rahul@parkhere.in', '$2a$10$wK1VfK.g1Lz5c5l6C/myeuJsz6E1zFkQ32mQ4wQGjE6B1516tN3zS', 'Rahul', 'Sharma', '+919876543210', true),
(2, 'admin@parkhere.in', '$2a$10$wK1VfK.g1Lz5c5l6C/myeuJsz6E1zFkQ32mQ4wQGjE6B1516tN3zS', 'Akash', 'Rao', '+919999999999', true),
(3, 'ananya@parkhere.in', '$2a$10$wK1VfK.g1Lz5c5l6C/myeuJsz6E1zFkQ32mQ4wQGjE6B1516tN3zS', 'Ananya', 'Reddy', '+918765432109', true);

-- Link Users to Roles
INSERT INTO users_roles (user_id, role_id) VALUES
(1, 1), -- Rahul is User
(2, 2), -- Akash is Admin
(3, 1); -- Ananya is User

-- 5. Seed Vehicles
INSERT INTO vehicles (id, user_id, registration_number, type, model_name) VALUES
(1, 1, 'AP39AB1234', 'CAR', 'Hyundai i20'),
(2, 1, 'TS09CD4567', 'EV', 'Tata Nexon EV'),
(3, 3, 'KA01EF7890', 'SUV', 'Mahindra XUV700');

-- 6. Seed Parking Lots (Indian Localities)
INSERT INTO parking_lots (id, name, address, latitude, longitude, distance, description, rating, reviews_count, image_url, amenities, operating_hours) VALUES
(1, 'ParkHere Banjara Hills', 'Road No. 1, Banjara Hills, Near GVK One Mall, Hyderabad, Telangana', 17.4192, 78.4484, '0.3 km', 'Premium multi-level parking lot located in the heart of Banjara Hills. Offering high-speed EV chargers and top-tier security.', 4.8, 312, 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&h=400&fit=crop&auto=format', ARRAY['ev', 'covered', 'security', 'wifi'], '00:00 - 24:00'),
(2, 'ParkHere MG Road', 'MG Road, Near Trinity Metro Station, Bengaluru, Karnataka', 12.9738, 77.6119, '0.7 km', 'Spacious parking layout near commercial complexes and metro on MG Road. Affordable and convenient.', 4.5, 189, 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&h=400&fit=crop&auto=format', ARRAY['covered', 'security'], '06:00 - 23:00'),
(3, 'ParkHere Whitefield', 'ITPB Road, Opposite Manyata Tech Park Area, Bengaluru, Karnataka', 12.9698, 77.7499, '1.2 km', 'Smart open-air parking facility with real-time slot checking and multiple high-output EV charging stations.', 4.2, 95, 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=400&fit=crop&auto=format', ARRAY['ev', 'security', 'wifi'], '00:00 - 24:00'),
(4, 'ParkHere Connaught Place', 'Radial Road 3, Connaught Place, Block E, New Delhi, Delhi', 28.6304, 77.2177, '1.8 km', 'Premium underground automated parking in Connaught Place. Fully covered with absolute safety guards and valet assistance.', 4.9, 441, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=400&fit=crop&auto=format', ARRAY['ev', 'covered', 'security', 'wifi', 'accessible'], '00:00 - 24:00'),
(5, 'ParkHere Bandra West', 'Linking Road, Near National College, Bandra West, Mumbai, Maharashtra', 19.0607, 72.8362, '0.5 km', 'Sleek multi-level garage in Mumbais commercial high street. Direct access to shops and food junctions.', 4.6, 228, 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=400&fit=crop&auto=format', ARRAY['covered', 'security', 'wifi'], '08:00 - 23:30'),
(6, 'ParkHere Hitech City', 'Madhapur Main Road, Near Mindspace IT Park, Hyderabad, Telangana', 17.4435, 78.3772, '2.1 km', 'State-of-the-art smart parking next to Hitech Citys major tech parks. Multi-story automated layout with wheelchair access.', 4.7, 183, 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&h=400&fit=crop&auto=format', ARRAY['ev', 'covered', 'security', 'wifi', 'accessible'], '00:00 - 24:00');

-- 7. Seed Pricing structures for Lots
-- Parking Lot 1: Banjara Hills
INSERT INTO pricings (parking_lot_id, vehicle_type, price_per_hour) VALUES
(1, 'BIKE', 20.00),
(1, 'CAR', 50.00),
(1, 'SUV', 80.00),
(1, 'EV', 40.00),
(1, 'MINI_TRUCK', 100.00);

-- Parking Lot 2: MG Road
INSERT INTO pricings (parking_lot_id, vehicle_type, price_per_hour) VALUES
(2, 'BIKE', 15.00),
(2, 'CAR', 40.00),
(2, 'SUV', 60.00),
(2, 'EV', 30.00),
(2, 'MINI_TRUCK', 80.00);

-- Parking Lot 3: Whitefield
INSERT INTO pricings (parking_lot_id, vehicle_type, price_per_hour) VALUES
(3, 'BIKE', 15.00),
(3, 'CAR', 35.00),
(3, 'SUV', 50.00),
(3, 'EV', 25.00),
(3, 'MINI_TRUCK', 70.00);

-- Parking Lot 4: Connaught Place
INSERT INTO pricings (parking_lot_id, vehicle_type, price_per_hour) VALUES
(4, 'BIKE', 30.00),
(4, 'CAR', 80.00),
(4, 'SUV', 120.00),
(4, 'EV', 60.00),
(4, 'MINI_TRUCK', 150.00);

-- Parking Lot 5: Bandra West
INSERT INTO pricings (parking_lot_id, vehicle_type, price_per_hour) VALUES
(5, 'BIKE', 25.00),
(5, 'CAR', 60.00),
(5, 'SUV', 90.00),
(5, 'EV', 50.00),
(5, 'MINI_TRUCK', 120.00);

-- Parking Lot 6: Hitech City
INSERT INTO pricings (parking_lot_id, vehicle_type, price_per_hour) VALUES
(6, 'BIKE', 25.00),
(6, 'CAR', 70.00),
(6, 'SUV', 100.00),
(6, 'EV', 50.00),
(6, 'MINI_TRUCK', 130.00);

-- 8. Seed Floors
-- For each lot we will seed: Floor B1 (Basement 1, val -1) and Floor G (Ground Floor, val 0)
INSERT INTO floors (id, parking_lot_id, floor_name, floor_number) VALUES
(1, 1, 'Basement 1', -1),
(2, 1, 'Ground Floor', 0),
(3, 2, 'Basement 1', -1),
(4, 2, 'Ground Floor', 0),
(5, 3, 'Ground Floor', 0),
(6, 3, '1st Floor', 1),
(7, 4, 'Basement 2', -2),
(8, 4, 'Basement 1', -1),
(9, 5, 'Ground Floor', 0),
(10, 5, '1st Floor', 1),
(11, 6, 'Basement 1', -1),
(12, 6, 'Ground Floor', 0);

-- 9. Seed Parking Slots
-- Seed slots for Floor 1 (Lot 1, Floor B1) and Floor 2 (Lot 1, Floor G)
-- A-01 to A-10 on Floor 1, B-01 to B-10 on Floor 2.
-- We will seed slots for all floors to make selection robust.
-- For Floor 1 (Banjara Hills Basement 1)
INSERT INTO parking_slots (floor_id, slot_number, type, status) VALUES
(1, 'A-01', 'CAR', 'AVAILABLE'),
(1, 'A-02', 'CAR', 'AVAILABLE'),
(1, 'A-03', 'CAR', 'OCCUPIED'),
(1, 'A-04', 'EV', 'AVAILABLE'),
(1, 'A-05', 'EV', 'AVAILABLE'),
(1, 'A-06', 'BIKE', 'AVAILABLE'),
(1, 'A-07', 'BIKE', 'AVAILABLE'),
(1, 'A-08', 'ACCESSIBLE', 'AVAILABLE'),
(1, 'A-09', 'SUV', 'OCCUPIED'),
(1, 'A-10', 'SUV', 'AVAILABLE'),
(1, 'A-11', 'CAR', 'AVAILABLE'),
(1, 'A-12', 'CAR', 'AVAILABLE'),
(1, 'A-13', 'CAR', 'OCCUPIED'),
(1, 'A-14', 'EV', 'AVAILABLE'),
(1, 'A-15', 'EV', 'AVAILABLE');

-- For Floor 2 (Banjara Hills Ground Floor)
INSERT INTO parking_slots (floor_id, slot_number, type, status) VALUES
(2, 'B-01', 'CAR', 'AVAILABLE'),
(2, 'B-02', 'CAR', 'AVAILABLE'),
(2, 'B-03', 'CAR', 'OCCUPIED'),
(2, 'B-04', 'EV', 'AVAILABLE'),
(2, 'B-05', 'EV', 'AVAILABLE'),
(2, 'B-06', 'BIKE', 'AVAILABLE'),
(2, 'B-07', 'BIKE', 'OCCUPIED'),
(2, 'B-08', 'ACCESSIBLE', 'AVAILABLE'),
(2, 'B-09', 'SUV', 'AVAILABLE'),
(2, 'B-10', 'SUV', 'AVAILABLE'),
(2, 'B-11', 'CAR', 'AVAILABLE'),
(2, 'B-12', 'CAR', 'AVAILABLE'),
(2, 'B-13', 'CAR', 'OCCUPIED'),
(2, 'B-14', 'EV', 'AVAILABLE'),
(2, 'B-15', 'EV', 'AVAILABLE');

-- For Floor 3 (MG Road Basement 1)
INSERT INTO parking_slots (floor_id, slot_number, type, status) VALUES
(3, 'A-01', 'CAR', 'AVAILABLE'),
(3, 'A-02', 'CAR', 'OCCUPIED'),
(3, 'A-03', 'EV', 'AVAILABLE'),
(3, 'A-04', 'BIKE', 'AVAILABLE'),
(3, 'A-05', 'BIKE', 'AVAILABLE'),
(3, 'A-06', 'SUV', 'AVAILABLE'),
(3, 'A-07', 'ACCESSIBLE', 'AVAILABLE');

-- For Floor 4 (MG Road Ground Floor)
INSERT INTO parking_slots (floor_id, slot_number, type, status) VALUES
(4, 'B-01', 'CAR', 'AVAILABLE'),
(4, 'B-02', 'CAR', 'OCCUPIED'),
(4, 'B-03', 'EV', 'AVAILABLE'),
(4, 'B-04', 'BIKE', 'AVAILABLE'),
(4, 'B-05', 'BIKE', 'AVAILABLE'),
(4, 'B-06', 'SUV', 'AVAILABLE'),
(4, 'B-07', 'ACCESSIBLE', 'AVAILABLE');

-- For Floor 5 (Whitefield Ground Floor)
INSERT INTO parking_slots (floor_id, slot_number, type, status) VALUES
(5, 'A-01', 'CAR', 'AVAILABLE'),
(5, 'A-02', 'CAR', 'AVAILABLE'),
(5, 'A-03', 'EV', 'AVAILABLE'),
(5, 'A-04', 'BIKE', 'AVAILABLE'),
(5, 'A-05', 'SUV', 'AVAILABLE');

-- For Floor 11 (Hitech City Basement 1)
INSERT INTO parking_slots (floor_id, slot_number, type, status) VALUES
(11, 'A-01', 'CAR', 'AVAILABLE'),
(11, 'A-02', 'CAR', 'AVAILABLE'),
(11, 'A-03', 'EV', 'AVAILABLE'),
(11, 'A-04', 'BIKE', 'AVAILABLE'),
(11, 'A-05', 'SUV', 'AVAILABLE');

-- 10. Seed Notifications
INSERT INTO notifications (user_id, title, message, is_read, type) VALUES
(1, 'Welcome to ParkHere!', 'Your smart parking account has been successfully created. Find, Book, and Park instantly!', false, 'GENERAL'),
(1, 'Booking Confirmed', 'Your parking reservation BK-4501 at ParkHere Banjara Hills was successfully confirmed.', true, 'BOOKING_CONFIRMED');

-- 11. Seed Reviews
INSERT INTO reviews (user_id, parking_lot_id, rating, comment) VALUES
(1, 1, 5.0, 'Best parking garage in Banjara Hills! Extremely clean and valet entry was swift.'),
(3, 1, 4.5, 'EV chargers are very fast. Good covered parking space.'),
(1, 2, 4.0, 'Very close to MG Road Metro, which is super convenient for my daily commute.');
