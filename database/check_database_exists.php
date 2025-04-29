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

echo "<h1>Database Check</h1>";

try {
    // Connect to MySQL without selecting a database
    $mysqli = new mysqli($db_host, $db_user, $db_pass);
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p>Connected to MySQL server successfully.</p>";
    
    // Check if the database exists
    $result = $mysqli->query("SHOW DATABASES LIKE '$db_name'");
    
    if ($result->num_rows > 0) {
        echo "<p>Database '$db_name' exists.</p>";
    } else {
        echo "<p>Database '$db_name' does not exist. Creating it...</p>";
        
        // Create the database
        if ($mysqli->query("CREATE DATABASE $db_name")) {
            echo "<p>Database created successfully.</p>";
        } else {
            throw new Exception("Error creating database: " . $mysqli->error);
        }
    }
    
    // Select the database
    if ($mysqli->select_db($db_name)) {
        echo "<p>Selected database '$db_name'.</p>";
    } else {
        throw new Exception("Error selecting database: " . $mysqli->error);
    }
    
    // Check if the tables exist
    $tables = ['users', 'items', 'requests', 'request_items', 'pickup_details'];
    $existingTables = [];
    $missingTables = [];
    
    foreach ($tables as $table) {
        $result = $mysqli->query("SHOW TABLES LIKE '$table'");
        
        if ($result->num_rows > 0) {
            $existingTables[] = $table;
        } else {
            $missingTables[] = $table;
        }
    }
    
    if (count($existingTables) > 0) {
        echo "<p>Existing tables: " . implode(', ', $existingTables) . "</p>";
    }
    
    if (count($missingTables) > 0) {
        echo "<p>Missing tables: " . implode(', ', $missingTables) . "</p>";
    }
    
    // Close the connection
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?>
