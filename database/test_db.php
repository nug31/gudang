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

echo "<h1>Database Connection Test</h1>";

try {
    // Create a new PDO instance
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color:green'>Connected successfully to the database: $db_name@$db_host</p>";
    
    // Test query to check if the requests table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'requests'");
    $requestsTableExists = $stmt->rowCount() > 0;
    
    echo "<p>Requests table exists: " . ($requestsTableExists ? 'Yes' : 'No') . "</p>";
    
    if ($requestsTableExists) {
        // Check the structure of the requests table
        $stmt = $pdo->query("DESCRIBE requests");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "<p>Requests table columns: " . implode(', ', $columns) . "</p>";
        
        // Check if there are any requests in the table
        $stmt = $pdo->query("SELECT COUNT(*) FROM requests");
        $requestCount = $stmt->fetchColumn();
        
        echo "<p>Number of requests in the table: " . $requestCount . "</p>";
        
        if ($requestCount > 0) {
            // Get the latest request
            $stmt = $pdo->query("
                SELECT r.*, u.name as requester_name, u.email as requester_email
                FROM requests r
                JOIN users u ON r.requester_id = u.id
                ORDER BY r.created_at DESC
                LIMIT 1
            ");
            $latestRequest = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo "<h2>Latest Request</h2>";
            echo "<pre>" . print_r($latestRequest, true) . "</pre>";
            
            // Get the request items
            $stmt = $pdo->prepare("
                SELECT ri.*, i.name as item_name
                FROM request_items ri
                JOIN items i ON ri.item_id = i.id
                WHERE ri.request_id = ?
            ");
            $stmt->execute([$latestRequest['id']]);
            $requestItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "<h2>Request Items</h2>";
            echo "<pre>" . print_r($requestItems, true) . "</pre>";
        }
    }
    
    // Test query to check if the request_items table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'request_items'");
    $requestItemsTableExists = $stmt->rowCount() > 0;
    
    echo "<p>Request items table exists: " . ($requestItemsTableExists ? 'Yes' : 'No') . "</p>";
    
    if ($requestItemsTableExists) {
        // Check the structure of the request_items table
        $stmt = $pdo->query("DESCRIBE request_items");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "<p>Request items table columns: " . implode(', ', $columns) . "</p>";
        
        // Check if there are any request items in the table
        $stmt = $pdo->query("SELECT COUNT(*) FROM request_items");
        $requestItemCount = $stmt->fetchColumn();
        
        echo "<p>Number of request items in the table: " . $requestItemCount . "</p>";
    }
    
    // Test query to check if the users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    $usersTableExists = $stmt->rowCount() > 0;
    
    echo "<p>Users table exists: " . ($usersTableExists ? 'Yes' : 'No') . "</p>";
    
    if ($usersTableExists) {
        // Check if there are any users in the table
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        $userCount = $stmt->fetchColumn();
        
        echo "<p>Number of users in the table: " . $userCount . "</p>";
        
        if ($userCount > 0) {
            // Get the first user
            $stmt = $pdo->query("SELECT * FROM users LIMIT 1");
            $firstUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo "<h2>First User</h2>";
            echo "<pre>" . print_r($firstUser, true) . "</pre>";
        }
    }
    
    // Test query to check if the items table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'items'");
    $itemsTableExists = $stmt->rowCount() > 0;
    
    echo "<p>Items table exists: " . ($itemsTableExists ? 'Yes' : 'No') . "</p>";
    
    if ($itemsTableExists) {
        // Check if there are any items in the table
        $stmt = $pdo->query("SELECT COUNT(*) FROM items");
        $itemCount = $stmt->fetchColumn();
        
        echo "<p>Number of items in the table: " . $itemCount . "</p>";
        
        if ($itemCount > 0) {
            // Get the first item
            $stmt = $pdo->query("SELECT * FROM items LIMIT 1");
            $firstItem = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo "<h2>First Item</h2>";
            echo "<pre>" . print_r($firstItem, true) . "</pre>";
        }
    }
    
} catch(PDOException $e) {
    echo "<p style='color:red'>Connection failed: " . $e->getMessage() . "</p>";
}
?>
