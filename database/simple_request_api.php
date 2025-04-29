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
    $logFile = __DIR__ . '/simple_request_api_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Simple Request API called with method: " . $_SERVER['REQUEST_METHOD']);

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

try {
    // Create a PDO instance
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    logToFile("Connected successfully to the database: $db_name@$db_host");
} catch(PDOException $e) {
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
        $pdo->beginTransaction();
        logToFile("Transaction started");
        
        // Generate a unique ID for the request
        $requestId = uniqid();
        logToFile("Generated request ID: " . $requestId);
        
        // Insert the request
        $stmt = $pdo->prepare("
            INSERT INTO requests (
                id, project_name, requester_id, reason, priority, due_date, status
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $projectName = $data['projectName'];
        $requesterId = $data['requesterId'];
        $reason = $data['reason'];
        $priority = isset($data['priority']) ? $data['priority'] : 'medium';
        $dueDate = isset($data['dueDate']) ? $data['dueDate'] : null;
        $status = 'pending';
        
        logToFile("Inserting request: ID=$requestId, Project=$projectName, Requester=$requesterId, Priority=$priority");
        
        $stmt->execute([
            $requestId, 
            $projectName, 
            $requesterId, 
            $reason, 
            $priority, 
            $dueDate, 
            $status
        ]);
        
        logToFile("Request inserted successfully");
        
        // Insert the request items
        logToFile("Request items count: " . count($data['items']));
        
        foreach ($data['items'] as $item) {
            logToFile("Processing item: " . print_r($item, true));
            
            if (!isset($item['itemId']) || !isset($item['quantity'])) {
                logToFile("Invalid item data");
                throw new Exception('Invalid item data');
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO request_items (request_id, item_id, quantity) 
                VALUES (?, ?, ?)
            ");
            
            logToFile("Inserting request item: RequestID=$requestId, ItemID={$item['itemId']}, Quantity={$item['quantity']}");
            
            $stmt->execute([
                $requestId, 
                $item['itemId'], 
                $item['quantity']
            ]);
            
            logToFile("Request item inserted successfully");
        }
        
        // Get the requester information
        $stmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ?");
        $stmt->execute([$requesterId]);
        $requester = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$requester) {
            logToFile("Requester not found: $requesterId");
            throw new Exception("Requester not found");
        }
        
        logToFile("Requester information: " . print_r($requester, true));
        
        // Commit the transaction
        $pdo->commit();
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
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
            logToFile("Transaction rolled back");
        }
        
        logToFile("Error occurred: " . $e->getMessage() . "\n" . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create request: ' . $e->getMessage()]);
    }
} else {
    // Handle other request methods
    logToFile("Unsupported request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>
