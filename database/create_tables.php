<?php
// Include database configuration
require_once 'db_config.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Function to check if a table exists
function tableExists($pdo, $table) {
    try {
        $result = $pdo->query("SELECT 1 FROM $table LIMIT 1");
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// Create users table if it doesn't exist
if (!tableExists($pdo, 'users')) {
    $pdo->exec("
        CREATE TABLE users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'manager', 'requester') NOT NULL DEFAULT 'requester',
            department VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "Users table created successfully<br>";
} else {
    echo "Users table already exists<br>";
}

// Create items table if it doesn't exist
if (!tableExists($pdo, 'items')) {
    $pdo->exec("
        CREATE TABLE items (
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
        )
    ");
    echo "Items table created successfully<br>";
} else {
    echo "Items table already exists<br>";
}

// Create requests table if it doesn't exist
if (!tableExists($pdo, 'requests')) {
    $pdo->exec("
        CREATE TABLE requests (
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
        )
    ");
    echo "Requests table created successfully<br>";
} else {
    echo "Requests table already exists<br>";
}

// Create request_items table if it doesn't exist
if (!tableExists($pdo, 'request_items')) {
    $pdo->exec("
        CREATE TABLE request_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            request_id VARCHAR(36) NOT NULL,
            item_id VARCHAR(36) NOT NULL,
            quantity INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
        )
    ");
    echo "Request items table created successfully<br>";
} else {
    echo "Request items table already exists<br>";
}

// Create pickup_details table if it doesn't exist
if (!tableExists($pdo, 'pickup_details')) {
    $pdo->exec("
        CREATE TABLE pickup_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            request_id VARCHAR(36) NOT NULL UNIQUE,
            location VARCHAR(100) NOT NULL,
            pickup_time DATETIME,
            delivered BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
        )
    ");
    echo "Pickup details table created successfully<br>";
} else {
    echo "Pickup details table already exists<br>";
}

// Insert a default admin user if none exists
$stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
$stmt->execute();
$adminCount = $stmt->fetchColumn();

if ($adminCount == 0) {
    $adminId = uniqid();
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO users (id, name, email, password, role, department)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $adminId,
        'Admin User',
        'admin@example.com',
        $adminPassword,
        'admin',
        'IT'
    ]);
    
    echo "Default admin user created successfully<br>";
} else {
    echo "Admin user already exists<br>";
}

// Insert some sample items if none exist
$stmt = $pdo->prepare("SELECT COUNT(*) FROM items");
$stmt->execute();
$itemCount = $stmt->fetchColumn();

if ($itemCount == 0) {
    $sampleItems = [
        [
            'id' => uniqid(),
            'name' => 'Laptop',
            'category' => 'Electronics',
            'quantity' => 10,
            'description' => 'Dell XPS 13 laptop',
            'location' => 'Storage Room A',
            'min_quantity' => 2,
            'max_quantity' => 20
        ],
        [
            'id' => uniqid(),
            'name' => 'Monitor',
            'category' => 'Electronics',
            'quantity' => 15,
            'description' => '24-inch Dell monitor',
            'location' => 'Storage Room A',
            'min_quantity' => 3,
            'max_quantity' => 30
        ],
        [
            'id' => uniqid(),
            'name' => 'Keyboard',
            'category' => 'Electronics',
            'quantity' => 20,
            'description' => 'Mechanical keyboard',
            'location' => 'Storage Room B',
            'min_quantity' => 5,
            'max_quantity' => 40
        ],
        [
            'id' => uniqid(),
            'name' => 'Mouse',
            'category' => 'Electronics',
            'quantity' => 25,
            'description' => 'Wireless mouse',
            'location' => 'Storage Room B',
            'min_quantity' => 5,
            'max_quantity' => 50
        ],
        [
            'id' => uniqid(),
            'name' => 'Headphones',
            'category' => 'Electronics',
            'quantity' => 15,
            'description' => 'Noise-cancelling headphones',
            'location' => 'Storage Room C',
            'min_quantity' => 3,
            'max_quantity' => 30
        ]
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($sampleItems as $item) {
        $stmt->execute([
            $item['id'],
            $item['name'],
            $item['category'],
            $item['quantity'],
            $item['description'],
            $item['location'],
            $item['min_quantity'],
            $item['max_quantity']
        ]);
    }
    
    echo "Sample items created successfully<br>";
} else {
    echo "Items already exist<br>";
}

echo "<br>Database setup completed successfully!";
?>
