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
    $logFile = __DIR__ . '/simple_login_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Simple Login script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);
logToFile("Request headers: " . print_r(getallheaders(), true));

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

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
    if (!isset($data['email']) || !isset($data['password'])) {
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

        // Check if the user exists
        $stmt = $mysqli->prepare("SELECT id, name, email, password, role, department FROM users WHERE email = ?");

        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }

        $stmt->bind_param("s", $data['email']);

        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user) {
            logToFile("User not found: " . $data['email']);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid email or password'
            ]);
            $mysqli->close();
            exit();
        }

        logToFile("User found: " . print_r($user, true));

        // Verify the password
        if (!password_verify($data['password'], $user['password'])) {
            logToFile("Invalid password for user: " . $data['email']);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid email or password'
            ]);
            $mysqli->close();
            exit();
        }

        logToFile("Password verified successfully");

        // Return the user data (without the password)
        $userData = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'department' => $user['department']
        ];

        logToFile("User data: " . print_r($userData, true));

        // Close the database connection
        $mysqli->close();

        // Return a success response
        echo json_encode([
            'success' => true,
            'data' => $userData,
            'message' => 'Login successful'
        ]);
    } catch (Exception $e) {
        logToFile("Error: " . $e->getMessage());

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
} else {
    // Handle GET request (for testing)
    echo json_encode([
        'success' => true,
        'message' => 'Simple Login API is working. Use POST to login.'
    ]);
}
?>
