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
    $logFile = __DIR__ . '/simple_user_management_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Simple User Management script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);
logToFile("Request headers: " . print_r(getallheaders(), true));

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

try {
    // Connect to the database
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    logToFile("Connected to database successfully");
    
    // Handle different request methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            handleGetRequest($mysqli);
            break;
        case 'POST':
            handlePostRequest($mysqli);
            break;
        case 'PUT':
            handlePutRequest($mysqli);
            break;
        case 'DELETE':
            handleDeleteRequest($mysqli);
            break;
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
            break;
    }
    
    // Close the database connection
    $mysqli->close();
} catch (Exception $e) {
    logToFile("Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Handle GET request (fetch users)
function handleGetRequest($mysqli) {
    logToFile("Handling GET request");
    
    // Check if a specific user ID is requested
    if (isset($_GET['id'])) {
        $userId = $_GET['id'];
        logToFile("Fetching user with ID: " . $userId);
        
        $stmt = $mysqli->prepare("SELECT id, name, email, role, department FROM users WHERE id = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $userId);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'User not found'
            ]);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $user
        ]);
    } else {
        // Fetch all users
        logToFile("Fetching all users");
        
        $result = $mysqli->query("SELECT id, name, email, role, department FROM users");
        
        if (!$result) {
            throw new Exception("Query failed: " . $mysqli->error);
        }
        
        $users = [];
        
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $users
        ]);
    }
}

// Handle POST request (create a new user)
function handlePostRequest($mysqli) {
    logToFile("Handling POST request");
    
    // Get the request data
    $rawData = file_get_contents('php://input');
    logToFile("Raw request data: " . $rawData);
    
    $data = json_decode($rawData, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        logToFile("JSON decode error: " . json_last_error_msg());
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON: ' . json_last_error_msg()
        ]);
        return;
    }
    
    logToFile("Decoded request data: " . print_r($data, true));
    
    // Validate the request data
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        logToFile("Missing required fields");
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields'
        ]);
        return;
    }
    
    // Check if the email already exists
    $stmt = $mysqli->prepare("SELECT id FROM users WHERE email = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $data['email']);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        logToFile("Email already exists: " . $data['email']);
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'Email already exists'
        ]);
        return;
    }
    
    // Generate a unique ID for the user
    $userId = uniqid();
    logToFile("Generated user ID: " . $userId);
    
    // Hash the password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Set default values for optional fields
    $role = isset($data['role']) ? $data['role'] : 'requester';
    $department = isset($data['department']) ? $data['department'] : null;
    
    // Insert the user
    $stmt = $mysqli->prepare("INSERT INTO users (id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("ssssss", $userId, $data['name'], $data['email'], $hashedPassword, $role, $department);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    logToFile("User inserted successfully");
    
    // Return the new user
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $userId,
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $role,
            'department' => $department
        ],
        'message' => 'User created successfully'
    ]);
}

// Handle PUT request (update a user)
function handlePutRequest($mysqli) {
    logToFile("Handling PUT request");
    
    // Check if a user ID is provided
    if (!isset($_GET['id'])) {
        logToFile("No user ID provided");
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No user ID provided'
        ]);
        return;
    }
    
    $userId = $_GET['id'];
    logToFile("Updating user with ID: " . $userId);
    
    // Get the request data
    $rawData = file_get_contents('php://input');
    logToFile("Raw request data: " . $rawData);
    
    $data = json_decode($rawData, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        logToFile("JSON decode error: " . json_last_error_msg());
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON: ' . json_last_error_msg()
        ]);
        return;
    }
    
    logToFile("Decoded request data: " . print_r($data, true));
    
    // Check if the user exists
    $stmt = $mysqli->prepare("SELECT id, name, email, role, department FROM users WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $userId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user) {
        logToFile("User not found: " . $userId);
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
        return;
    }
    
    // Build the update query
    $updateFields = [];
    $updateValues = [];
    $updateTypes = "";
    
    if (isset($data['name'])) {
        $updateFields[] = "name = ?";
        $updateValues[] = $data['name'];
        $updateTypes .= "s";
    }
    
    if (isset($data['email'])) {
        // Check if the email already exists for another user
        $stmt = $mysqli->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("ss", $data['email'], $userId);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            logToFile("Email already exists: " . $data['email']);
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => 'Email already exists'
            ]);
            return;
        }
        
        $updateFields[] = "email = ?";
        $updateValues[] = $data['email'];
        $updateTypes .= "s";
    }
    
    if (isset($data['password']) && !empty($data['password'])) {
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $updateFields[] = "password = ?";
        $updateValues[] = $hashedPassword;
        $updateTypes .= "s";
    }
    
    if (isset($data['role'])) {
        $updateFields[] = "role = ?";
        $updateValues[] = $data['role'];
        $updateTypes .= "s";
    }
    
    if (isset($data['department'])) {
        $updateFields[] = "department = ?";
        $updateValues[] = $data['department'];
        $updateTypes .= "s";
    }
    
    if (empty($updateFields)) {
        logToFile("No fields to update");
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No fields to update'
        ]);
        return;
    }
    
    // Update the user
    $query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $mysqli->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $updateValues[] = $userId;
    $updateTypes .= "s";
    
    $stmt->bind_param($updateTypes, ...$updateValues);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    logToFile("User updated successfully");
    
    // Fetch the updated user
    $stmt = $mysqli->prepare("SELECT id, name, email, role, department FROM users WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $userId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $updatedUser = $result->fetch_assoc();
    
    // Return the updated user
    echo json_encode([
        'success' => true,
        'data' => $updatedUser,
        'message' => 'User updated successfully'
    ]);
}

// Handle DELETE request (delete a user)
function handleDeleteRequest($mysqli) {
    logToFile("Handling DELETE request");
    
    // Check if a user ID is provided
    if (!isset($_GET['id'])) {
        logToFile("No user ID provided");
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No user ID provided'
        ]);
        return;
    }
    
    $userId = $_GET['id'];
    logToFile("Deleting user with ID: " . $userId);
    
    // Check if the user exists
    $stmt = $mysqli->prepare("SELECT id FROM users WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $userId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        logToFile("User not found: " . $userId);
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
        return;
    }
    
    // Delete the user
    $stmt = $mysqli->prepare("DELETE FROM users WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $userId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    logToFile("User deleted successfully");
    
    // Return success
    echo json_encode([
        'success' => true,
        'message' => 'User deleted successfully'
    ]);
}
?>
