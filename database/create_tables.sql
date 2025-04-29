-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'requester') NOT NULL DEFAULT 'requester',
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create items table if it doesn't exist
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    description TEXT,
    location VARCHAR(100),
    min_quantity INT DEFAULT 0,
    max_quantity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(36) PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    requester_id VARCHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    due_date DATE,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create request_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS request_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Create pickup_details table if it doesn't exist
CREATE TABLE IF NOT EXISTS pickup_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL,
    pickup_time DATETIME,
    delivered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Insert a default admin user if none exists
INSERT INTO users (id, name, email, password, role, department)
SELECT 'admin123', 'Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'IT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');

-- Insert some sample items if none exist
INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity)
SELECT 'item1', 'Laptop', 'Electronics', 10, 'Dell XPS 13 laptop', 'Storage Room A', 2, 20
WHERE NOT EXISTS (SELECT 1 FROM items);

INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity)
SELECT 'item2', 'Monitor', 'Electronics', 15, '24-inch Dell monitor', 'Storage Room A', 3, 30
WHERE NOT EXISTS (SELECT 1 FROM items WHERE id != 'item1');

INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity)
SELECT 'item3', 'Keyboard', 'Electronics', 20, 'Mechanical keyboard', 'Storage Room B', 5, 40
WHERE NOT EXISTS (SELECT 1 FROM items WHERE id != 'item1' AND id != 'item2');

INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity)
SELECT 'item4', 'Mouse', 'Electronics', 25, 'Wireless mouse', 'Storage Room B', 5, 50
WHERE NOT EXISTS (SELECT 1 FROM items WHERE id != 'item1' AND id != 'item2' AND id != 'item3');

INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity)
SELECT 'item5', 'Headphones', 'Electronics', 15, 'Noise-cancelling headphones', 'Storage Room C', 3, 30
WHERE NOT EXISTS (SELECT 1 FROM items WHERE id != 'item1' AND id != 'item2' AND id != 'item3' AND id != 'item4');
