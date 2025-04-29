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
    $logFile = __DIR__ . '/simple_request_handler_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Simple Request Handler script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);
logToFile("Request headers: " . print_r(getallheaders(), true));

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
        
        // Check if the requester exists
        $requesterId = $data['requesterId'];
        logToFile("Checking if requester exists: " . $requesterId);
        
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
            
            // Create a new user if the requester doesn't exist
            $stmt = $mysqli->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $name = "User " . substr($requesterId, 0, 8);
            $email = "user" . substr($requesterId, 0, 8) . "@example.com";
            $password = password_hash("password", PASSWORD_DEFAULT);
            $role = "requester";
            
            $stmt->bind_param("sssss", $requesterId, $name, $email, $password, $role);
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            logToFile("New user created successfully");
            
            $requester = [
                'id' => $requesterId,
                'name' => $name,
                'email' => $email
            ];
        }
        
        logToFile("Requester: " . print_r($requester, true));
        
        // Insert the request
        $stmt = $mysqli->prepare("INSERT INTO requests (id, project_name, requester_id, reason, priority, status) VALUES (?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $projectName = $data['projectName'];
        $reason = $data['reason'];
        $priority = isset($data['priority']) ? $data['priority'] : 'medium';
        $status = 'pending';
        
        $stmt->bind_param("ssssss", $requestId, $projectName, $requesterId, $reason, $priority, $status);
        
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
            $quantity = (int)$item['quantity'];
            
            // Check if the item exists
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
            
            // Insert the request item
            $stmt = $mysqli->prepare("INSERT INTO request_items (request_id, item_id, quantity) VALUES (?, ?, ?)");
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $stmt->bind_param("ssi", $requestId, $itemId, $quantity);
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            logToFile("Request item inserted successfully");
        }
        
        // Commit the transaction
        $mysqli->commit();
        logToFile("Transaction committed successfully");
        
        // Format the response data
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
            'priority' => $priority,
            'dueDate' => isset($data['dueDate']) ? $data['dueDate'] : null,
            'status' => $status,
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ];
        
        logToFile("Response data: " . print_r($responseData, true));
        
        // Close the database connection
        $mysqli->close();
        
        // Return a success response
        echo json_encode([
            'success' => true,
            'data' => $responseData,
            'message' => 'Request created successfully'
        ]);
    } catch (Exception $e) {
        logToFile("Error: " . $e->getMessage());
        
        // Rollback the transaction if it's active
        if (isset($mysqli) && $mysqli->ping()) {
            $mysqli->rollback();
            logToFile("Transaction rolled back");
        }
        
        // Close the database connection if it exists
        if (isset($mysqli)) {
            $mysqli->close();
        }
        
        // Return an error response
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Handle GET request (for testing)
    echo json_encode([
        'success' => true,
        'message' => 'Simple Request Handler API is working. Use POST to create a request.'
    ]);
} else {
    // Handle other request methods
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
