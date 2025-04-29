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

// Disable error display in the response
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Create a log file for debugging
function logToFile($message) {
    $logFile = __DIR__ . '/react_insert_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Function to safely return JSON
function returnJson($data) {
    // Make sure no output has been sent before
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    echo json_encode($data);
    exit();
}

logToFile("React Insert script started");
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
    
    try {
        // Get the request data
        $rawData = file_get_contents('php://input');
        logToFile("Raw request data: " . $rawData);
        
        $data = json_decode($rawData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            logToFile("JSON decode error: " . json_last_error_msg());
            returnJson(['success' => false, 'error' => 'Invalid JSON: ' . json_last_error_msg()]);
        }
        
        logToFile("Decoded request data: " . print_r($data, true));
        
        // Validate the request data
        if (!isset($data['projectName']) || !isset($data['requesterId']) || !isset($data['items']) || !isset($data['reason'])) {
            logToFile("Missing required fields");
            returnJson(['success' => false, 'error' => 'Missing required fields']);
        }
        
        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        if ($mysqli->connect_error) {
            logToFile("Database connection error: " . $mysqli->connect_error);
            returnJson(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]);
        }
        
        logToFile("Connected to database successfully");
        
        // Check if the requester exists
        $requesterId = $data['requesterId'];
        logToFile("Checking if requester exists: " . $requesterId);
        
        $stmt = $mysqli->prepare("SELECT id, name, email FROM users WHERE id = ?");
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $requesterId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
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
            
            // Create a new user if the requester doesn't exist
            logToFile("Creating new user with ID: " . $requesterId);
            
            $stmt = $mysqli->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
            
            if (!$stmt) {
                logToFile("Prepare failed: " . $mysqli->error);
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $name = "User " . substr($requesterId, 0, 8);
            $email = "user" . substr($requesterId, 0, 8) . "@example.com";
            $password = password_hash("password", PASSWORD_DEFAULT);
            $role = "requester";
            
            $stmt->bind_param("sssss", $requesterId, $name, $email, $password, $role);
            
            if (!$stmt->execute()) {
                logToFile("Execute failed: " . $stmt->error);
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
        
        // Start a transaction
        $mysqli->begin_transaction();
        logToFile("Transaction started");
        
        // Generate a unique ID for the request
        $requestId = uniqid();
        logToFile("Generated request ID: " . $requestId);
        
        // Prepare the request data
        $projectName = $mysqli->real_escape_string($data['projectName']);
        $reason = $mysqli->real_escape_string($data['reason']);
        $priority = isset($data['priority']) ? $mysqli->real_escape_string($data['priority']) : 'medium';
        $dueDate = isset($data['dueDate']) && !empty($data['dueDate']) ? $mysqli->real_escape_string($data['dueDate']) : null;
        $status = 'pending';
        
        // Insert the request
        $sql = "INSERT INTO requests (id, project_name, requester_id, reason, priority, due_date, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("sssssss", $requestId, $projectName, $requesterId, $reason, $priority, $dueDate, $status);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
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
            
            // Check if the item exists
            $stmt = $mysqli->prepare("SELECT id, name FROM items WHERE id = ?");
            
            if (!$stmt) {
                logToFile("Prepare failed: " . $mysqli->error);
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $stmt->bind_param("s", $itemId);
            
            if (!$stmt->execute()) {
                logToFile("Execute failed: " . $stmt->error);
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
                
                // Create a new item if it doesn't exist
                logToFile("Creating new item with ID: " . $itemId);
                
                $stmt = $mysqli->prepare("INSERT INTO items (id, name, category, quantity) VALUES (?, ?, ?, ?)");
                
                if (!$stmt) {
                    logToFile("Prepare failed: " . $mysqli->error);
                    throw new Exception("Prepare failed: " . $mysqli->error);
                }
                
                $name = isset($item['itemName']) ? $item['itemName'] : "Item " . substr($itemId, 0, 8);
                $category = "Other";
                $itemQuantity = 100;
                
                $stmt->bind_param("sssi", $itemId, $name, $category, $itemQuantity);
                
                if (!$stmt->execute()) {
                    logToFile("Execute failed: " . $stmt->error);
                    throw new Exception("Execute failed: " . $stmt->error);
                }
                
                logToFile("New item created successfully");
            }
            
            // Insert the request item
            $stmt = $mysqli->prepare("INSERT INTO request_items (request_id, item_id, quantity) VALUES (?, ?, ?)");
            
            if (!$stmt) {
                logToFile("Prepare failed: " . $mysqli->error);
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $stmt->bind_param("ssi", $requestId, $itemId, $quantity);
            
            if (!$stmt->execute()) {
                logToFile("Execute failed: " . $stmt->error);
                throw new Exception("Error inserting request item: " . $stmt->error);
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
            'dueDate' => $dueDate,
            'status' => $status,
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ];
        
        logToFile("Response data: " . print_r($responseData, true));
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        returnJson([
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
        returnJson([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Handle GET request (for testing)
    returnJson([
        'success' => true,
        'message' => 'React Insert API is working. Use POST to insert a request.'
    ]);
} else {
    // Handle other request methods
    returnJson([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
