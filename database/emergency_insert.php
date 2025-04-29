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
    $logFile = __DIR__ . '/emergency_insert_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Emergency Insert script started");

// Database configuration - hardcoded for simplicity
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

// Create a database connection
try {
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    logToFile("Connected successfully to the database: $db_name@$db_host");
} catch (Exception $e) {
    logToFile("Connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

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
        // Start a transaction
        $mysqli->begin_transaction();
        logToFile("Transaction started");
        
        // Generate a unique ID for the request
        $requestId = uniqid();
        logToFile("Generated request ID: " . $requestId);
        
        // Prepare the SQL statement for inserting a request
        $projectName = $data['projectName'];
        $requesterId = $data['requesterId'];
        $reason = $data['reason'];
        $priority = isset($data['priority']) ? $data['priority'] : 'medium';
        $dueDate = isset($data['dueDate']) ? $data['dueDate'] : null;
        $status = 'pending';
        
        // Insert the request
        $sql = "INSERT INTO requests (id, project_name, requester_id, reason, priority, due_date, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("sssssss", $requestId, $projectName, $requesterId, $reason, $priority, $dueDate, $status);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        logToFile("Request inserted successfully");
        
        // Insert the request items
        foreach ($data['items'] as $item) {
            if (!isset($item['itemId']) || !isset($item['quantity'])) {
                logToFile("Invalid item data: " . print_r($item, true));
                throw new Exception("Invalid item data");
            }
            
            $itemId = $item['itemId'];
            $quantity = $item['quantity'];
            
            $sql = "INSERT INTO request_items (request_id, item_id, quantity) VALUES (?, ?, ?)";
            
            $stmt = $mysqli->prepare($sql);
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $stmt->bind_param("ssi", $requestId, $itemId, $quantity);
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            logToFile("Request item inserted successfully: ItemID=$itemId, Quantity=$quantity");
        }
        
        // Get the requester information
        $sql = "SELECT name, email FROM users WHERE id = ?";
        
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $requesterId);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
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
            'projectName' => $projectName,
            'requester' => [
                'id' => $requesterId,
                'name' => $requester['name'],
                'email' => $requester['email']
            ],
            'items' => $data['items'],
            'reason' => $reason,
            'priority' => $priority,
            'dueDate' => $dueDate,
            'status' => $status,
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ];
        
        logToFile("Response data: " . print_r($responseData, true));
        
        // Return success response
        echo json_encode([
            'success' => true,
            'data' => $responseData,
            'message' => 'Request created successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback the transaction on error
        $mysqli->rollback();
        logToFile("Transaction rolled back");
        
        logToFile("Error occurred: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create request: ' . $e->getMessage()]);
    } finally {
        // Close the database connection
        $mysqli->close();
        logToFile("Database connection closed");
    }
} else {
    // Handle other request methods
    logToFile("Unsupported request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>
