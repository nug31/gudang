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
    $logFile = __DIR__ . '/simple_add_item_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Simple Add Item script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);
logToFile("Request headers: " . print_r(getallheaders(), true));

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
            throw new Exception("Connection failed: " . $mysqli->connect_error);
        }
        
        logToFile("Connected to database successfully");
        
        // Get all items
        $sql = "SELECT * FROM items";
        $result = $mysqli->query($sql);
        
        if (!$result) {
            throw new Exception("Query failed: " . $mysqli->error);
        }
        
        $items = [];
        
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'category' => $row['category'],
                'totalStock' => (int)$row['quantity'],
                'availableStock' => (int)$row['quantity'],
                'reservedStock' => 0,
                'lowStockThreshold' => (int)$row['min_quantity'],
                'description' => $row['description'],
                'location' => $row['location']
            ];
        }
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        echo json_encode([
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
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
// Handle POST request (add item)
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
    
    try {
        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        if ($mysqli->connect_error) {
            throw new Exception("Connection failed: " . $mysqli->connect_error);
        }
        
        logToFile("Connected to database successfully");
        
        // Generate a unique ID for the item
        $itemId = uniqid();
        logToFile("Generated item ID: " . $itemId);
        
        // Set default values for missing fields
        $name = isset($data['name']) ? $data['name'] : 'New Item';
        $category = isset($data['category']) ? $data['category'] : 'Other';
        $description = isset($data['description']) ? $data['description'] : '';
        $location = isset($data['location']) ? $data['location'] : '';
        $totalStock = isset($data['totalStock']) ? (int)$data['totalStock'] : 0;
        $minQuantity = isset($data['lowStockThreshold']) ? (int)$data['lowStockThreshold'] : 0;
        $maxQuantity = isset($data['maxQuantity']) ? (int)$data['maxQuantity'] : 0;
        
        // Insert the item
        $sql = "INSERT INTO items (id, name, category, quantity, description, location, min_quantity, max_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("sssisiii", $itemId, $name, $category, $totalStock, $description, $location, $minQuantity, $maxQuantity);
        
        if (!$stmt->execute()) {
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
            'location' => $location
        ];
        
        logToFile("Response data: " . print_r($responseData, true));
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        echo json_encode([
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
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    // Handle other request methods
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
