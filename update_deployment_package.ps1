# Update Deployment Package Script
# This script updates the deployment package to match the new API paths

# Set error action preference
$ErrorActionPreference = "Stop"

$deploymentDir = "deployment_package"

# Check if deployment directory exists
if (-not (Test-Path $deploymentDir)) {
    Write-Host "Deployment directory not found. Please run prepare_for_deployment.ps1 first."
    exit 1
}

# Copy API files from database directory to root directory
Write-Host "Copying API files from database directory to root directory..."
$apiFiles = @(
    "api.php",
    "simple_login.php",
    "simple_request_handler.php",
    "simple_add_item.php",
    "simple_user_management.php",
    "simple_category_handler.php"
)

foreach ($file in $apiFiles) {
    $sourcePath = "$deploymentDir\database\$file"
    $destPath = "$deploymentDir\$file"
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath
        Write-Host "Copied $file to root directory"
    } else {
        Write-Host "Warning: $file not found in database directory"
    }
}

# Create a README file explaining the file structure
$readmeContent = @"
# API Files Structure

The API files have been placed in both the root directory and the database directory to support different deployment configurations.

## Root Directory API Files
These files are used with the current .env.production configuration:
- api.php
- simple_login.php
- simple_request_handler.php
- simple_add_item.php
- simple_user_management.php
- simple_category_handler.php

## Database Directory API Files
These are kept as a backup and for alternative deployment configurations.

## Configuration
The application is configured to use the API files in the root directory. If you prefer to use the files in the database directory, update the .env.production file accordingly.
"@

$readmeContent | Out-File -FilePath "$deploymentDir\API_FILES_README.md"

Write-Host "Deployment package updated successfully!"
Write-Host "A README file explaining the file structure has been added to the deployment package."
