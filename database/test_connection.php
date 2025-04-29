<?php
// Include database configuration
require_once 'db_config.php';

// Test query to fetch users
try {
    $stmt = $pdo->query("SELECT * FROM users");
    $users = $stmt->fetchAll();
    
    echo "<h2>Users in the database:</h2>";
    echo "<pre>";
    print_r($users);
    echo "</pre>";
    
    // Test query to fetch items
    $stmt = $pdo->query("SELECT * FROM items");
    $items = $stmt->fetchAll();
    
    echo "<h2>Items in the database:</h2>";
    echo "<pre>";
    print_r($items);
    echo "</pre>";
    
    // Test query to fetch requests with requester information
    $stmt = $pdo->query("
        SELECT r.*, u.name as requester_name, u.email as requester_email
        FROM requests r
        JOIN users u ON r.requester_id = u.id
    ");
    $requests = $stmt->fetchAll();
    
    echo "<h2>Requests in the database:</h2>";
    echo "<pre>";
    print_r($requests);
    echo "</pre>";
    
} catch(PDOException $e) {
    echo "Query failed: " . $e->getMessage();
}
?>
