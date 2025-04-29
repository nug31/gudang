<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Create a log file for debugging
function logToFile($message) {
    $logFile = __DIR__ . '/check_request_api_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Check Request API script started");

// Check if request_api.php exists
$requestApiPath = __DIR__ . '/../request_api.php';
$exists = file_exists($requestApiPath);

logToFile("request_api.php exists: " . ($exists ? 'Yes' : 'No'));
logToFile("Full path: " . $requestApiPath);

if ($exists) {
    // Get the file contents
    $contents = file_get_contents($requestApiPath);
    logToFile("File size: " . strlen($contents) . " bytes");
    
    // Check if the file is accessible via HTTP
    $url = 'http://localhost/request_api.php';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    logToFile("HTTP request to $url returned status code: $httpCode");
    
    if ($response === false) {
        logToFile("cURL error: " . curl_error($ch));
    } else {
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header = substr($response, 0, $headerSize);
        $body = substr($response, $headerSize);
        
        logToFile("Response headers: " . $header);
        logToFile("Response body: " . $body);
    }
    
    curl_close($ch);
}

// Check database connection
try {
    require_once 'db_config.php';
    logToFile("Database connection successful");
    
    // Check if the requests table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'requests'");
    $requestsTableExists = $stmt->rowCount() > 0;
    
    logToFile("Requests table exists: " . ($requestsTableExists ? 'Yes' : 'No'));
    
    if ($requestsTableExists) {
        // Check the structure of the requests table
        $stmt = $pdo->query("DESCRIBE requests");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        logToFile("Requests table columns: " . implode(', ', $columns));
        
        // Check if there are any requests in the table
        $stmt = $pdo->query("SELECT COUNT(*) FROM requests");
        $requestCount = $stmt->fetchColumn();
        
        logToFile("Number of requests in the table: " . $requestCount);
        
        if ($requestCount > 0) {
            // Get the latest request
            $stmt = $pdo->query("
                SELECT r.*, u.name as requester_name, u.email as requester_email
                FROM requests r
                JOIN users u ON r.requester_id = u.id
                ORDER BY r.created_at DESC
                LIMIT 1
            ");
            $latestRequest = $stmt->fetch();
            
            logToFile("Latest request: " . print_r($latestRequest, true));
            
            // Get the request items
            $stmt = $pdo->prepare("
                SELECT ri.*, i.name as item_name
                FROM request_items ri
                JOIN items i ON ri.item_id = i.id
                WHERE ri.request_id = ?
            ");
            $stmt->execute([$latestRequest['id']]);
            $requestItems = $stmt->fetchAll();
            
            logToFile("Request items: " . print_r($requestItems, true));
        }
    }
    
    // Check if the request_items table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'request_items'");
    $requestItemsTableExists = $stmt->rowCount() > 0;
    
    logToFile("Request items table exists: " . ($requestItemsTableExists ? 'Yes' : 'No'));
    
    if ($requestItemsTableExists) {
        // Check the structure of the request_items table
        $stmt = $pdo->query("DESCRIBE request_items");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        logToFile("Request items table columns: " . implode(', ', $columns));
        
        // Check if there are any request items in the table
        $stmt = $pdo->query("SELECT COUNT(*) FROM request_items");
        $requestItemCount = $stmt->fetchColumn();
        
        logToFile("Number of request items in the table: " . $requestItemCount);
    }
    
} catch (PDOException $e) {
    logToFile("Database connection error: " . $e->getMessage());
}

// Return the results
$results = [
    'success' => true,
    'requestApiExists' => $exists,
    'requestApiPath' => $requestApiPath,
    'databaseConnection' => isset($pdo),
    'requestsTableExists' => $requestsTableExists ?? false,
    'requestItemsTableExists' => $requestItemsTableExists ?? false,
    'requestCount' => $requestCount ?? 0,
    'requestItemCount' => $requestItemCount ?? 0,
    'latestRequest' => $latestRequest ?? null,
    'requestItems' => $requestItems ?? []
];

logToFile("Check completed. Results: " . print_r($results, true));
echo json_encode($results);
?>
