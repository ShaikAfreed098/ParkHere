-- Flyway Database Migration V4: Add token and OTP creation timestamps for validation

ALTER TABLE users ADD COLUMN otp_generated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN reset_token_generated_at TIMESTAMP;
