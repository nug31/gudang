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
    $logFile = __DIR__ . '/direct_insert_fixed_log.txt';
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

logToFile("Direct Insert Fixed script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);

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

        // Check if the requester exists
        $requesterId = $data['requesterId'];
        logToFile("Checking if requester exists: " . $requesterId);

        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

        if ($mysqli->connect_error) {
            logToFile("Database connection error: " . $mysqli->connect_error);
            returnJson(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]);
        }

        logToFile("Connected to database successfully");

        // Check if the requester exists
        $stmt = $mysqli->prepare("SELECT id FROM users WHERE id = ?");

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

        if ($result->num_rows == 0) {
            logToFile("Requester not found: " . $requesterId);
            throw new Exception("Requester not found: " . $requesterId . ". Please make sure the requester exists in the users table.");
        }

        logToFile("Requester exists: " . $requesterId);

        // Start a transaction
        $mysqli->begin_transaction();
        logToFile("Transaction started");

        // Generate a unique ID for the request
        $requestId = uniqid();
        logToFile("Generated request ID: " . $requestId);

        // Prepare the request data
        $projectName = $mysqli->real_escape_string($data['projectName']);
        $requesterId = $mysqli->real_escape_string($data['requesterId']);
        $reason = $mysqli->real_escape_string($data['reason']);
        $priority = isset($data['priority']) ? $mysqli->real_escape_string($data['priority']) : 'medium';
        $dueDate = isset($data['dueDate']) && !empty($data['dueDate']) ? $mysqli->real_escape_string($data['dueDate']) : null;
        $status = 'pending';

        // Insert the request
        $sql = "INSERT INTO requests (id, project_name, requester_id, reason, priority, due_date, status)
                VALUES ('$requestId', '$projectName', '$requesterId', '$reason', '$priority', " .
                ($dueDate ? "'$dueDate'" : "NULL") . ", '$status')";

        logToFile("SQL query: " . $sql);

        if (!$mysqli->query($sql)) {
            logToFile("Error inserting request: " . $mysqli->error);
            throw new Exception("Error inserting request: " . $mysqli->error);
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
            $stmt = $mysqli->prepare("SELECT id FROM items WHERE id = ?");

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

            if ($result->num_rows == 0) {
                logToFile("Item not found: " . $itemId);
                throw new Exception("Item not found: " . $itemId . ". Please make sure the item exists in the items table.");
            }

            logToFile("Item exists: " . $itemId);

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

        // Get the requester information
        $sql = "SELECT name, email FROM users WHERE id = '$requesterId'";

        logToFile("SQL query: " . $sql);

        $result = $mysqli->query($sql);

        if (!$result) {
            logToFile("Error getting requester information: " . $mysqli->error);
            throw new Exception("Error getting requester information: " . $mysqli->error);
        }

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
            'projectName' => $data['projectName'],
            'requester' => [
                'id' => $requesterId,
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
        'message' => 'Direct Insert Fixed API is working. Use POST to insert a request.'
    ]);
} else {
    // Handle other request methods
    returnJson([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
