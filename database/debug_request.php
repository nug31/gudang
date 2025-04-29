<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit();
}

// Create a log file for debugging
function logToFile($message) {
    $logFile = __DIR__ . '/debug_request_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Log request details
logToFile("Debug Request script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);
logToFile("Request headers: " . print_r(getallheaders(), true));

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    logToFile("Handling POST request");
    
    // Get the request data
    $rawData = file_get_contents('php://input');
    logToFile("Raw request data: " . $rawData);
    
    $data = json_decode($rawData, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        logToFile("JSON decode error: " . json_last_error_msg());
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON: ' . json_last_error_msg()
        ]);
        exit();
    }
    
    logToFile("Decoded request data: " . print_r($data, true));
    
    // Validate the request data
    if (!isset($data['projectName']) || !isset($data['requesterId']) || !isset($data['items']) || !isset($data['reason'])) {
        logToFile("Missing required fields");
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields'
        ]);
        exit();
    }
    
    // Generate a unique ID for the request
    $requestId = uniqid();
    logToFile("Generated request ID: " . $requestId);
    
    // Get the requester information
    $requesterId = $data['requesterId'];
    
    // Connect to the database
    $db_host = 'localhost';
    $db_name = 'itemtrack';
    $db_user = 'itemtrack';
    $db_pass = 'Reddevils94_';
    
    try {
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        if ($mysqli->connect_error) {
            throw new Exception("Connection failed: " . $mysqli->connect_error);
        }
        
        logToFile("Connected to database successfully");
        
        // Check if the requester exists
        $stmt = $mysqli->prepare("SELECT id, name, email FROM users WHERE id = ?");
        
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
            logToFile("Requester not found: " . $requesterId);
            
            // Get all users for debugging
            $result = $mysqli->query("SELECT id, name, email FROM users LIMIT 10");
            $users = [];
            
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            
            logToFile("Available users: " . print_r($users, true));
            
            throw new Exception("Requester not found: " . $requesterId . ". Please make sure the requester exists in the users table.");
        }
        
        logToFile("Requester found: " . print_r($requester, true));
        
        // Check if the items exist
        foreach ($data['items'] as $item) {
            if (!isset($item['itemId']) || !isset($item['quantity'])) {
                logToFile("Invalid item data: " . print_r($item, true));
                throw new Exception("Invalid item data");
            }
            
            $itemId = $item['itemId'];
            
            $stmt = $mysqli->prepare("SELECT id, name FROM items WHERE id = ?");
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $stmt->bind_param("s", $itemId);
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $result = $stmt->get_result();
            $itemData = $result->fetch_assoc();
            
            if (!$itemData) {
                logToFile("Item not found: " . $itemId);
                
                // Get all items for debugging
                $result = $mysqli->query("SELECT id, name FROM items LIMIT 10");
                $items = [];
                
                while ($row = $result->fetch_assoc()) {
                    $items[] = $row;
                }
                
                logToFile("Available items: " . print_r($items, true));
                
                throw new Exception("Item not found: " . $itemId . ". Please make sure the item exists in the items table.");
            }
            
            logToFile("Item found: " . print_r($itemData, true));
        }
        
        // Close the database connection
        $mysqli->close();
        
    } catch (Exception $e) {
        logToFile("Error: " . $e->getMessage());
        
        // Close the database connection if it exists
        if (isset($mysqli)) {
            $mysqli->close();
        }
        
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
        exit();
    }
    
    // Return a success response with the request data
    $responseData = [
        'id' => $requestId,
        'projectName' => $data['projectName'],
        'requester' => [
            'id' => $requester['id'],
            'name' => $requester['name'],
            'email' => $requester['email']
        ],
        'items' => $data['items'],
        'reason' => $data['reason'],
        'priority' => isset($data['priority']) ? $data['priority'] : 'medium',
        'dueDate' => isset($data['dueDate']) ? $data['dueDate'] : null,
        'status' => 'pending',
        'createdAt' => date('Y-m-d H:i:s'),
        'updatedAt' => date('Y-m-d H:i:s')
    ];
    
    logToFile("Response data: " . print_r($responseData, true));
    
    echo json_encode([
        'success' => true,
        'data' => $responseData,
        'message' => 'Request data received successfully'
    ]);
} else {
    // Handle GET request (for testing)
    echo json_encode([
        'success' => true,
        'message' => 'Debug Request API is working. Use POST to test request data.'
    ]);
}
?>
