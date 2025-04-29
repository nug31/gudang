<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database configuration - hardcoded for simplicity
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

echo "<html><head><title>Execute SQL</title>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    .success { color: green; }
    .error { color: red; }
    .card { background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
</style>";
echo "</head><body>";
echo "<h1>Execute SQL</h1>";

try {
    // Create a database connection
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p class='success'>Connected successfully to the database: $db_name@$db_host</p>";
    
    // Read the SQL file
    $sqlFile = __DIR__ . '/create_tables.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    echo "<div class='card'>";
    echo "<h2>SQL File</h2>";
    echo "<pre>" . htmlspecialchars($sql) . "</pre>";
    echo "</div>";
    
    // Split the SQL file into individual statements
    $statements = explode(';', $sql);
    
    // Execute each statement
    foreach ($statements as $statement) {
        $statement = trim($statement);
        
        if (empty($statement)) {
            continue;
        }
        
        echo "<div class='card'>";
        echo "<h2>Executing Statement</h2>";
        echo "<pre>" . htmlspecialchars($statement) . "</pre>";
        
        if ($mysqli->query($statement . ';')) {
            echo "<p class='success'>Statement executed successfully</p>";
        } else {
            echo "<p class='error'>Error executing statement: " . $mysqli->error . "</p>";
        }
        
        echo "</div>";
    }
    
    // Close the database connection
    $mysqli->close();
    
    echo "<p class='success'>SQL execution completed</p>";
    
} catch (Exception $e) {
    echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
}

echo "</body></html>";
?>
