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
    $logFile = __DIR__ . '/request_api_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

logToFile("Request API called with method: " . $_SERVER['REQUEST_METHOD']);

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
    case 'PUT':
        handlePutRequest($pdo);
        break;
    case 'DELETE':
        handleDeleteRequest($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

// Handle GET requests
function handleGetRequest($pdo) {
    // Get a specific request or all requests
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
                echo json_encode(['success' => false, 'error' => 'Request not found']);
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
                        'quantity' => (int)$item['quantity']
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
                    'pickupTime' => $pickupDetails['pickup_time'],
                    'delivered' => (bool)$pickupDetails['delivered']
                ];
            }

            echo json_encode(['success' => true, 'data' => $response]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to get request: ' . $e->getMessage()]);
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
                            'quantity' => (int)$item['quantity']
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
                        'pickupTime' => $pickupDetails['pickup_time'],
                        'delivered' => (bool)$pickupDetails['delivered']
                    ];
                }

                $formattedRequests[] = $formattedRequest;
            }

            echo json_encode(['success' => true, 'data' => $formattedRequests]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to get requests: ' . $e->getMessage()]);
        }
    }
}

// Handle POST requests
function handlePostRequest($pdo) {
    logToFile("Handling POST request");

    // Create a new request
    $rawData = file_get_contents('php://input');
    logToFile("Raw request data: " . $rawData);

    $data = json_decode($rawData, true);
    logToFile("Decoded request data: " . print_r($data, true));

    if (!isset($data['projectName']) || !isset($data['requesterId']) || !isset($data['items']) || !isset($data['reason'])) {
        logToFile("Missing required fields: " . print_r($data, true));
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        return;
    }

    try {
        // Start a transaction
        logToFile("Starting transaction");
        $pdo->beginTransaction();

        // Generate a unique ID
        $id = uniqid();
        logToFile("Generated request ID: " . $id);

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

        logToFile("Inserting request: ID=$id, Project={$data['projectName']}, Requester={$data['requesterId']}, Priority=$priority");

        $stmt->execute([
            $id,
            $data['projectName'],
            $data['requesterId'],
            $data['reason'],
            $priority,
            $dueDate,
            $status
        ]);

        logToFile("Request inserted successfully");

        // Insert the request items
        logToFile("Request items count: " . count($data['items']));

        foreach ($data['items'] as $index => $item) {
            logToFile("Processing item $index: " . print_r($item, true));

            if (!isset($item['itemId']) || !isset($item['quantity'])) {
                logToFile("Invalid item data: " . print_r($item, true));
                throw new Exception('Invalid item data');
            }

            // Check if the item exists
            $checkStmt = $pdo->prepare("SELECT id, name FROM items WHERE id = ?");
            $checkStmt->execute([$item['itemId']]);
            $itemExists = $checkStmt->fetch();

            if (!$itemExists) {
                logToFile("Item not found: {$item['itemId']}");
                throw new Exception("Item not found: {$item['itemId']}");
            }

            logToFile("Item exists: " . print_r($itemExists, true));

            // Insert the request item
            $insertStmt = $pdo->prepare("
                INSERT INTO request_items (request_id, item_id, quantity)
                VALUES (?, ?, ?)
            ");

            logToFile("Inserting request item: RequestID=$id, ItemID={$item['itemId']}, Quantity={$item['quantity']}");

            $insertStmt->execute([
                $id,
                $item['itemId'],
                $item['quantity']
            ]);

            logToFile("Request item inserted successfully");

            // Get the item name for the response
            $itemName = $itemExists['name'];

            // Add the item name to the item data
            $item['itemName'] = $itemName;
            $data['items'][$index] = $item;
        }

        // Get the requester information
        $stmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ?");
        $stmt->execute([$data['requesterId']]);
        $requester = $stmt->fetch();

        if (!$requester) {
            logToFile("Requester not found: {$data['requesterId']}");
            throw new Exception("Requester not found: {$data['requesterId']}");
        }

        logToFile("Requester information: " . print_r($requester, true));

        // Commit the transaction
        logToFile("Committing transaction");
        $pdo->commit();
        logToFile("Transaction committed successfully");

        // Format the response data
        $responseData = [
            'id' => $id,
            'projectName' => $data['projectName'],
            'requester' => [
                'id' => $data['requesterId'],
                'name' => $requester['name'],
                'email' => $requester['email']
            ],
            'items' => array_map(function($item) {
                return [
                    'itemId' => $item['itemId'],
                    'itemName' => isset($item['itemName']) ? $item['itemName'] : 'Unknown Item',
                    'quantity' => (int)$item['quantity']
                ];
            }, $data['items']),
            'reason' => $data['reason'],
            'priority' => $priority,
            'dueDate' => $dueDate,
            'status' => $status,
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ];

        logToFile("Response data: " . print_r($responseData, true));

        // Return success response
        $response = [
            'success' => true,
            'data' => $responseData,
            'message' => 'Request created successfully'
        ];

        logToFile("Sending response: " . json_encode($response));
        echo json_encode($response);

    } catch (Exception $e) {
        // Rollback the transaction on error
        logToFile("Error occurred: " . $e->getMessage() . "\n" . $e->getTraceAsString());
        $pdo->rollBack();

        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create request: ' . $e->getMessage()]);
    }
}

// Handle PUT requests
function handlePutRequest($pdo) {
    // Update a request status or pickup details
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Request ID is required']);
        return;
    }

    $requestId = $_GET['id'];
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        // Start a transaction
        $pdo->beginTransaction();

        // Check if the request exists
        $stmt = $pdo->prepare("SELECT * FROM requests WHERE id = ?");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch();

        if (!$request) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Request not found']);
            return;
        }

        // Update request status if provided
        if (isset($data['status'])) {
            $stmt = $pdo->prepare("UPDATE requests SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$data['status'], $requestId]);
        }

        // Update pickup details if provided
        if (isset($data['pickupDetails'])) {
            $pickupDetails = $data['pickupDetails'];

            // Check if pickup details already exist
            $stmt = $pdo->prepare("SELECT * FROM pickup_details WHERE request_id = ?");
            $stmt->execute([$requestId]);
            $existingPickupDetails = $stmt->fetch();

            if ($existingPickupDetails) {
                // Update existing pickup details
                $stmt = $pdo->prepare("
                    UPDATE pickup_details
                    SET location = ?, pickup_time = ?, delivered = ?, updated_at = NOW()
                    WHERE request_id = ?
                ");
                $stmt->execute([
                    $pickupDetails['location'],
                    isset($pickupDetails['time']) ? $pickupDetails['time'] : null,
                    isset($pickupDetails['delivered']) ? $pickupDetails['delivered'] : false,
                    $requestId
                ]);
            } else {
                // Insert new pickup details
                $stmt = $pdo->prepare("
                    INSERT INTO pickup_details (request_id, location, pickup_time, delivered)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $requestId,
                    $pickupDetails['location'],
                    isset($pickupDetails['time']) ? $pickupDetails['time'] : null,
                    isset($pickupDetails['delivered']) ? $pickupDetails['delivered'] : false
                ]);
            }
        }

        // Commit the transaction
        $pdo->commit();

        // Get the updated request
        $stmt = $pdo->prepare("
            SELECT r.*, u.name as requester_name, u.email as requester_email
            FROM requests r
            JOIN users u ON r.requester_id = u.id
            WHERE r.id = ?
        ");
        $stmt->execute([$requestId]);
        $updatedRequest = $stmt->fetch();

        // Get the request items
        $stmt = $pdo->prepare("
            SELECT ri.*, i.name as item_name
            FROM request_items ri
            JOIN items i ON ri.item_id = i.id
            WHERE ri.request_id = ?
        ");
        $stmt->execute([$requestId]);
        $items = $stmt->fetchAll();

        // Get pickup details if any
        $stmt = $pdo->prepare("
            SELECT * FROM pickup_details
            WHERE request_id = ?
        ");
        $stmt->execute([$requestId]);
        $pickupDetails = $stmt->fetch();

        // Format the response
        $response = [
            'id' => $updatedRequest['id'],
            'projectName' => $updatedRequest['project_name'],
            'requester' => [
                'id' => $updatedRequest['requester_id'],
                'name' => $updatedRequest['requester_name'],
                'email' => $updatedRequest['requester_email']
            ],
            'items' => array_map(function($item) {
                return [
                    'itemId' => $item['item_id'],
                    'itemName' => $item['item_name'],
                    'quantity' => (int)$item['quantity']
                ];
            }, $items),
            'reason' => $updatedRequest['reason'],
            'priority' => $updatedRequest['priority'],
            'dueDate' => $updatedRequest['due_date'],
            'status' => $updatedRequest['status'],
            'createdAt' => $updatedRequest['created_at'],
            'updatedAt' => $updatedRequest['updated_at']
        ];

        // Add pickup details if available
        if ($pickupDetails) {
            $response['pickupDetails'] = [
                'location' => $pickupDetails['location'],
                'pickupTime' => $pickupDetails['pickup_time'],
                'delivered' => (bool)$pickupDetails['delivered']
            ];
        }

        echo json_encode(['success' => true, 'data' => $response]);

    } catch (Exception $e) {
        // Rollback the transaction on error
        $pdo->rollBack();

        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update request: ' . $e->getMessage()]);
    }
}

// Handle DELETE requests
function handleDeleteRequest($pdo) {
    // Delete a request
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Request ID is required']);
        return;
    }

    $requestId = $_GET['id'];

    try {
        // Start a transaction
        $pdo->beginTransaction();

        // Check if the request exists
        $stmt = $pdo->prepare("SELECT * FROM requests WHERE id = ?");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch();

        if (!$request) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Request not found']);
            return;
        }

        // Delete pickup details if any
        $stmt = $pdo->prepare("DELETE FROM pickup_details WHERE request_id = ?");
        $stmt->execute([$requestId]);

        // Delete request items
        $stmt = $pdo->prepare("DELETE FROM request_items WHERE request_id = ?");
        $stmt->execute([$requestId]);

        // Delete the request
        $stmt = $pdo->prepare("DELETE FROM requests WHERE id = ?");
        $stmt->execute([$requestId]);

        // Commit the transaction
        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Request deleted successfully']);

    } catch (Exception $e) {
        // Rollback the transaction on error
        $pdo->rollBack();

        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete request: ' . $e->getMessage()]);
    }
}
?>
