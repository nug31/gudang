<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Disable error display in the response
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Create a log file for debugging
function logToFile($message) {
    $logFile = __DIR__ . '/verify_database_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Verify Database script started");

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

try {
    // Connect to MySQL without selecting a database
    $mysqli = new mysqli($db_host, $db_user, $db_pass);
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection to MySQL failed: " . $mysqli->connect_error);
    }
    
    logToFile("Connected to MySQL server successfully");
    
    // Check if the database exists
    $result = $mysqli->query("SHOW DATABASES LIKE '$db_name'");
    
    if ($result->num_rows == 0) {
        // Create the database if it doesn't exist
        logToFile("Database '$db_name' does not exist. Creating it...");
        
        if (!$mysqli->query("CREATE DATABASE $db_name")) {
            throw new Exception("Error creating database: " . $mysqli->error);
        }
        
        logToFile("Database created successfully");
    } else {
        logToFile("Database '$db_name' exists");
    }
    
    // Select the database
    if (!$mysqli->select_db($db_name)) {
        throw new Exception("Error selecting database: " . $mysqli->error);
    }
    
    logToFile("Selected database '$db_name'");
    
    // Create users table if it doesn't exist
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
    
    if (!$mysqli->query($sql)) {
        throw new Exception("Error creating users table: " . $mysqli->error);
    }
    
    logToFile("Users table created or already exists");
    
    // Create items table if it doesn't exist
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
    
    if (!$mysqli->query($sql)) {
        throw new Exception("Error creating items table: " . $mysqli->error);
    }
    
    logToFile("Items table created or already exists");
    
    // Create requests table if it doesn't exist
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
    
    if (!$mysqli->query($sql)) {
        throw new Exception("Error creating requests table: " . $mysqli->error);
    }
    
    logToFile("Requests table created or already exists");
    
    // Create request_items table if it doesn't exist
    $sql = "CREATE TABLE IF NOT EXISTS request_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(36) NOT NULL,
        item_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if (!$mysqli->query($sql)) {
        throw new Exception("Error creating request_items table: " . $mysqli->error);
    }
    
    logToFile("Request items table created or already exists");
    
    // Insert a default admin user if none exists
    $result = $mysqli->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 0) {
        $adminId = 'admin123';
        $adminName = 'Admin User';
        $adminEmail = 'admin@example.com';
        $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $adminRole = 'admin';
        $adminDepartment = 'IT';
        
        $sql = "INSERT INTO users (id, name, email, password, role, department) 
                VALUES ('$adminId', '$adminName', '$adminEmail', '$adminPassword', '$adminRole', '$adminDepartment')";
        
        if (!$mysqli->query($sql)) {
            throw new Exception("Error inserting admin user: " . $mysqli->error);
        }
        
        logToFile("Default admin user created");
    } else {
        logToFile("Admin user already exists");
    }
    
    // Insert some sample items if none exist
    $result = $mysqli->query("SELECT COUNT(*) as count FROM items");
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 0) {
        $items = [
            [
                'id' => 'item1',
                'name' => 'Laptop',
                'category' => 'Electronics',
                'quantity' => 10,
                'description' => 'Dell XPS 13 laptop',
                'location' => 'Storage Room A',
                'min_quantity' => 2,
                'max_quantity' => 20
            ],
            [
                'id' => 'item2',
                'name' => 'Monitor',
                'category' => 'Electronics',
                'quantity' => 15,
                'description' => '24-inch Dell monitor',
                'location' => 'Storage Room A',
                'min_quantity' => 3,
                'max_quantity' => 30
            ],
            [
                'id' => 'item3',
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
            
            if (!$mysqli->query($sql)) {
                throw new Exception("Error inserting item '{$item['name']}': " . $mysqli->error);
            }
            
            logToFile("Item '{$item['name']}' created");
        }
    } else {
        logToFile("Items already exist");
    }
    
    // Check the tables
    $tables = ['users', 'items', 'requests', 'request_items'];
    $tableInfo = [];
    
    foreach ($tables as $table) {
        $result = $mysqli->query("SELECT COUNT(*) as count FROM $table");
        $row = $result->fetch_assoc();
        $tableInfo[$table] = $row['count'];
    }
    
    // Close the connection
    $mysqli->close();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Database verification completed successfully',
        'database' => $db_name,
        'tables' => $tableInfo
    ]);
    
} catch (Exception $e) {
    logToFile("Error: " . $e->getMessage());
    
    // Close the connection if it exists
    if (isset($mysqli)) {
        $mysqli->close();
    }
    
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
