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
    $logFile = __DIR__ . '/simple_category_handler_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Simple Category Handler script started");
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
    
    // Check if the categories table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'categories'");
    
    if ($result->num_rows == 0) {
        // Create the categories table
        $sql = "CREATE TABLE categories (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            color VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        if (!$mysqli->query($sql)) {
            throw new Exception("Error creating categories table: " . $mysqli->error);
        }
        
        logToFile("Categories table created successfully");
        
        // Insert default categories
        $defaultCategories = [
            ['id' => 'cat_electronics', 'name' => 'Electronics', 'description' => 'Electronic components and devices', 'color' => '#3B82F6'],
            ['id' => 'cat_tools', 'name' => 'Tools', 'description' => 'Hand tools and power tools', 'color' => '#10B981'],
            ['id' => 'cat_equipment', 'name' => 'Equipment', 'description' => 'Specialized equipment and machinery', 'color' => '#8B5CF6'],
            ['id' => 'cat_supplies', 'name' => 'Supplies', 'description' => 'General office and project supplies', 'color' => '#F59E0B']
        ];
        
        foreach ($defaultCategories as $category) {
            $stmt = $mysqli->prepare("INSERT INTO categories (id, name, description, color) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $category['id'], $category['name'], $category['description'], $category['color']);
            
            if (!$stmt->execute()) {
                logToFile("Error inserting default category: " . $stmt->error);
            }
        }
        
        logToFile("Default categories inserted successfully");
    } else {
        logToFile("Categories table already exists");
    }
    
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

// Handle GET request (fetch categories)
function handleGetRequest($mysqli) {
    logToFile("Handling GET request");
    
    // Check if a specific category ID is requested
    if (isset($_GET['id'])) {
        $categoryId = $_GET['id'];
        logToFile("Fetching category with ID: " . $categoryId);
        
        $stmt = $mysqli->prepare("SELECT id, name, description, color FROM categories WHERE id = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("s", $categoryId);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $category = $result->fetch_assoc();
        
        if (!$category) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Category not found'
            ]);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $category
        ]);
    } else {
        // Fetch all categories
        logToFile("Fetching all categories");
        
        $result = $mysqli->query("SELECT id, name, description, color FROM categories ORDER BY name");
        
        if (!$result) {
            throw new Exception("Query failed: " . $mysqli->error);
        }
        
        $categories = [];
        
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $categories
        ]);
    }
}

// Handle POST request (create a new category)
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
    if (!isset($data['name'])) {
        logToFile("Missing required fields");
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Category name is required'
        ]);
        return;
    }
    
    // Check if the category name already exists
    $stmt = $mysqli->prepare("SELECT id FROM categories WHERE name = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $data['name']);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        logToFile("Category name already exists: " . $data['name']);
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'Category name already exists'
        ]);
        return;
    }
    
    // Generate a unique ID for the category
    $categoryId = 'cat_' . uniqid();
    logToFile("Generated category ID: " . $categoryId);
    
    // Set default values for optional fields
    $description = isset($data['description']) ? $data['description'] : '';
    $color = isset($data['color']) ? $data['color'] : '#3B82F6';
    
    // Insert the category
    $stmt = $mysqli->prepare("INSERT INTO categories (id, name, description, color) VALUES (?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("ssss", $categoryId, $data['name'], $description, $color);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    logToFile("Category inserted successfully");
    
    // Return the new category
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $categoryId,
            'name' => $data['name'],
            'description' => $description,
            'color' => $color
        ],
        'message' => 'Category created successfully'
    ]);
}

// Handle PUT request (update a category)
function handlePutRequest($mysqli) {
    logToFile("Handling PUT request");
    
    // Check if a category ID is provided
    if (!isset($_GET['id'])) {
        logToFile("No category ID provided");
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No category ID provided'
        ]);
        return;
    }
    
    $categoryId = $_GET['id'];
    logToFile("Updating category with ID: " . $categoryId);
    
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
    
    // Check if the category exists
    $stmt = $mysqli->prepare("SELECT id, name FROM categories WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $categoryId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $category = $result->fetch_assoc();
    
    if (!$category) {
        logToFile("Category not found: " . $categoryId);
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Category not found'
        ]);
        return;
    }
    
    // Check if the new name already exists (if name is being updated)
    if (isset($data['name']) && $data['name'] !== $category['name']) {
        $stmt = $mysqli->prepare("SELECT id FROM categories WHERE name = ? AND id != ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("ss", $data['name'], $categoryId);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            logToFile("Category name already exists: " . $data['name']);
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => 'Category name already exists'
            ]);
            return;
        }
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
    
    if (isset($data['description'])) {
        $updateFields[] = "description = ?";
        $updateValues[] = $data['description'];
        $updateTypes .= "s";
    }
    
    if (isset($data['color'])) {
        $updateFields[] = "color = ?";
        $updateValues[] = $data['color'];
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
    
    // Update the category
    $query = "UPDATE categories SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $mysqli->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $updateValues[] = $categoryId;
    $updateTypes .= "s";
    
    $stmt->bind_param($updateTypes, ...$updateValues);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    logToFile("Category updated successfully");
    
    // If the category name was updated, update all items with this category
    if (isset($data['name']) && $data['name'] !== $category['name']) {
        $stmt = $mysqli->prepare("UPDATE items SET category = ? WHERE category = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("ss", $data['name'], $category['name']);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        logToFile("Items updated with new category name");
    }
    
    // Fetch the updated category
    $stmt = $mysqli->prepare("SELECT id, name, description, color FROM categories WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $categoryId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $updatedCategory = $result->fetch_assoc();
    
    // Return the updated category
    echo json_encode([
        'success' => true,
        'data' => $updatedCategory,
        'message' => 'Category updated successfully'
    ]);
}

// Handle DELETE request (delete a category)
function handleDeleteRequest($mysqli) {
    logToFile("Handling DELETE request");
    
    // Check if a category ID is provided
    if (!isset($_GET['id'])) {
        logToFile("No category ID provided");
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No category ID provided'
        ]);
        return;
    }
    
    $categoryId = $_GET['id'];
    logToFile("Deleting category with ID: " . $categoryId);
    
    // Check if the category exists
    $stmt = $mysqli->prepare("SELECT id, name FROM categories WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $categoryId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $category = $result->fetch_assoc();
    
    if (!$result->num_rows) {
        logToFile("Category not found: " . $categoryId);
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Category not found'
        ]);
        return;
    }
    
    // Update all items with this category to "Uncategorized"
    $stmt = $mysqli->prepare("UPDATE items SET category = 'Uncategorized' WHERE category = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $category['name']);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    logToFile("Items updated to Uncategorized");
    
    // Delete the category
    $stmt = $mysqli->prepare("DELETE FROM categories WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $categoryId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    logToFile("Category deleted successfully");
    
    // Return success
    echo json_encode([
        'success' => true,
        'message' => 'Category deleted successfully'
    ]);
}
?>
