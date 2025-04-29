<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Include database configuration
require_once 'db_config.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Create a log file for debugging
function logToFile($message) {
    $logFile = __DIR__ . '/test_insert_request_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Test Insert Request script started");

// Get the first user from the database
try {
    $stmt = $pdo->query("SELECT id, name, email FROM users LIMIT 1");
    $user = $stmt->fetch();
    
    if (!$user) {
        logToFile("No users found in the database");
        echo json_encode(['success' => false, 'error' => 'No users found in the database']);
        exit;
    }
    
    logToFile("Found user: " . print_r($user, true));
    
    // Get the first two items from the database
    $stmt = $pdo->query("SELECT id, name FROM items LIMIT 2");
    $items = $stmt->fetchAll();
    
    if (count($items) < 2) {
        logToFile("Not enough items found in the database");
        echo json_encode(['success' => false, 'error' => 'Not enough items found in the database']);
        exit;
    }
    
    logToFile("Found items: " . print_r($items, true));
    
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
    
    $projectName = "Test Project " . date('Y-m-d H:i:s');
    $reason = "This is a test request created by the test_insert_request.php script";
    $priority = "medium";
    $dueDate = date('Y-m-d', strtotime('+7 days'));
    $status = "pending";
    
    logToFile("Inserting request: ID=$requestId, Project=$projectName, Requester={$user['id']}, Priority=$priority");
    
    $stmt->execute([
        $requestId, 
        $projectName, 
        $user['id'], 
        $reason, 
        $priority, 
        $dueDate, 
        $status
    ]);
    
    logToFile("Request inserted successfully");
    
    // Insert the request items
    foreach ($items as $index => $item) {
        $quantity = ($index + 1) * 2; // Just a simple quantity calculation
        
        $stmt = $pdo->prepare("
            INSERT INTO request_items (request_id, item_id, quantity) 
            VALUES (?, ?, ?)
        ");
        
        logToFile("Inserting request item: RequestID=$requestId, ItemID={$item['id']}, Quantity=$quantity");
        
        $stmt->execute([
            $requestId, 
            $item['id'], 
            $quantity
        ]);
        
        logToFile("Request item inserted successfully");
    }
    
    // Commit the transaction
    $pdo->commit();
    logToFile("Transaction committed successfully");
    
    // Verify the request was inserted
    $stmt = $pdo->prepare("
        SELECT r.*, u.name as requester_name, u.email as requester_email
        FROM requests r
        JOIN users u ON r.requester_id = u.id
        WHERE r.id = ?
    ");
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();
    
    if (!$request) {
        logToFile("Failed to verify request insertion");
        echo json_encode(['success' => false, 'error' => 'Failed to verify request insertion']);
        exit;
    }
    
    logToFile("Request verification successful: " . print_r($request, true));
    
    // Verify the request items were inserted
    $stmt = $pdo->prepare("
        SELECT ri.*, i.name as item_name
        FROM request_items ri
        JOIN items i ON ri.item_id = i.id
        WHERE ri.request_id = ?
    ");
    $stmt->execute([$requestId]);
    $requestItems = $stmt->fetchAll();
    
    if (count($requestItems) != count($items)) {
        logToFile("Failed to verify request items insertion");
        echo json_encode(['success' => false, 'error' => 'Failed to verify request items insertion']);
        exit;
    }
    
    logToFile("Request items verification successful: " . print_r($requestItems, true));
    
    // Return success response
    $response = [
        'success' => true,
        'message' => 'Test request created successfully',
        'data' => [
            'request' => $request,
            'items' => $requestItems
        ]
    ];
    
    logToFile("Test completed successfully");
    echo json_encode($response);
    
} catch (Exception $e) {
    // Rollback the transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        logToFile("Transaction rolled back");
    }
    
    logToFile("Error occurred: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    echo json_encode(['success' => false, 'error' => 'Test failed: ' . $e->getMessage()]);
}
?>
