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

echo "<html><head><title>Fix Foreign Keys</title>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    .success { color: green; }
    .error { color: red; }
    .warning { color: orange; }
    .card { background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
</style>";
echo "</head><body>";
echo "<h1>Fix Foreign Keys</h1>";

try {
    // Connect to the database
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p class='success'>Connected to database successfully.</p>";
    
    // Check users table
    echo "<div class='card'>";
    echo "<h2>Users Table</h2>";
    
    $result = $mysqli->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows == 0) {
        echo "<p class='error'>Users table does not exist. Creating it...</p>";
        
        $sql = "CREATE TABLE users (
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
            echo "<p class='success'>Users table created successfully.</p>";
        } else {
            throw new Exception("Error creating users table: " . $mysqli->error);
        }
    } else {
        echo "<p class='success'>Users table exists.</p>";
    }
    
    // Check if there are any users
    $result = $mysqli->query("SELECT COUNT(*) as count FROM users");
    $row = $result->fetch_assoc();
    
    echo "<p>Number of users: " . $row['count'] . "</p>";
    
    if ($row['count'] == 0) {
        echo "<p class='warning'>No users found. Creating default admin user...</p>";
        
        $adminId = 'admin123';
        $adminName = 'Admin User';
        $adminEmail = 'admin@example.com';
        $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $adminRole = 'admin';
        $adminDepartment = 'IT';
        
        $sql = "INSERT INTO users (id, name, email, password, role, department) 
                VALUES ('$adminId', '$adminName', '$adminEmail', '$adminPassword', '$adminRole', '$adminDepartment')";
        
        if ($mysqli->query($sql)) {
            echo "<p class='success'>Default admin user created successfully.</p>";
        } else {
            throw new Exception("Error creating default admin user: " . $mysqli->error);
        }
    } else {
        // Show the first 5 users
        $result = $mysqli->query("SELECT id, name, email, role FROM users LIMIT 5");
        
        echo "<table>";
        echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['name'] . "</td>";
            echo "<td>" . $row['email'] . "</td>";
            echo "<td>" . $row['role'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
    echo "</div>";
    
    // Check items table
    echo "<div class='card'>";
    echo "<h2>Items Table</h2>";
    
    $result = $mysqli->query("SHOW TABLES LIKE 'items'");
    if ($result->num_rows == 0) {
        echo "<p class='error'>Items table does not exist. Creating it...</p>";
        
        $sql = "CREATE TABLE items (
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
            echo "<p class='success'>Items table created successfully.</p>";
        } else {
            throw new Exception("Error creating items table: " . $mysqli->error);
        }
    } else {
        echo "<p class='success'>Items table exists.</p>";
    }
    
    // Check if there are any items
    $result = $mysqli->query("SELECT COUNT(*) as count FROM items");
    $row = $result->fetch_assoc();
    
    echo "<p>Number of items: " . $row['count'] . "</p>";
    
    if ($row['count'] == 0) {
        echo "<p class='warning'>No items found. Creating sample items...</p>";
        
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
            
            if ($mysqli->query($sql)) {
                echo "<p class='success'>Item '{$item['name']}' created successfully.</p>";
            } else {
                throw new Exception("Error creating item '{$item['name']}': " . $mysqli->error);
            }
        }
    } else {
        // Show the first 5 items
        $result = $mysqli->query("SELECT id, name, category, quantity FROM items LIMIT 5");
        
        echo "<table>";
        echo "<tr><th>ID</th><th>Name</th><th>Category</th><th>Quantity</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['name'] . "</td>";
            echo "<td>" . $row['category'] . "</td>";
            echo "<td>" . $row['quantity'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
    echo "</div>";
    
    // Check requests table
    echo "<div class='card'>";
    echo "<h2>Requests Table</h2>";
    
    $result = $mysqli->query("SHOW TABLES LIKE 'requests'");
    if ($result->num_rows == 0) {
        echo "<p class='error'>Requests table does not exist. Creating it...</p>";
        
        $sql = "CREATE TABLE requests (
            id VARCHAR(36) PRIMARY KEY,
            project_name VARCHAR(100) NOT NULL,
            requester_id VARCHAR(36) NOT NULL,
            reason TEXT NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            due_date DATE,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        
        if ($mysqli->query($sql)) {
            echo "<p class='success'>Requests table created successfully.</p>";
        } else {
            throw new Exception("Error creating requests table: " . $mysqli->error);
        }
    } else {
        echo "<p class='success'>Requests table exists.</p>";
        
        // Check if the foreign key constraint exists
        $result = $mysqli->query("
            SELECT COUNT(*) as count
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE CONSTRAINT_SCHEMA = '$db_name'
            AND TABLE_NAME = 'requests'
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            AND CONSTRAINT_NAME = 'requests_ibfk_1'
        ");
        
        $row = $result->fetch_assoc();
        
        if ($row['count'] == 0) {
            echo "<p class='warning'>Foreign key constraint does not exist. Adding it...</p>";
            
            // Drop the table and recreate it with the foreign key constraint
            $mysqli->query("DROP TABLE IF EXISTS request_items");
            $mysqli->query("DROP TABLE IF EXISTS pickup_details");
            $mysqli->query("DROP TABLE IF EXISTS requests");
            
            $sql = "CREATE TABLE requests (
                id VARCHAR(36) PRIMARY KEY,
                project_name VARCHAR(100) NOT NULL,
                requester_id VARCHAR(36) NOT NULL,
                reason TEXT NOT NULL,
                priority VARCHAR(20) NOT NULL DEFAULT 'medium',
                due_date DATE,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
            )";
            
            if ($mysqli->query($sql)) {
                echo "<p class='success'>Requests table recreated with foreign key constraint.</p>";
            } else {
                throw new Exception("Error recreating requests table: " . $mysqli->error);
            }
        } else {
            echo "<p class='success'>Foreign key constraint exists.</p>";
        }
    }
    
    // Check if there are any requests
    $result = $mysqli->query("SELECT COUNT(*) as count FROM requests");
    $row = $result->fetch_assoc();
    
    echo "<p>Number of requests: " . $row['count'] . "</p>";
    
    if ($row['count'] > 0) {
        // Show the first 5 requests
        $result = $mysqli->query("
            SELECT r.id, r.project_name, r.requester_id, u.name as requester_name, r.status
            FROM requests r
            JOIN users u ON r.requester_id = u.id
            LIMIT 5
        ");
        
        echo "<table>";
        echo "<tr><th>ID</th><th>Project Name</th><th>Requester ID</th><th>Requester Name</th><th>Status</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['project_name'] . "</td>";
            echo "<td>" . $row['requester_id'] . "</td>";
            echo "<td>" . $row['requester_name'] . "</td>";
            echo "<td>" . $row['status'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
    echo "</div>";
    
    // Check request_items table
    echo "<div class='card'>";
    echo "<h2>Request Items Table</h2>";
    
    $result = $mysqli->query("SHOW TABLES LIKE 'request_items'");
    if ($result->num_rows == 0) {
        echo "<p class='error'>Request items table does not exist. Creating it...</p>";
        
        $sql = "CREATE TABLE request_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            request_id VARCHAR(36) NOT NULL,
            item_id VARCHAR(36) NOT NULL,
            quantity INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
        )";
        
        if ($mysqli->query($sql)) {
            echo "<p class='success'>Request items table created successfully.</p>";
        } else {
            throw new Exception("Error creating request items table: " . $mysqli->error);
        }
    } else {
        echo "<p class='success'>Request items table exists.</p>";
        
        // Check if the foreign key constraints exist
        $result = $mysqli->query("
            SELECT COUNT(*) as count
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE CONSTRAINT_SCHEMA = '$db_name'
            AND TABLE_NAME = 'request_items'
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        ");
        
        $row = $result->fetch_assoc();
        
        if ($row['count'] < 2) {
            echo "<p class='warning'>Foreign key constraints do not exist. Adding them...</p>";
            
            // Drop the table and recreate it with the foreign key constraints
            $mysqli->query("DROP TABLE IF EXISTS request_items");
            
            $sql = "CREATE TABLE request_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id VARCHAR(36) NOT NULL,
                item_id VARCHAR(36) NOT NULL,
                quantity INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
            )";
            
            if ($mysqli->query($sql)) {
                echo "<p class='success'>Request items table recreated with foreign key constraints.</p>";
            } else {
                throw new Exception("Error recreating request items table: " . $mysqli->error);
            }
        } else {
            echo "<p class='success'>Foreign key constraints exist.</p>";
        }
    }
    
    // Check if there are any request items
    $result = $mysqli->query("SELECT COUNT(*) as count FROM request_items");
    $row = $result->fetch_assoc();
    
    echo "<p>Number of request items: " . $row['count'] . "</p>";
    
    if ($row['count'] > 0) {
        // Show the first 5 request items
        $result = $mysqli->query("
            SELECT ri.id, ri.request_id, r.project_name, ri.item_id, i.name as item_name, ri.quantity
            FROM request_items ri
            JOIN requests r ON ri.request_id = r.id
            JOIN items i ON ri.item_id = i.id
            LIMIT 5
        ");
        
        echo "<table>";
        echo "<tr><th>ID</th><th>Request ID</th><th>Project Name</th><th>Item ID</th><th>Item Name</th><th>Quantity</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['request_id'] . "</td>";
            echo "<td>" . $row['project_name'] . "</td>";
            echo "<td>" . $row['item_id'] . "</td>";
            echo "<td>" . $row['item_name'] . "</td>";
            echo "<td>" . $row['quantity'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
    echo "</div>";
    
    // Check pickup_details table
    echo "<div class='card'>";
    echo "<h2>Pickup Details Table</h2>";
    
    $result = $mysqli->query("SHOW TABLES LIKE 'pickup_details'");
    if ($result->num_rows == 0) {
        echo "<p class='error'>Pickup details table does not exist. Creating it...</p>";
        
        $sql = "CREATE TABLE pickup_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            request_id VARCHAR(36) NOT NULL UNIQUE,
            location VARCHAR(100) NOT NULL,
            pickup_time DATETIME,
            delivered BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
        )";
        
        if ($mysqli->query($sql)) {
            echo "<p class='success'>Pickup details table created successfully.</p>";
        } else {
            throw new Exception("Error creating pickup details table: " . $mysqli->error);
        }
    } else {
        echo "<p class='success'>Pickup details table exists.</p>";
        
        // Check if the foreign key constraint exists
        $result = $mysqli->query("
            SELECT COUNT(*) as count
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE CONSTRAINT_SCHEMA = '$db_name'
            AND TABLE_NAME = 'pickup_details'
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        ");
        
        $row = $result->fetch_assoc();
        
        if ($row['count'] == 0) {
            echo "<p class='warning'>Foreign key constraint does not exist. Adding it...</p>";
            
            // Drop the table and recreate it with the foreign key constraint
            $mysqli->query("DROP TABLE IF EXISTS pickup_details");
            
            $sql = "CREATE TABLE pickup_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id VARCHAR(36) NOT NULL UNIQUE,
                location VARCHAR(100) NOT NULL,
                pickup_time DATETIME,
                delivered BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
            )";
            
            if ($mysqli->query($sql)) {
                echo "<p class='success'>Pickup details table recreated with foreign key constraint.</p>";
            } else {
                throw new Exception("Error recreating pickup details table: " . $mysqli->error);
            }
        } else {
            echo "<p class='success'>Foreign key constraint exists.</p>";
        }
    }
    
    // Check if there are any pickup details
    $result = $mysqli->query("SELECT COUNT(*) as count FROM pickup_details");
    $row = $result->fetch_assoc();
    
    echo "<p>Number of pickup details: " . $row['count'] . "</p>";
    
    if ($row['count'] > 0) {
        // Show the first 5 pickup details
        $result = $mysqli->query("
            SELECT pd.id, pd.request_id, r.project_name, pd.location, pd.pickup_time, pd.delivered
            FROM pickup_details pd
            JOIN requests r ON pd.request_id = r.id
            LIMIT 5
        ");
        
        echo "<table>";
        echo "<tr><th>ID</th><th>Request ID</th><th>Project Name</th><th>Location</th><th>Pickup Time</th><th>Delivered</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['request_id'] . "</td>";
            echo "<td>" . $row['project_name'] . "</td>";
            echo "<td>" . $row['location'] . "</td>";
            echo "<td>" . $row['pickup_time'] . "</td>";
            echo "<td>" . ($row['delivered'] ? 'Yes' : 'No') . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
    echo "</div>";
    
    // Close the database connection
    $mysqli->close();
    
    echo "<p class='success'>Database structure fixed successfully.</p>";
    
} catch (Exception $e) {
    echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
    
    // Close the database connection if it exists
    if (isset($mysqli)) {
        $mysqli->close();
    }
}

echo "</body></html>";
?>
