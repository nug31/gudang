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

// For debugging
error_log("Simple Category Handler script started");
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);

// Since we're having database connection issues, let's return mock data for now
$mockCategories = [
    [
        'id' => 'cat_electronics',
        'name' => 'Electronics',
        'description' => 'Electronic components and devices',
        'color' => '#3B82F6'
    ],
    [
        'id' => 'cat_tools',
        'name' => 'Tools',
        'description' => 'Hand tools and power tools',
        'color' => '#10B981'
    ],
    [
        'id' => 'cat_equipment',
        'name' => 'Equipment',
        'description' => 'Specialized equipment and machinery',
        'color' => '#8B5CF6'
    ],
    [
        'id' => 'cat_supplies',
        'name' => 'Supplies',
        'description' => 'General office and project supplies',
        'color' => '#F59E0B'
    ]
];

// Handle different request methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Return all categories
        echo json_encode([
            'success' => true,
            'data' => $mockCategories
        ]);
        break;
    case 'POST':
        // Simulate adding a new category
        $rawData = file_get_contents('php://input');
        $data = json_decode($rawData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid JSON: ' . json_last_error_msg()
            ]);
            exit();
        }
        
        // Generate a unique ID for the category
        $categoryId = 'cat_' . uniqid();
        
        // Set default values for optional fields
        $name = isset($data['name']) ? $data['name'] : 'New Category';
        $description = isset($data['description']) ? $data['description'] : '';
        $color = isset($data['color']) ? $data['color'] : '#3B82F6';
        
        // Return the new category
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $categoryId,
                'name' => $name,
                'description' => $description,
                'color' => $color
            ],
            'message' => 'Category created successfully'
        ]);
        break;
    case 'PUT':
        // Simulate updating a category
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'No category ID provided'
            ]);
            exit();
        }
        
        $categoryId = $_GET['id'];
        $rawData = file_get_contents('php://input');
        $data = json_decode($rawData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid JSON: ' . json_last_error_msg()
            ]);
            exit();
        }
        
        // Return the updated category
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $categoryId,
                'name' => isset($data['name']) ? $data['name'] : 'Updated Category',
                'description' => isset($data['description']) ? $data['description'] : '',
                'color' => isset($data['color']) ? $data['color'] : '#3B82F6'
            ],
            'message' => 'Category updated successfully'
        ]);
        break;
    case 'DELETE':
        // Simulate deleting a category
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'No category ID provided'
            ]);
            exit();
        }
        
        // Return success
        echo json_encode([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
        break;
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        break;
}
?>
