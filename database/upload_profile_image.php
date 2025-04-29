<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Set maximum file size to 3MB (3 * 1024 * 1024 bytes)
ini_set('upload_max_filesize', '3M');
ini_set('post_max_size', '3M');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Check if the image file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No image file uploaded or upload error']);
    exit();
}

// Check if userId is provided
if (!isset($_POST['userId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'User ID is required']);
    exit();
}

$userId = $_POST['userId'];
$uploadedFile = $_FILES['image'];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$fileType = mime_content_type($uploadedFile['tmp_name']);

if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPEG, PNG, and GIF are allowed']);
    exit();
}

// Validate file size (max 3MB)
$maxFileSize = 3 * 1024 * 1024; // 3MB in bytes
if ($uploadedFile['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File size exceeds the maximum limit of 3MB']);
    exit();
}

// Create uploads directory if it doesn't exist
$uploadsDir = __DIR__ . '/../public/uploads/profiles';
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

// Generate a unique filename
$extension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION);
$filename = $userId . '_' . uniqid() . '.' . $extension;
$targetPath = $uploadsDir . '/' . $filename;

// Move the uploaded file to the target location
if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save the uploaded file']);
    exit();
}

// Generate the URL for the uploaded image
$imageUrl = '/uploads/profiles/' . $filename;

// Connect to the database to update the user's profile image
try {
    // Database connection
    $host = 'localhost';
    $dbname = 'itemtrack';
    $username = 'root';
    $password = '';

    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Update the user's profile image in the database
    $stmt = $pdo->prepare("UPDATE users SET profileImage = ? WHERE id = ?");
    $stmt->execute([$imageUrl, $userId]);

    // Return success response
    echo json_encode([
        'success' => true,
        'data' => [
            'imageUrl' => $imageUrl
        ]
    ]);
} catch (PDOException $e) {
    // If database update fails, still return the image URL
    // The API service will handle updating the user object
    echo json_encode([
        'success' => true,
        'data' => [
            'imageUrl' => $imageUrl
        ],
        'warning' => 'Database update failed: ' . $e->getMessage()
    ]);
}
