-- Create database
CREATE DATABASE IF NOT EXISTS helphub;
USE helphub;

--------------------------------------------------------
-- CUSTOMERS TABLE
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(190) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(120) UNIQUE,
    google_id VARCHAR(255) UNIQUE,         -- Google OAuth ID
    profile_picture VARCHAR(255),          -- Google profile image
    mobile_number VARCHAR(120),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------
-- SERVICE PROVIDERS TABLE
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(190) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,         -- Google OAuth ID
    company_name VARCHAR(150),
    service_category VARCHAR(150),
    business_location VARCHAR(200),
    profile_picture VARCHAR(255),
    mobile_number VARCHAR(120),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending', -- Approval by admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------
-- ADMINS TABLE
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(190) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,   -- Admin still uses password login
    role ENUM('superadmin', 'moderator') DEFAULT 'moderator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------
-- SERVICES TABLE
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------
-- BOOKINGS TABLE (customer ↔ provider)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    scheduled_date DATETIME,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (provider_id) REFERENCES service_providers(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

--------------------------------------------------------
-- FEEDBACK TABLE
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

--------------------------------------------------------
-- RATINGS TABLE
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
