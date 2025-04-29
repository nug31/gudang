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
    $logFile = __DIR__ . '/direct_user_management_log.txt';
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

logToFile("Direct User Management script started");
logToFile("Request method: " . $_SERVER['REQUEST_METHOD']);
logToFile("Request URI: " . $_SERVER['REQUEST_URI']);

// Database configuration
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

// Handle GET request (fetch users)
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
        
        // Check if a specific user is requested
        $userId = isset($_GET['id']) ? $_GET['id'] : null;
        
        if ($userId) {
            // Get a specific user
            $sql = "SELECT id, name, email, role, department FROM users WHERE id = ?";
            $stmt = $mysqli->prepare($sql);
            
            if (!$stmt) {
                logToFile("Prepare failed: " . $mysqli->error);
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $stmt->bind_param("s", $userId);
            
            if (!$stmt->execute()) {
                logToFile("Execute failed: " . $stmt->error);
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            
            if (!$user) {
                logToFile("User not found: " . $userId);
                throw new Exception("User not found: " . $userId);
            }
            
            // Close the database connection
            $mysqli->close();
            
            // Return success response
            returnJson([
                'success' => true,
                'data' => $user,
                'message' => 'User fetched successfully'
            ]);
        } else {
            // Get all users
            $sql = "SELECT id, name, email, role, department FROM users";
            $result = $mysqli->query($sql);
            
            if (!$result) {
                logToFile("Query failed: " . $mysqli->error);
                throw new Exception("Query failed: " . $mysqli->error);
            }
            
            $users = [];
            
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            
            // Close the database connection
            $mysqli->close();
            
            // Return success response
            returnJson([
                'success' => true,
                'data' => $users,
                'message' => 'Users fetched successfully'
            ]);
        }
        
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
// Handle POST request (add user)
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
        if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
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
        
        // Check if the email already exists
        $sql = "SELECT id FROM users WHERE email = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $data['email']);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            logToFile("Email already exists: " . $data['email']);
            throw new Exception("Email already exists: " . $data['email']);
        }
        
        // Generate a unique ID for the user
        $userId = uniqid();
        logToFile("Generated user ID: " . $userId);
        
        // Prepare the user data
        $name = $mysqli->real_escape_string($data['name']);
        $email = $mysqli->real_escape_string($data['email']);
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $role = isset($data['role']) ? $mysqli->real_escape_string($data['role']) : 'requester';
        $department = isset($data['department']) ? $mysqli->real_escape_string($data['department']) : null;
        
        // Insert the user
        $sql = "INSERT INTO users (id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("ssssss", $userId, $name, $email, $password, $role, $department);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        logToFile("User inserted successfully");
        
        // Format the response data
        $responseData = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'department' => $department
        ];
        
        logToFile("Response data: " . print_r($responseData, true));
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        returnJson([
            'success' => true,
            'data' => $responseData,
            'message' => 'User added successfully'
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
// Handle PUT request (update user)
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    logToFile("Handling PUT request");
    
    try {
        // Get the user ID from the query string
        $userId = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$userId) {
            logToFile("Missing user ID");
            returnJson(['success' => false, 'error' => 'Missing user ID']);
        }
        
        logToFile("User ID: " . $userId);
        
        // Get the request data
        $rawData = file_get_contents('php://input');
        logToFile("Raw request data: " . $rawData);
        
        $data = json_decode($rawData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            logToFile("JSON decode error: " . json_last_error_msg());
            returnJson(['success' => false, 'error' => 'Invalid JSON: ' . json_last_error_msg()]);
        }
        
        logToFile("Decoded request data: " . print_r($data, true));
        
        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        if ($mysqli->connect_error) {
            logToFile("Database connection error: " . $mysqli->connect_error);
            returnJson(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]);
        }
        
        logToFile("Connected to database successfully");
        
        // Check if the user exists
        $sql = "SELECT * FROM users WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $userId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!$user) {
            logToFile("User not found: " . $userId);
            throw new Exception("User not found: " . $userId);
        }
        
        logToFile("User found: " . print_r($user, true));
        
        // Prepare the update data
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
            $sql = "SELECT id FROM users WHERE email = ? AND id != ?";
            $stmt = $mysqli->prepare($sql);
            
            if (!$stmt) {
                logToFile("Prepare failed: " . $mysqli->error);
                throw new Exception("Prepare failed: " . $mysqli->error);
            }
            
            $stmt->bind_param("ss", $data['email'], $userId);
            
            if (!$stmt->execute()) {
                logToFile("Execute failed: " . $stmt->error);
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                logToFile("Email already exists: " . $data['email']);
                throw new Exception("Email already exists: " . $data['email']);
            }
            
            $updateFields[] = "email = ?";
            $updateValues[] = $data['email'];
            $updateTypes .= "s";
        }
        
        if (isset($data['password'])) {
            $updateFields[] = "password = ?";
            $updateValues[] = password_hash($data['password'], PASSWORD_DEFAULT);
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
            throw new Exception("No fields to update");
        }
        
        // Update the user
        $sql = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        // Add the user ID to the values and types
        $updateValues[] = $userId;
        $updateTypes .= "s";
        
        // Bind the parameters
        $stmt->bind_param($updateTypes, ...$updateValues);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        logToFile("User updated successfully");
        
        // Get the updated user
        $sql = "SELECT id, name, email, role, department FROM users WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $userId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $updatedUser = $result->fetch_assoc();
        
        if (!$updatedUser) {
            logToFile("Updated user not found: " . $userId);
            throw new Exception("Updated user not found: " . $userId);
        }
        
        logToFile("Updated user: " . print_r($updatedUser, true));
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        returnJson([
            'success' => true,
            'data' => $updatedUser,
            'message' => 'User updated successfully'
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
// Handle DELETE request (delete user)
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    logToFile("Handling DELETE request");
    
    try {
        // Get the user ID from the query string
        $userId = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$userId) {
            logToFile("Missing user ID");
            returnJson(['success' => false, 'error' => 'Missing user ID']);
        }
        
        logToFile("User ID: " . $userId);
        
        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        if ($mysqli->connect_error) {
            logToFile("Database connection error: " . $mysqli->connect_error);
            returnJson(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]);
        }
        
        logToFile("Connected to database successfully");
        
        // Check if the user exists
        $sql = "SELECT * FROM users WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $userId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!$user) {
            logToFile("User not found: " . $userId);
            throw new Exception("User not found: " . $userId);
        }
        
        logToFile("User found: " . print_r($user, true));
        
        // Delete the user
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            logToFile("Prepare failed: " . $mysqli->error);
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $userId);
        
        if (!$stmt->execute()) {
            logToFile("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        logToFile("User deleted successfully");
        
        // Close the database connection
        $mysqli->close();
        
        // Return success response
        returnJson([
            'success' => true,
            'message' => 'User deleted successfully'
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
