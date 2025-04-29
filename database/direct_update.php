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
    $logFile = __DIR__ . '/direct_update_log.txt';
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

logToFile("Direct Update script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);
logToFile("Request URI: " . $_SERVER['REQUEST_URI']);

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

// Handle PUT request (update a request)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    logToFile("Handling PUT request");
    
    // Get the request ID from the query string
    $requestId = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$requestId) {
        logToFile("Missing request ID");
        returnJson(['success' => false, 'error' => 'Missing request ID']);
    }
    
    logToFile("Request ID: " . $requestId);
    
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
        if (!isset($data['status'])) {
            logToFile("Missing required field: status");
            returnJson(['success' => false, 'error' => 'Missing required field: status']);
        }
        
        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        if ($mysqli->connect_error) {
            logToFile("Database connection error: " . $mysqli->connect_error);
            returnJson(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]);
        }
        
        logToFile("Connected to database successfully");
        
        // Start a transaction
        $mysqli->begin_transaction();
        logToFile("Transaction started");
        
        // Check if the request exists
        $sql = "SELECT * FROM requests WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $requestId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $request = $result->fetch_assoc();
        
        if (!$request) {
            logToFile("Request not found: " . $requestId);
            throw new Exception("Request not found: " . $requestId);
        }
        
        logToFile("Request found: " . print_r($request, true));
        
        // Update the request status
        $status = $mysqli->real_escape_string($data['status']);
        
        $sql = "UPDATE requests SET status = ? WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("ss", $status, $requestId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        logToFile("Request status updated successfully");
        
        // Handle pickup details if provided
        if (isset($data['pickupDetails'])) {
            $pickupDetails = $data['pickupDetails'];
            
            // Check if pickup details already exist
            $sql = "SELECT * FROM pickup_details WHERE request_id = ?";
            $stmt = $mysqli->prepare($sql);
            
            if (!$stmt) {
                logToFile("Prepare failed: " . $mysqli->error);
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $stmt->bind_param("s", $requestId);
            
            if (!$stmt->execute()) {
                logToFile("Execute failed: " . $stmt->error);
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $result = $stmt->get_result();
            $existingPickupDetails = $result->fetch_assoc();
            
            if ($existingPickupDetails) {
                // Update existing pickup details
                $location = $mysqli->real_escape_string($pickupDetails['location']);
                $pickupTime = isset($pickupDetails['time']) ? $mysqli->real_escape_string($pickupDetails['time']) : null;
                $delivered = isset($pickupDetails['delivered']) ? ($pickupDetails['delivered'] ? 1 : 0) : 0;
                
                $sql = "UPDATE pickup_details SET location = ?, pickup_time = ?, delivered = ? WHERE request_id = ?";
                $stmt = $mysqli->prepare($sql);
                
                if (!$stmt) {
                    logToFile("Prepare failed: " . $mysqli->error);
                    throw new Exception("Prepare failed: " . $mysqli->error);
                }
                
                $stmt->bind_param("ssis", $location, $pickupTime, $delivered, $requestId);
                
                if (!$stmt->execute()) {
                    logToFile("Execute failed: " . $stmt->error);
                    throw new Exception("Execute failed: " . $stmt->error);
                }
                
                logToFile("Pickup details updated successfully");
            } else {
                // Insert new pickup details
                $location = $mysqli->real_escape_string($pickupDetails['location']);
                $pickupTime = isset($pickupDetails['time']) ? $mysqli->real_escape_string($pickupDetails['time']) : null;
                $delivered = isset($pickupDetails['delivered']) ? ($pickupDetails['delivered'] ? 1 : 0) : 0;
                
                $sql = "INSERT INTO pickup_details (request_id, location, pickup_time, delivered) VALUES (?, ?, ?, ?)";
                $stmt = $mysqli->prepare($sql);
                
                if (!$stmt) {
                    logToFile("Prepare failed: " . $mysqli->error);
                    throw new Exception("Prepare failed: " . $mysqli->error);
                }
                
                $stmt->bind_param("sssi", $requestId, $location, $pickupTime, $delivered);
                
                if (!$stmt->execute()) {
                    logToFile("Execute failed: " . $stmt->error);
                    throw new Exception("Execute failed: " . $stmt->error);
                }
                
                logToFile("Pickup details inserted successfully");
            }
        }
        
        // Get the updated request with all related data
        $sql = "
            SELECT r.*, u.name as requester_name, u.email as requester_email
            FROM requests r
            JOIN users u ON r.requester_id = u.id
            WHERE r.id = ?
        ";
        
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $requestId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $updatedRequest = $result->fetch_assoc();
        
        if (!$updatedRequest) {
            logToFile("Updated request not found: " . $requestId);
            throw new Exception("Updated request not found: " . $requestId);
        }
        
        // Get the request items
        $sql = "
            SELECT ri.*, i.name as item_name
            FROM request_items ri
            JOIN items i ON ri.item_id = i.id
            WHERE ri.request_id = ?
        ";
        
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $requestId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $requestItems = [];
        
        while ($item = $result->fetch_assoc()) {
            $requestItems[] = [
                'itemId' => $item['item_id'],
                'itemName' => $item['item_name'],
                'quantity' => (int)$item['quantity']
            ];
        }
        
        // Get the pickup details if they exist
        $pickupDetailsData = null;
        
        $sql = "SELECT * FROM pickup_details WHERE request_id = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $requestId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $pickupDetails = $result->fetch_assoc();
        
        if ($pickupDetails) {
            $pickupDetailsData = [
                'location' => $pickupDetails['location'],
                'pickupTime' => $pickupDetails['pickup_time'],
                'delivered' => (bool)$pickupDetails['delivered']
            ];
        }
        
        // Commit the transaction
        $mysqli->commit();
        logToFile("Transaction committed successfully");
        
        // Format the response data
        $responseData = [
            'id' => $updatedRequest['id'],
            'projectName' => $updatedRequest['project_name'],
            'requester' => [
                'id' => $updatedRequest['requester_id'],
                'name' => $updatedRequest['requester_name'],
                'email' => $updatedRequest['requester_email']
            ],
            'items' => $requestItems,
            'reason' => $updatedRequest['reason'],
            'priority' => $updatedRequest['priority'],
            'dueDate' => $updatedRequest['due_date'],
            'status' => $updatedRequest['status'],
            'createdAt' => $updatedRequest['created_at'],
            'updatedAt' => $updatedRequest['updated_at']
        ];
        
        if ($pickupDetailsData) {
            $responseData['pickupDetails'] = $pickupDetailsData;
        }
        
        logToFile("Response data: " . print_r($responseData, true));
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        returnJson([
            'success' => true,
            'data' => $responseData,
            'message' => 'Request updated successfully'
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
        'message' => 'Direct Update API is working. Use PUT to update a request.'
    ]);
} else {
    // Handle other request methods
    returnJson([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
