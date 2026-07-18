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
(2, 'admin@parkhere.in', '$2a$10$wK1VfK.g1Lz5c5l6C/myeuJsz6E1zFkQ32mQ4wQGjE6B1516tN3zS', 'Akash', 'Rao', '+919999999999', true);

-- Link Users to Roles
INSERT INTO users_roles (user_id, role_id) VALUES
(2, 2); -- Akash is Admin

-- 5. Seed Vehicles (Removed for fresh start)

