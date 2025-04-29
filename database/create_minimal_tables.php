<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

echo "<h1>Create Minimal Tables</h1>";

try {
    // Connect to MySQL
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p>Connected to database successfully.</p>";
    
    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'requester',
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($mysqli->query($sql)) {
        echo "<p>Users table created successfully.</p>";
    } else {
        throw new Exception("Error creating users table: " . $mysqli->error);
    }
    
    // Create items table
    $sql = "CREATE TABLE IF NOT EXISTS items (
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
    )";
    
    if ($mysqli->query($sql)) {
        echo "<p>Items table created successfully.</p>";
    } else {
        throw new Exception("Error creating items table: " . $mysqli->error);
    }
    
    // Create requests table
    $sql = "CREATE TABLE IF NOT EXISTS requests (
        id VARCHAR(36) PRIMARY KEY,
        project_name VARCHAR(100) NOT NULL,
        requester_id VARCHAR(36) NOT NULL,
        reason TEXT NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        due_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($mysqli->query($sql)) {
        echo "<p>Requests table created successfully.</p>";
    } else {
        throw new Exception("Error creating requests table: " . $mysqli->error);
    }
    
    // Create request_items table
    $sql = "CREATE TABLE IF NOT EXISTS request_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(36) NOT NULL,
        item_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($mysqli->query($sql)) {
        echo "<p>Request items table created successfully.</p>";
    } else {
        throw new Exception("Error creating request_items table: " . $mysqli->error);
    }
    
    // Create pickup_details table
    $sql = "CREATE TABLE IF NOT EXISTS pickup_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(36) NOT NULL,
        location VARCHAR(100) NOT NULL,
        pickup_time DATETIME,
        delivered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($mysqli->query($sql)) {
        echo "<p>Pickup details table created successfully.</p>";
    } else {
        throw new Exception("Error creating pickup_details table: " . $mysqli->error);
    }
    
    // Insert a default admin user if none exists
    $result = $mysqli->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 0) {
        $adminId = uniqid();
        $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (id, name, email, password, role, department) 
                VALUES ('$adminId', 'Admin User', 'admin@example.com', '$adminPassword', 'admin', 'IT')";
        
        if ($mysqli->query($sql)) {
            echo "<p>Default admin user created successfully.</p>";
        } else {
            throw new Exception("Error creating default admin user: " . $mysqli->error);
        }
    } else {
        echo "<p>Admin user already exists.</p>";
    }
    
    // Insert some sample items if none exist
    $result = $mysqli->query("SELECT COUNT(*) as count FROM items");
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 0) {
        $items = [
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
            ]
        ];
        
        foreach ($items as $item) {
            $sql = "INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity) 
                    VALUES ('{$item['id']}', '{$item['name']}', '{$item['category']}', {$item['quantity']}, 
                            '{$item['description']}', '{$item['location']}', {$item['min_quantity']}, {$item['max_quantity']})";
            
            if ($mysqli->query($sql)) {
                echo "<p>Item '{$item['name']}' created successfully.</p>";
            } else {
                throw new Exception("Error creating item '{$item['name']}': " . $mysqli->error);
            }
        }
    } else {
        echo "<p>Items already exist.</p>";
    }
    
    // Close the connection
    $mysqli->close();
    
    echo "<p>All tables created successfully.</p>";
    
} catch (Exception $e) {
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?>
