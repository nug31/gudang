<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set content type to HTML
header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>VPS Environment Check</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1, h2 { color: #333; }
        .card { background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin-bottom: 20px; border: 1px solid #ddd; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>VPS Environment Check</h1>";

// Function to check if a PHP extension is loaded
function checkExtension($extension) {
    if (extension_loaded($extension)) {
        return "<span class='success'>Installed</span>";
    } else {
        return "<span class='error'>Not installed</span>";
    }
}

// Check PHP version
echo "<div class='card'>
    <h2>PHP Information</h2>
    <p>PHP Version: <strong>" . phpversion() . "</strong></p>";

// Check if PHP version is adequate
if (version_compare(phpversion(), '7.4.0', '>=')) {
    echo "<p class='success'>PHP version is adequate (7.4 or higher)</p>";
} else {
    echo "<p class='error'>PHP version is too low. Minimum required: 7.4</p>";
}

// Check required extensions
echo "<h3>Required PHP Extensions</h3>
<table>
    <tr>
        <th>Extension</th>
        <th>Status</th>
    </tr>
    <tr>
        <td>PDO</td>
        <td>" . checkExtension('pdo') . "</td>
    </tr>
    <tr>
        <td>PDO MySQL</td>
        <td>" . checkExtension('pdo_mysql') . "</td>
    </tr>
    <tr>
        <td>MySQLi</td>
        <td>" . checkExtension('mysqli') . "</td>
    </tr>
    <tr>
        <td>JSON</td>
        <td>" . checkExtension('json') . "</td>
    </tr>
</table>
</div>";

// Check database connection
echo "<div class='card'>
    <h2>Database Connection</h2>";

// Try to include the database config file
if (file_exists('hostinger_db_config.php')) {
    echo "<p>Database configuration file found: <span class='success'>hostinger_db_config.php</span></p>";
    
    // Try to connect to the database
    try {
        require_once 'hostinger_db_config.php';
        echo "<p class='success'>Successfully connected to the database!</p>";
        
        // Check if tables exist
        $tables = ['users', 'items', 'requests', 'request_items'];
        $tableStatus = [];
        
        echo "<h3>Database Tables</h3>
        <table>
            <tr>
                <th>Table</th>
                <th>Status</th>
            </tr>";
        
        foreach ($tables as $table) {
            $result = $mysqli->query("SHOW TABLES LIKE '$table'");
            $exists = $result->num_rows > 0;
            
            echo "<tr>
                <td>$table</td>
                <td>" . ($exists ? "<span class='success'>Exists</span>" : "<span class='error'>Missing</span>") . "</td>
            </tr>";
        }
        
        echo "</table>";
        
    } catch (Exception $e) {
        echo "<p class='error'>Database connection error: " . $e->getMessage() . "</p>";
        echo "<p>Please check your database configuration in hostinger_db_config.php</p>";
    }
} else {
    echo "<p class='error'>Database configuration file not found: hostinger_db_config.php</p>";
    echo "<p>Please make sure to upload the hostinger_db_config.php file and update it with your database credentials.</p>";
}

echo "</div>";

// Check file permissions
echo "<div class='card'>
    <h2>File Permissions</h2>";

$directories = ['.', 'uploads'];
echo "<table>
    <tr>
        <th>Directory</th>
        <th>Readable</th>
        <th>Writable</th>
    </tr>";

foreach ($directories as $dir) {
    $readable = is_readable($dir) ? "<span class='success'>Yes</span>" : "<span class='error'>No</span>";
    $writable = is_writable($dir) ? "<span class='success'>Yes</span>" : "<span class='error'>No</span>";
    
    echo "<tr>
        <td>$dir</td>
        <td>$readable</td>
        <td>$writable</td>
    </tr>";
}

echo "</table>";

// Check if uploads directory exists
if (!is_dir('uploads')) {
    echo "<p class='warning'>The 'uploads' directory does not exist. You may need to create it manually.</p>";
}

echo "</div>";

// Check server information
echo "<div class='card'>
    <h2>Server Information</h2>
    <table>
        <tr>
            <td>Server Software</td>
            <td>" . $_SERVER['SERVER_SOFTWARE'] . "</td>
        </tr>
        <tr>
            <td>Server Name</td>
            <td>" . $_SERVER['SERVER_NAME'] . "</td>
        </tr>
        <tr>
            <td>Document Root</td>
            <td>" . $_SERVER['DOCUMENT_ROOT'] . "</td>
        </tr>
        <tr>
            <td>Server Protocol</td>
            <td>" . $_SERVER['SERVER_PROTOCOL'] . "</td>
        </tr>
    </table>
</div>";

// Check for HTTPS
echo "<div class='card'>
    <h2>HTTPS Status</h2>";

if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    echo "<p class='success'>HTTPS is enabled</p>";
} else {
    echo "<p class='warning'>HTTPS is not enabled. Consider setting up an SSL certificate for your domain.</p>";
}

echo "</div>";

// Provide next steps
echo "<div class='card'>
    <h2>Next Steps</h2>
    <p>Based on the checks above, here are the recommended next steps:</p>
    <ol>";

if (!file_exists('hostinger_db_config.php')) {
    echo "<li>Upload and configure the hostinger_db_config.php file with your database credentials</li>";
}

if (!is_dir('uploads') || !is_writable('uploads')) {
    echo "<li>Create an 'uploads' directory and make sure it's writable</li>";
}

if (!(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')) {
    echo "<li>Set up an SSL certificate for your domain</li>";
}

echo "<li>Run the database setup script: <a href='simple_setup.php'>simple_setup.php</a></li>
    <li>Test the database connection: <a href='simple_test.php'>simple_test.php</a></li>
    <li>Access your application: <a href='../'>Go to Application</a></li>
    </ol>
</div>";

echo "</body>
</html>";
?>
