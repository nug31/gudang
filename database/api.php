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

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// API endpoints
switch ($request) {
    case 'users':
        handleUsers($method, $pdo);
        break;
    case 'items':
        handleItems($method, $pdo);
        break;
    case 'requests':
        handleRequests($method, $pdo);
        break;
    case 'login':
        handleLogin($method, $pdo);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

// Handle users endpoint
function handleUsers($method, $pdo) {
    switch ($method) {
        case 'GET':
            // Get all users or a specific user
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT id, name, email, role, department FROM users WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $user = $stmt->fetch();
                
                if ($user) {
                    echo json_encode($user);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                }
            } else {
                $stmt = $pdo->query("SELECT id, name, email, role, department FROM users");
                $users = $stmt->fetchAll();
                echo json_encode($users);
            }
            break;
            
        case 'POST':
            // Create a new user
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                return;
            }
            
            try {
                // Check if email already exists
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->execute([$data['email']]);
                if ($stmt->rowCount() > 0) {
                    http_response_code(409);
                    echo json_encode(['error' => 'Email already in use']);
                    return;
                }
                
                // Generate a unique ID
                $id = uniqid();
                
                // Hash the password
                $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
                
                // Insert the new user
                $stmt = $pdo->prepare("
                    INSERT INTO users (id, name, email, password, role, department) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $role = isset($data['role']) ? $data['role'] : 'requester';
                $department = isset($data['department']) ? $data['department'] : null;
                
                $stmt->execute([$id, $data['name'], $data['email'], $hashedPassword, $role, $department]);
                
                // Return the new user without the password
                echo json_encode([
                    'id' => $id,
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'role' => $role,
                    'department' => $department
                ]);
                
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create user: ' . $e->getMessage()]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
}

// Handle items endpoint
function handleItems($method, $pdo) {
    switch ($method) {
        case 'GET':
            // Get all items or a specific item
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $item = $stmt->fetch();
                
                if ($item) {
                    echo json_encode($item);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Item not found']);
                }
            } else {
                // Get items with optional category filter
                if (isset($_GET['category'])) {
                    $stmt = $pdo->prepare("SELECT * FROM items WHERE category = ?");
                    $stmt->execute([$_GET['category']]);
                    $items = $stmt->fetchAll();
                } else {
                    $stmt = $pdo->query("SELECT * FROM items");
                    $items = $stmt->fetchAll();
                }
                
                echo json_encode($items);
            }
            break;
            
        case 'POST':
            // Create a new item
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['category'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                return;
            }
            
            try {
                // Generate a unique ID
                $id = uniqid();
                
                // Insert the new item
                $stmt = $pdo->prepare("
                    INSERT INTO items (
                        id, name, description, total_stock, available_stock, 
                        reserved_stock, low_stock_threshold, category
                    ) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $description = isset($data['description']) ? $data['description'] : '';
                $totalStock = isset($data['totalStock']) ? $data['totalStock'] : 0;
                $availableStock = isset($data['availableStock']) ? $data['availableStock'] : 0;
                $reservedStock = isset($data['reservedStock']) ? $data['reservedStock'] : 0;
                $lowStockThreshold = isset($data['lowStockThreshold']) ? $data['lowStockThreshold'] : 5;
                
                $stmt->execute([
                    $id, 
                    $data['name'], 
                    $description, 
                    $totalStock, 
                    $availableStock, 
                    $reservedStock, 
                    $lowStockThreshold, 
                    $data['category']
                ]);
                
                // Return the new item
                echo json_encode([
                    'id' => $id,
                    'name' => $data['name'],
                    'description' => $description,
                    'totalStock' => $totalStock,
                    'availableStock' => $availableStock,
                    'reservedStock' => $reservedStock,
                    'lowStockThreshold' => $lowStockThreshold,
                    'category' => $data['category']
                ]);
                
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create item: ' . $e->getMessage()]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
}

// Handle requests endpoint
function handleRequests($method, $pdo) {
    switch ($method) {
        case 'GET':
            // Get all requests or a specific request
            if (isset($_GET['id'])) {
                // Get a specific request with its items and pickup details
                try {
                    // Get the request
                    $stmt = $pdo->prepare("
                        SELECT r.*, u.name as requester_name, u.email as requester_email
                        FROM requests r
                        JOIN users u ON r.requester_id = u.id
                        WHERE r.id = ?
                    ");
                    $stmt->execute([$_GET['id']]);
                    $request = $stmt->fetch();
                    
                    if (!$request) {
                        http_response_code(404);
                        echo json_encode(['error' => 'Request not found']);
                        return;
                    }
                    
                    // Get the request items
                    $stmt = $pdo->prepare("
                        SELECT ri.*, i.name as item_name
                        FROM request_items ri
                        JOIN items i ON ri.item_id = i.id
                        WHERE ri.request_id = ?
                    ");
                    $stmt->execute([$_GET['id']]);
                    $items = $stmt->fetchAll();
                    
                    // Get pickup details if any
                    $stmt = $pdo->prepare("
                        SELECT * FROM pickup_details
                        WHERE request_id = ?
                    ");
                    $stmt->execute([$_GET['id']]);
                    $pickupDetails = $stmt->fetch();
                    
                    // Format the response
                    $response = [
                        'id' => $request['id'],
                        'projectName' => $request['project_name'],
                        'requester' => [
                            'id' => $request['requester_id'],
                            'name' => $request['requester_name'],
                            'email' => $request['requester_email']
                        ],
                        'items' => array_map(function($item) {
                            return [
                                'itemId' => $item['item_id'],
                                'itemName' => $item['item_name'],
                                'quantity' => $item['quantity']
                            ];
                        }, $items),
                        'reason' => $request['reason'],
                        'priority' => $request['priority'],
                        'dueDate' => $request['due_date'],
                        'status' => $request['status'],
                        'createdAt' => $request['created_at'],
                        'updatedAt' => $request['updated_at']
                    ];
                    
                    // Add pickup details if available
                    if ($pickupDetails) {
                        $response['pickupDetails'] = [
                            'location' => $pickupDetails['location'],
                            'time' => $pickupDetails['pickup_time'],
                            'delivered' => (bool)$pickupDetails['delivered']
                        ];
                    }
                    
                    echo json_encode($response);
                    
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to fetch request: ' . $e->getMessage()]);
                }
            } else {
                // Get all requests with optional filters
                try {
                    $query = "
                        SELECT r.*, u.name as requester_name, u.email as requester_email
                        FROM requests r
                        JOIN users u ON r.requester_id = u.id
                    ";
                    
                    $params = [];
                    $whereConditions = [];
                    
                    // Filter by requester
                    if (isset($_GET['requester_id'])) {
                        $whereConditions[] = "r.requester_id = ?";
                        $params[] = $_GET['requester_id'];
                    }
                    
                    // Filter by status
                    if (isset($_GET['status'])) {
                        $whereConditions[] = "r.status = ?";
                        $params[] = $_GET['status'];
                    }
                    
                    // Add WHERE clause if there are conditions
                    if (!empty($whereConditions)) {
                        $query .= " WHERE " . implode(" AND ", $whereConditions);
                    }
                    
                    // Order by created_at desc
                    $query .= " ORDER BY r.created_at DESC";
                    
                    $stmt = $pdo->prepare($query);
                    $stmt->execute($params);
                    $requests = $stmt->fetchAll();
                    
                    // Format the response
                    $formattedRequests = [];
                    foreach ($requests as $request) {
                        // Get the request items
                        $stmt = $pdo->prepare("
                            SELECT ri.*, i.name as item_name
                            FROM request_items ri
                            JOIN items i ON ri.item_id = i.id
                            WHERE ri.request_id = ?
                        ");
                        $stmt->execute([$request['id']]);
                        $items = $stmt->fetchAll();
                        
                        // Get pickup details if any
                        $stmt = $pdo->prepare("
                            SELECT * FROM pickup_details
                            WHERE request_id = ?
                        ");
                        $stmt->execute([$request['id']]);
                        $pickupDetails = $stmt->fetch();
                        
                        $formattedRequest = [
                            'id' => $request['id'],
                            'projectName' => $request['project_name'],
                            'requester' => [
                                'id' => $request['requester_id'],
                                'name' => $request['requester_name'],
                                'email' => $request['requester_email']
                            ],
                            'items' => array_map(function($item) {
                                return [
                                    'itemId' => $item['item_id'],
                                    'itemName' => $item['item_name'],
                                    'quantity' => $item['quantity']
                                ];
                            }, $items),
                            'reason' => $request['reason'],
                            'priority' => $request['priority'],
                            'dueDate' => $request['due_date'],
                            'status' => $request['status'],
                            'createdAt' => $request['created_at'],
                            'updatedAt' => $request['updated_at']
                        ];
                        
                        // Add pickup details if available
                        if ($pickupDetails) {
                            $formattedRequest['pickupDetails'] = [
                                'location' => $pickupDetails['location'],
                                'time' => $pickupDetails['pickup_time'],
                                'delivered' => (bool)$pickupDetails['delivered']
                            ];
                        }
                        
                        $formattedRequests[] = $formattedRequest;
                    }
                    
                    echo json_encode($formattedRequests);
                    
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to fetch requests: ' . $e->getMessage()]);
                }
            }
            break;
            
        case 'POST':
            // Create a new request
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['projectName']) || !isset($data['requesterId']) || !isset($data['items']) || !isset($data['reason'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                return;
            }
            
            try {
                // Start a transaction
                $pdo->beginTransaction();
                
                // Generate a unique ID
                $id = uniqid();
                
                // Insert the request
                $stmt = $pdo->prepare("
                    INSERT INTO requests (
                        id, project_name, requester_id, reason, priority, due_date, status
                    ) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                
                $priority = isset($data['priority']) ? $data['priority'] : 'medium';
                $dueDate = isset($data['dueDate']) ? $data['dueDate'] : null;
                $status = 'pending';
                
                $stmt->execute([
                    $id, 
                    $data['projectName'], 
                    $data['requesterId'], 
                    $data['reason'], 
                    $priority, 
                    $dueDate, 
                    $status
                ]);
                
                // Insert the request items
                foreach ($data['items'] as $item) {
                    if (!isset($item['itemId']) || !isset($item['quantity'])) {
                        throw new Exception('Invalid item data');
                    }
                    
                    $stmt = $pdo->prepare("
                        INSERT INTO request_items (request_id, item_id, quantity) 
                        VALUES (?, ?, ?)
                    ");
                    
                    $stmt->execute([
                        $id, 
                        $item['itemId'], 
                        $item['quantity']
                    ]);
                }
                
                // Commit the transaction
                $pdo->commit();
                
                // Return success response
                echo json_encode([
                    'id' => $id,
                    'message' => 'Request created successfully'
                ]);
                
            } catch (Exception $e) {
                // Rollback the transaction on error
                $pdo->rollBack();
                
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create request: ' . $e->getMessage()]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
}

// Handle login endpoint
function handleLogin($method, $pdo) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing email or password']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }
        
        // Return user data without password
        unset($user['password']);
        echo json_encode($user);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
    }
}
?>
