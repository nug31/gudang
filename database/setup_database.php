<?php
// Database configuration
$db_host = 'localhost';
$db_user = 'root';  // Default Laragon MySQL username
$db_pass = '';      // Default Laragon MySQL password (empty)

try {
    // Connect to MySQL server without selecting a database
    $pdo = new PDO("mysql:host=$db_host", $db_user, $db_pass);
    
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>Connected to MySQL server successfully!</h2>";
    
    // Create the database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS itemtrack");
    echo "<p>Database 'itemtrack' created or already exists.</p>";
    
    // Select the database
    $pdo->exec("USE itemtrack");
    echo "<p>Using database 'itemtrack'.</p>";
    
    // Read the SQL file
    $sql_file = file_get_contents('itemtrack_db.sql');
    
    // Remove the first two lines (CREATE DATABASE and USE statements)
    $sql_file = preg_replace('/^.*?USE itemtrack;/s', '', $sql_file);
    
    // Split the SQL file into individual statements
    $statements = explode(';', $sql_file);
    
    // Execute each statement
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }
    
    echo "<h2>Database setup completed successfully!</h2>";
    
    // Check if tables were created
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h3>Tables created:</h3>";
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>$table</li>";
    }
    echo "</ul>";
    
    // Check if sample data was inserted
    $users_count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $items_count = $pdo->query("SELECT COUNT(*) FROM items")->fetchColumn();
    $requests_count = $pdo->query("SELECT COUNT(*) FROM requests")->fetchColumn();
    
    echo "<h3>Sample data inserted:</h3>";
    echo "<ul>";
    echo "<li>Users: $users_count</li>";
    echo "<li>Items: $items_count</li>";
    echo "<li>Requests: $requests_count</li>";
    echo "</ul>";
    
    echo "<p>You can now <a href='index.html'>test the API</a> or <a href='test_connection.php'>test the database connection</a>.</p>";
    
} catch(PDOException $e) {
    echo "<h2>Error:</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
