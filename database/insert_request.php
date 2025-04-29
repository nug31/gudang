<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Create a log file for debugging
function logToFile($message) {
    $logFile = __DIR__ . '/insert_request_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Insert Request script started");

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

// Handle POST request (create a new request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    logToFile("Handling POST request");
    
    // Get the request data
    $rawData = file_get_contents('php://input');
    logToFile("Raw request data: " . $rawData);
    
    $data = json_decode($rawData, true);
    logToFile("Decoded request data: " . print_r($data, true));
    
    // Validate the request data
    if (!isset($data['projectName']) || !isset($data['requesterId']) || !isset($data['items']) || !isset($data['reason'])) {
        logToFile("Missing required fields");
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit();
    }
    
    try {
        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        if ($mysqli->connect_error) {
            throw new Exception("Connection failed: " . $mysqli->connect_error);
        }
        
        logToFile("Connected to database successfully");
        
        // Start a transaction
        $mysqli->begin_transaction();
        logToFile("Transaction started");
        
        // Generate a unique ID for the request
        $requestId = uniqid();
        logToFile("Generated request ID: " . $requestId);
        
        // Prepare the request data
        $projectName = $mysqli->real_escape_string($data['projectName']);
        $requesterId = $mysqli->real_escape_string($data['requesterId']);
        $reason = $mysqli->real_escape_string($data['reason']);
        $priority = isset($data['priority']) ? $mysqli->real_escape_string($data['priority']) : 'medium';
        $dueDate = isset($data['dueDate']) ? $mysqli->real_escape_string($data['dueDate']) : null;
        $status = 'pending';
        
        // Insert the request
        $sql = "INSERT INTO requests (id, project_name, requester_id, reason, priority, due_date, status) 
                VALUES ('$requestId', '$projectName', '$requesterId', '$reason', '$priority', " . 
                ($dueDate ? "'$dueDate'" : "NULL") . ", '$status')";
        
        logToFile("SQL query: " . $sql);
        
        if (!$mysqli->query($sql)) {
            throw new Exception("Error inserting request: " . $mysqli->error);
        }
        
        logToFile("Request inserted successfully");
        
        // Insert the request items
        foreach ($data['items'] as $item) {
            if (!isset($item['itemId']) || !isset($item['quantity'])) {
                logToFile("Invalid item data: " . print_r($item, true));
                throw new Exception("Invalid item data");
            }
            
            $itemId = $mysqli->real_escape_string($item['itemId']);
            $quantity = (int)$item['quantity'];
            
            $sql = "INSERT INTO request_items (request_id, item_id, quantity) 
                    VALUES ('$requestId', '$itemId', $quantity)";
            
            logToFile("SQL query: " . $sql);
            
            if (!$mysqli->query($sql)) {
                throw new Exception("Error inserting request item: " . $mysqli->error);
            }
            
            logToFile("Request item inserted successfully");
        }
        
        // Get the requester information
        $sql = "SELECT name, email FROM users WHERE id = '$requesterId'";
        
        logToFile("SQL query: " . $sql);
        
        $result = $mysqli->query($sql);
        
        if (!$result) {
            throw new Exception("Error getting requester information: " . $mysqli->error);
        }
        
        $requester = $result->fetch_assoc();
        
        if (!$requester) {
            logToFile("Requester not found: $requesterId");
            throw new Exception("Requester not found");
        }
        
        logToFile("Requester information: " . print_r($requester, true));
        
        // Commit the transaction
        $mysqli->commit();
        logToFile("Transaction committed successfully");
        
        // Format the response data
        $responseData = [
            'id' => $requestId,
            'projectName' => $data['projectName'],
            'requester' => [
                'id' => $requesterId,
                'name' => $requester['name'],
                'email' => $requester['email']
            ],
            'items' => $data['items'],
            'reason' => $data['reason'],
            'priority' => $priority,
            'dueDate' => $dueDate,
            'status' => $status,
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ];
        
        logToFile("Response data: " . print_r($responseData, true));
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        echo json_encode([
            'success' => true,
            'data' => $responseData,
            'message' => 'Request created successfully'
        ]);
        
    } catch (Exception $e) {
        logToFile("Error: " . $e->getMessage());
        
        // Rollback the transaction if it's active
        if (isset($mysqli) && $mysqli->ping()) {
            if ($mysqli->begin_transaction) {
                $mysqli->rollback();
                logToFile("Transaction rolled back");
            }
            
            // Close the database connection
            $mysqli->close();
        }
        
        // Return error response
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    // Handle GET request (for testing)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo json_encode([
            'success' => true,
            'message' => 'Insert Request API is working. Use POST to insert a request.'
        ]);
    } else {
        // Handle other request methods
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
    }
}
?>
