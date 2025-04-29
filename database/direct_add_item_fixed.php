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
    $logFile = __DIR__ . '/direct_add_item_fixed_log.txt';
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

logToFile("Direct Add Item Fixed script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

// Handle GET request (fetch items)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    logToFile("Handling GET request");
    
    try {
        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        if ($mysqli->connect_error) {
            logToFile("Database connection error: " . $mysqli->connect_error);
            returnJson(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]);
        }
        
        logToFile("Connected to database successfully");
        
        // Get all items
        $sql = "SELECT * FROM items";
        $result = $mysqli->query($sql);
        
        if (!$result) {
            logToFile("Query failed: " . $mysqli->error);
            throw new Exception("Query failed: " . $mysqli->error);
        }
        
        $items = [];
        
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'category' => $row['category'],
                'quantity' => (int)$row['quantity'],
                'description' => $row['description'],
                'location' => $row['location'],
                'minQuantity' => (int)$row['min_quantity'],
                'maxQuantity' => (int)$row['max_quantity'],
                'totalStock' => (int)$row['quantity'],
                'availableStock' => (int)$row['quantity'],
                'reservedStock' => 0,
                'lowStockThreshold' => (int)$row['min_quantity']
            ];
        }
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        returnJson([
            'success' => true,
            'data' => $items,
            'message' => 'Items fetched successfully'
        ]);
        
    } catch (Exception $e) {
        logToFile("Error: " . $e->getMessage());
        
        // Close the database connection if it exists
        if (isset($mysqli)) {
            $mysqli->close();
        }
        
        // Return error response
        returnJson([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
// Handle POST request (add item)
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
        if (!isset($data['name']) || !isset($data['category'])) {
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
        
        // Generate a unique ID for the item
        $itemId = uniqid();
        logToFile("Generated item ID: " . $itemId);
        
        // Prepare the item data
        $name = $mysqli->real_escape_string($data['name']);
        $category = $mysqli->real_escape_string($data['category']);
        $description = isset($data['description']) ? $mysqli->real_escape_string($data['description']) : '';
        $location = isset($data['location']) ? $mysqli->real_escape_string($data['location']) : '';
        
        // Handle stock quantities
        $totalStock = isset($data['totalStock']) ? (int)$data['totalStock'] : 0;
        $minQuantity = isset($data['lowStockThreshold']) ? (int)$data['lowStockThreshold'] : 0;
        $maxQuantity = isset($data['maxQuantity']) ? (int)$data['maxQuantity'] : 0;
        
        // Insert the item
        $sql = "INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("sssissii", $itemId, $name, $category, $totalStock, $description, $location, $minQuantity, $maxQuantity);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        logToFile("Item inserted successfully");
        
        // Format the response data
        $responseData = [
            'id' => $itemId,
            'name' => $name,
            'category' => $category,
            'totalStock' => $totalStock,
            'availableStock' => $totalStock,
            'reservedStock' => 0,
            'lowStockThreshold' => $minQuantity,
            'description' => $description,
            'location' => $location,
            'minQuantity' => $minQuantity,
            'maxQuantity' => $maxQuantity
        ];
        
        logToFile("Response data: " . print_r($responseData, true));
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        returnJson([
            'success' => true,
            'data' => $responseData,
            'message' => 'Item added successfully'
        ]);
        
    } catch (Exception $e) {
        logToFile("Error: " . $e->getMessage());
        
        // Close the database connection if it exists
        if (isset($mysqli)) {
            $mysqli->close();
        }
        
        // Return error response
        returnJson([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    // Handle other request methods
    returnJson([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
