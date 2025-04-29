<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database configuration - hardcoded for simplicity
$db_host = 'localhost';
$db_name = 'itemtrack';
$db_user = 'root';
$db_pass = '';

// Check if this is a direct query request
$query = isset($_GET['query']) ? $_GET['query'] : null;

if ($query) {
    // Set content type to JSON for API-like responses
    header('Content-Type: application/json');

    try {
        // Connect to the database
        $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

        if ($mysqli->connect_error) {
            throw new Exception("Connection failed: " . $mysqli->connect_error);
        }

        // Handle different query types
        switch ($query) {
            case 'users':
                $result = $mysqli->query("SELECT id, name, email, role, department FROM users LIMIT 10");
                $users = [];

                while ($row = $result->fetch_assoc()) {
                    $users[] = $row;
                }

                echo json_encode(['success' => true, 'data' => $users]);
                break;

            case 'items':
                $result = $mysqli->query("SELECT id, name, category, quantity, description FROM items LIMIT 10");
                $items = [];

                while ($row = $result->fetch_assoc()) {
                    $items[] = $row;
                }

                echo json_encode(['success' => true, 'data' => $items]);
                break;

            case 'requests':
                $result = $mysqli->query("SELECT id, project_name, requester_id, reason, priority, due_date, status FROM requests LIMIT 10");
                $requests = [];

                while ($row = $result->fetch_assoc()) {
                    $requests[] = $row;
                }

                echo json_encode(['success' => true, 'data' => $requests]);
                break;

            default:
                echo json_encode(['success' => false, 'error' => 'Invalid query type']);
        }

        // Close the database connection
        $mysqli->close();

        // Exit to prevent the HTML output
        exit;
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// HTML output for browser viewing
echo "<html><head><title>Database Check</title>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .success { color: green; }
    .error { color: red; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    .card { background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
</style>";
echo "</head><body>";
echo "<h1>Database Check</h1>";

try {
    // Create a database connection
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }

    echo "<p class='success'>Connected successfully to the database: $db_name@$db_host</p>";

    // Check if the requests table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'requests'");
    $requestsTableExists = $result->num_rows > 0;

    echo "<p>Requests table exists: " . ($requestsTableExists ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . "</p>";

    if ($requestsTableExists) {
        // Check the structure of the requests table
        $result = $mysqli->query("DESCRIBE requests");

        echo "<div class='card'>";
        echo "<h2>Requests Table Structure</h2>";
        echo "<table>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";

        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            foreach ($row as $key => $value) {
                echo "<td>" . ($value === null ? 'NULL' : htmlspecialchars($value)) . "</td>";
            }
            echo "</tr>";
        }

        echo "</table>";
        echo "</div>";

        // Check if there are any requests in the table
        $result = $mysqli->query("SELECT COUNT(*) as count FROM requests");
        $row = $result->fetch_assoc();
        $requestCount = $row['count'];

        echo "<p>Number of requests in the table: $requestCount</p>";

        if ($requestCount > 0) {
            // Get the latest requests
            $result = $mysqli->query("
                SELECT r.*, u.name as requester_name, u.email as requester_email
                FROM requests r
                JOIN users u ON r.requester_id = u.id
                ORDER BY r.created_at DESC
                LIMIT 5
            ");

            echo "<div class='card'>";
            echo "<h2>Latest Requests</h2>";
            echo "<table>";
            echo "<tr><th>ID</th><th>Project Name</th><th>Requester</th><th>Reason</th><th>Status</th><th>Created At</th></tr>";

            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($row['id']) . "</td>";
                echo "<td>" . htmlspecialchars($row['project_name']) . "</td>";
                echo "<td>" . htmlspecialchars($row['requester_name']) . " (" . htmlspecialchars($row['requester_email']) . ")</td>";
                echo "<td>" . htmlspecialchars($row['reason']) . "</td>";
                echo "<td>" . htmlspecialchars($row['status']) . "</td>";
                echo "<td>" . htmlspecialchars($row['created_at']) . "</td>";
                echo "</tr>";
            }

            echo "</table>";
            echo "</div>";

            // Get the latest request
            $result = $mysqli->query("
                SELECT r.*, u.name as requester_name, u.email as requester_email
                FROM requests r
                JOIN users u ON r.requester_id = u.id
                ORDER BY r.created_at DESC
                LIMIT 1
            ");

            $latestRequest = $result->fetch_assoc();

            echo "<div class='card'>";
            echo "<h2>Latest Request Details</h2>";
            echo "<pre>" . print_r($latestRequest, true) . "</pre>";

            // Get the request items
            $stmt = $mysqli->prepare("
                SELECT ri.*, i.name as item_name
                FROM request_items ri
                JOIN items i ON ri.item_id = i.id
                WHERE ri.request_id = ?
            ");

            $stmt->bind_param("s", $latestRequest['id']);
            $stmt->execute();
            $result = $stmt->get_result();

            $requestItems = [];
            while ($row = $result->fetch_assoc()) {
                $requestItems[] = $row;
            }

            echo "<h3>Request Items</h3>";
            echo "<pre>" . print_r($requestItems, true) . "</pre>";
            echo "</div>";
        }
    }

    // Check if the request_items table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'request_items'");
    $requestItemsTableExists = $result->num_rows > 0;

    echo "<p>Request items table exists: " . ($requestItemsTableExists ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . "</p>";

    if ($requestItemsTableExists) {
        // Check the structure of the request_items table
        $result = $mysqli->query("DESCRIBE request_items");

        echo "<div class='card'>";
        echo "<h2>Request Items Table Structure</h2>";
        echo "<table>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";

        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            foreach ($row as $key => $value) {
                echo "<td>" . ($value === null ? 'NULL' : htmlspecialchars($value)) . "</td>";
            }
            echo "</tr>";
        }

        echo "</table>";
        echo "</div>";

        // Check if there are any request items in the table
        $result = $mysqli->query("SELECT COUNT(*) as count FROM request_items");
        $row = $result->fetch_assoc();
        $requestItemCount = $row['count'];

        echo "<p>Number of request items in the table: $requestItemCount</p>";

        if ($requestItemCount > 0) {
            // Get the latest request items
            $result = $mysqli->query("
                SELECT ri.*, i.name as item_name, r.project_name
                FROM request_items ri
                JOIN items i ON ri.item_id = i.id
                JOIN requests r ON ri.request_id = r.id
                ORDER BY ri.created_at DESC
                LIMIT 10
            ");

            echo "<div class='card'>";
            echo "<h2>Latest Request Items</h2>";
            echo "<table>";
            echo "<tr><th>ID</th><th>Request ID</th><th>Project</th><th>Item</th><th>Quantity</th><th>Created At</th></tr>";

            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($row['id']) . "</td>";
                echo "<td>" . htmlspecialchars($row['request_id']) . "</td>";
                echo "<td>" . htmlspecialchars($row['project_name']) . "</td>";
                echo "<td>" . htmlspecialchars($row['item_name']) . "</td>";
                echo "<td>" . htmlspecialchars($row['quantity']) . "</td>";
                echo "<td>" . htmlspecialchars($row['created_at']) . "</td>";
                echo "</tr>";
            }

            echo "</table>";
            echo "</div>";
        }
    }

    // Check if the users table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'users'");
    $usersTableExists = $result->num_rows > 0;

    echo "<p>Users table exists: " . ($usersTableExists ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . "</p>";

    if ($usersTableExists) {
        // Check if there are any users in the table
        $result = $mysqli->query("SELECT COUNT(*) as count FROM users");
        $row = $result->fetch_assoc();
        $userCount = $row['count'];

        echo "<p>Number of users in the table: $userCount</p>";

        if ($userCount > 0) {
            // Get the users
            $result = $mysqli->query("SELECT * FROM users LIMIT 5");

            echo "<div class='card'>";
            echo "<h2>Users</h2>";
            echo "<table>";
            echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th></tr>";

            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($row['id']) . "</td>";
                echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                echo "<td>" . htmlspecialchars($row['email']) . "</td>";
                echo "<td>" . htmlspecialchars($row['role']) . "</td>";
                echo "<td>" . htmlspecialchars($row['department'] ?? '') . "</td>";
                echo "</tr>";
            }

            echo "</table>";
            echo "</div>";
        }
    }

    // Check if the items table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'items'");
    $itemsTableExists = $result->num_rows > 0;

    echo "<p>Items table exists: " . ($itemsTableExists ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . "</p>";

    if ($itemsTableExists) {
        // Check if there are any items in the table
        $result = $mysqli->query("SELECT COUNT(*) as count FROM items");
        $row = $result->fetch_assoc();
        $itemCount = $row['count'];

        echo "<p>Number of items in the table: $itemCount</p>";

        if ($itemCount > 0) {
            // Get the items
            $result = $mysqli->query("SELECT * FROM items LIMIT 5");

            echo "<div class='card'>";
            echo "<h2>Items</h2>";
            echo "<table>";
            echo "<tr><th>ID</th><th>Name</th><th>Category</th><th>Quantity</th><th>Description</th></tr>";

            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($row['id']) . "</td>";
                echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                echo "<td>" . htmlspecialchars($row['category']) . "</td>";
                echo "<td>" . htmlspecialchars($row['quantity']) . "</td>";
                echo "<td>" . htmlspecialchars($row['description'] ?? '') . "</td>";
                echo "</tr>";
            }

            echo "</table>";
            echo "</div>";
        }
    }

    // Close the database connection
    $mysqli->close();

} catch (Exception $e) {
    echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
}

echo "</body></html>";
?>
