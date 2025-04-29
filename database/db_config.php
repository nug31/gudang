<?php
// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';  // Default Laragon MySQL username
$db_pass = '';      // Default Laragon MySQL password (empty)

// Function to log database connection status
function logDbConnection($message) {
    $logFile = __DIR__ . '/db_connection_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Create connection
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Set default fetch mode to associative array
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // Disable emulation of prepared statements
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    // Log successful connection
    logDbConnection("Connected successfully to the database: $db_name@$db_host");
} catch(PDOException $e) {
    // Log connection error
    logDbConnection("Connection failed: " . $e->getMessage());

    // Throw the exception to be handled by the calling script
    throw new PDOException($e->getMessage(), (int)$e->getCode());
}
?>
