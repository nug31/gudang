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

echo "<html><head><title>List Users</title>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .success { color: green; }
    .error { color: red; }
    .card { background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
    .copy-button { background-color: #4CAF50; color: white; border: none; padding: 5px 10px; text-align: center; text-decoration: none; display: inline-block; font-size: 12px; margin: 2px 2px; cursor: pointer; border-radius: 3px; }
</style>";
echo "<script>
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            alert('Copied to clipboard: ' + text);
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }
</script>";
echo "</head><body>";
echo "<h1>List Users</h1>";

try {
    // Connect to the database
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p class='success'>Connected to database successfully.</p>";
    
    // Check if the users table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows == 0) {
        throw new Exception("Users table does not exist.");
    }
    
    // Get all users
    $result = $mysqli->query("SELECT id, name, email, role, department FROM users");
    
    if (!$result) {
        throw new Exception("Error getting users: " . $mysqli->error);
    }
    
    echo "<div class='card'>";
    echo "<h2>Users</h2>";
    
    if ($result->num_rows == 0) {
        echo "<p>No users found.</p>";
    } else {
        echo "<table>";
        echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Action</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['name'] . "</td>";
            echo "<td>" . $row['email'] . "</td>";
            echo "<td>" . $row['role'] . "</td>";
            echo "<td>" . $row['department'] . "</td>";
            echo "<td><button class='copy-button' onclick=\"copyToClipboard('" . $row['id'] . "')\">Copy ID</button></td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
    echo "</div>";
    
    // Check if the items table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'items'");
    if ($result->num_rows == 0) {
        throw new Exception("Items table does not exist.");
    }
    
    // Get all items
    $result = $mysqli->query("SELECT id, name, category, quantity FROM items");
    
    if (!$result) {
        throw new Exception("Error getting items: " . $mysqli->error);
    }
    
    echo "<div class='card'>";
    echo "<h2>Items</h2>";
    
    if ($result->num_rows == 0) {
        echo "<p>No items found.</p>";
    } else {
        echo "<table>";
        echo "<tr><th>ID</th><th>Name</th><th>Category</th><th>Quantity</th><th>Action</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['name'] . "</td>";
            echo "<td>" . $row['category'] . "</td>";
            echo "<td>" . $row['quantity'] . "</td>";
            echo "<td><button class='copy-button' onclick=\"copyToClipboard('" . $row['id'] . "')\">Copy ID</button></td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
    echo "</div>";
    
    // Close the database connection
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
    
    // Close the database connection if it exists
    if (isset($mysqli)) {
        $mysqli->close();
    }
}

echo "</body></html>";
?>
