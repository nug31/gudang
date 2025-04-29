-- Create the database
CREATE DATABASE IF NOT EXISTS itemtrack;
USE itemtrack;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('requester', 'admin', 'manager') NOT NULL DEFAULT 'requester',
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_stock INT NOT NULL DEFAULT 0,
    available_stock INT NOT NULL DEFAULT 0,
    reserved_stock INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(36) PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    requester_id VARCHAR(36) NOT NULL,
    reason TEXT,
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    due_date DATE,
    status ENUM('pending', 'approved', 'denied', 'fulfilled', 'out_of_stock') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create request_items table (junction table for requests and items)
CREATE TABLE IF NOT EXISTS request_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Create pickup_details table
CREATE TABLE IF NOT EXISTS pickup_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL,
    pickup_time DATETIME,
    delivered BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (id, name, email, password, role, department) VALUES
('1', 'John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'requester', 'Engineering'),
('2', 'Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Operations'),
('3', 'Bob Johnson', 'bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 'Engineering');

-- Insert sample items
INSERT INTO items (id, name, description, total_stock, available_stock, reserved_stock, low_stock_threshold, category) VALUES
('1', 'Arduino Uno', 'Microcontroller board based on the ATmega328P', 20, 15, 5, 5, 'Electronics'),
('2', 'Raspberry Pi 4', 'Single-board computer with 4GB RAM', 10, 3, 7, 3, 'Electronics'),
('3', 'Soldering Iron', 'Temperature controlled soldering iron', 15, 10, 5, 3, 'Tools'),
('4', 'Breadboard', 'Solderless breadboard for prototyping', 30, 20, 10, 8, 'Electronics'),
('5', 'Oscilloscope', 'Digital oscilloscope for signal analysis', 5, 2, 3, 2, 'Equipment');

-- Insert sample requests
INSERT INTO requests (id, project_name, requester_id, reason, priority, due_date, status, created_at, updated_at) VALUES
('1', 'Smart Home Prototype', '1', 'Building a smart home automation prototype for the senior design project', 'high', '2025-05-15', 'pending', '2025-04-01 00:00:00', '2025-04-01 00:00:00'),
('2', 'Weather Station', '3', 'Creating a weather monitoring station for the campus', 'medium', '2025-05-20', 'approved', '2025-03-25 00:00:00', '2025-03-27 00:00:00'),
('3', 'Signal Analyzer', '1', 'Analyzing signal patterns for the communications project', 'low', NULL, 'fulfilled', '2025-03-10 00:00:00', '2025-03-15 00:00:00'),
('4', 'LED Matrix Display', '3', 'Building an LED matrix display for the department showcase', 'high', '2025-04-25', 'denied', '2025-04-05 00:00:00', '2025-04-06 00:00:00');

-- Insert sample request items
INSERT INTO request_items (request_id, item_id, quantity) VALUES
('1', '1', 2),
('1', '4', 3),
('2', '2', 1),
('2', '3', 1),
('3', '5', 1),
('4', '1', 1),
('4', '4', 2);

-- Insert sample pickup details
INSERT INTO pickup_details (request_id, location, pickup_time, delivered) VALUES
('2', 'Room 302', '2025-04-05 14:00:00', FALSE),
('3', 'Lab 101', '2025-03-17 10:00:00', TRUE);
