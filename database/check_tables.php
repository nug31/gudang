<?php
// Include database configuration
require_once 'db_config.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Function to check if a table exists
function tableExists($pdo, $table) {
    try {
        $result = $pdo->query("SELECT 1 FROM $table LIMIT 1");
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// Function to get table structure
function getTableStructure($pdo, $table) {
    $stmt = $pdo->prepare("DESCRIBE $table");
    $stmt->execute();
    return $stmt->fetchAll();
}

// Function to get table data
function getTableData($pdo, $table, $limit = 10) {
    $stmt = $pdo->prepare("SELECT * FROM $table LIMIT $limit");
    $stmt->execute();
    return $stmt->fetchAll();
}

// Check tables
$tables = ['users', 'items', 'requests', 'request_items', 'pickup_details'];
$results = [];

foreach ($tables as $table) {
    $exists = tableExists($pdo, $table);
    $results[$table] = [
        'exists' => $exists,
        'structure' => $exists ? getTableStructure($pdo, $table) : null,
        'data' => $exists ? getTableData($pdo, $table) : null
    ];
}

// Display results
echo "<html><head><title>Database Tables Check</title>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .success { color: green; }
    .error { color: red; }
</style>";
echo "</head><body>";
echo "<h1>Database Tables Check</h1>";

foreach ($results as $table => $result) {
    echo "<h2>Table: $table</h2>";
    
    if ($result['exists']) {
        echo "<p class='success'>Table exists</p>";
        
        echo "<h3>Structure</h3>";
        echo "<table><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        foreach ($result['structure'] as $column) {
            echo "<tr>";
            foreach ($column as $key => $value) {
                echo "<td>" . ($value === null ? 'NULL' : htmlspecialchars($value)) . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
        
        echo "<h3>Data (up to 10 rows)</h3>";
        if (count($result['data']) > 0) {
            echo "<table><tr>";
            foreach (array_keys($result['data'][0]) as $key) {
                echo "<th>" . htmlspecialchars($key) . "</th>";
            }
            echo "</tr>";
            
            foreach ($result['data'] as $row) {
                echo "<tr>";
                foreach ($row as $value) {
                    echo "<td>" . ($value === null ? 'NULL' : htmlspecialchars($value)) . "</td>";
                }
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p>No data found</p>";
        }
    } else {
        echo "<p class='error'>Table does not exist</p>";
    }
}

echo "</body></html>";
?>
