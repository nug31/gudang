# Prepare for Deployment Script
# This script helps prepare the application for deployment to Hostinger VPS

# Set error action preference
$ErrorActionPreference = "Stop"

# Create deployment directory
$deploymentDir = "deployment_package"
if (Test-Path $deploymentDir) {
    Write-Host "Removing existing deployment directory..."
    Remove-Item -Path $deploymentDir -Recurse -Force
}

Write-Host "Creating deployment directory..."
New-Item -Path $deploymentDir -ItemType Directory | Out-Null

# Build the application
Write-Host "Building the application..."
npm run build

# Copy dist files to deployment directory
Write-Host "Copying dist files to deployment directory..."
Copy-Item -Path "dist\*" -Destination $deploymentDir -Recurse

# Copy database directory to deployment directory
Write-Host "Copying database directory to deployment directory..."
Copy-Item -Path "database" -Destination "$deploymentDir\database" -Recurse

# Copy .htaccess file from manual_deploy
Write-Host "Copying .htaccess file..."
Copy-Item -Path "manual_deploy\.htaccess" -Destination $deploymentDir

# Copy hostinger_db_config.php
Write-Host "Copying hostinger_db_config.php..."
Copy-Item -Path "manual_deploy\database\hostinger_db_config.php" -Destination "$deploymentDir\database"

# Copy simple_setup.php and simple_test.php
Write-Host "Copying setup and test files..."
Copy-Item -Path "manual_deploy\database\simple_setup.php" -Destination "$deploymentDir\database"
Copy-Item -Path "manual_deploy\database\simple_test.php" -Destination "$deploymentDir\database"

# Create a README file in the deployment package
$readmeContent = @"
# Deployment Package

This package contains all the files needed to deploy the application to Hostinger VPS with CloudPanel.

## Contents

- React application build files
- Database scripts
- Configuration files

## Deployment Instructions

Please refer to the DEPLOY_TO_HOSTINGER_VPS.md file for detailed deployment instructions.
"@

$readmeContent | Out-File -FilePath "$deploymentDir\README.md"

# Copy deployment guide
Write-Host "Copying deployment guide..."
Copy-Item -Path "DEPLOY_TO_HOSTINGER_VPS.md" -Destination $deploymentDir

Write-Host "Deployment package created successfully at: $deploymentDir"
Write-Host "You can now upload the contents of this directory to your Hostinger VPS."
