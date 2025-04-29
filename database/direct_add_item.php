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

// Include database configuration
require_once 'db_config.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Create a log file for debugging
function logToFile($message) {
    $logFile = __DIR__ . '/direct_add_item_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Direct Add Item API called with method: " . $_SERVER['REQUEST_METHOD']);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Process based on request method
switch ($method) {
    case 'GET':
        handleGetRequest($pdo);
        break;
    case 'POST':
        handlePostRequest($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

// Handle GET requests
function handleGetRequest($pdo) {
    logToFile("Handling GET request");
    
    try {
        // Get all items
        $stmt = $pdo->query("SELECT * FROM items ORDER BY name");
        $items = $stmt->fetchAll();
        
        logToFile("Retrieved " . count($items) . " items");
        
        echo json_encode(['success' => true, 'data' => $items]);
    } catch (Exception $e) {
        logToFile("Error occurred: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to get items: ' . $e->getMessage()]);
    }
}

// Handle POST requests
function handlePostRequest($pdo) {
    logToFile("Handling POST request");
    
    // Get the request data
    $rawData = file_get_contents('php://input');
    logToFile("Raw request data: " . $rawData);
    
    $data = json_decode($rawData, true);
    logToFile("Decoded request data: " . print_r($data, true));
    
    // Validate the request data
    if (!isset($data['name']) || !isset($data['category']) || !isset($data['quantity'])) {
        logToFile("Missing required fields: " . print_r($data, true));
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        return;
    }
    
    try {
        // Generate a unique ID
        $id = uniqid();
        logToFile("Generated item ID: " . $id);
        
        // Insert the item
        $stmt = $pdo->prepare("
            INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $description = isset($data['description']) ? $data['description'] : null;
        $location = isset($data['location']) ? $data['location'] : null;
        $minQuantity = isset($data['minQuantity']) ? $data['minQuantity'] : 0;
        $maxQuantity = isset($data['maxQuantity']) ? $data['maxQuantity'] : null;
        
        logToFile("Inserting item: ID=$id, Name={$data['name']}, Category={$data['category']}, Quantity={$data['quantity']}");
        
        $stmt->execute([
            $id,
            $data['name'],
            $data['category'],
            $data['quantity'],
            $description,
            $location,
            $minQuantity,
            $maxQuantity
        ]);
        
        logToFile("Item inserted successfully");
        
        // Return the created item
        $responseData = [
            'id' => $id,
            'name' => $data['name'],
            'category' => $data['category'],
            'quantity' => (int)$data['quantity'],
            'description' => $description,
            'location' => $location,
            'minQuantity' => (int)$minQuantity,
            'maxQuantity' => $maxQuantity ? (int)$maxQuantity : null
        ];
        
        logToFile("Response data: " . print_r($responseData, true));
        
        echo json_encode([
            'success' => true,
            'data' => $responseData,
            'message' => 'Item created successfully'
        ]);
        
    } catch (Exception $e) {
        logToFile("Error occurred: " . $e->getMessage() . "\n" . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create item: ' . $e->getMessage()]);
    }
}
?>
