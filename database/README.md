# ItemTrack Database Setup

This directory contains the database setup files for the ItemTrack project.

## Database Structure

The database consists of the following tables:

1. **users** - Stores user information
   - id: Primary key
   - name: User's full name
   - email: User's email (unique)
   - password: Hashed password
   - role: User role (requester, admin, manager)
   - department: User's department

2. **items** - Stores inventory items
   - id: Primary key
   - name: Item name
   - description: Item description
   - total_stock: Total quantity in inventory
   - available_stock: Available quantity
   - reserved_stock: Reserved quantity
   - low_stock_threshold: Threshold for low stock warning
   - category: Item category

3. **requests** - Stores item requests
   - id: Primary key
   - project_name: Name of the project
   - requester_id: Foreign key to users table
   - reason: Reason for the request
   - priority: Priority level (low, medium, high)
   - due_date: Due date for the request
   - status: Request status (pending, approved, denied, fulfilled, out_of_stock)

4. **request_items** - Junction table for requests and items
   - id: Primary key
   - request_id: Foreign key to requests table
   - item_id: Foreign key to items table
   - quantity: Quantity requested

5. **pickup_details** - Stores pickup information for requests
   - id: Primary key
   - request_id: Foreign key to requests table
   - location: Pickup location
   - pickup_time: Scheduled pickup time
   - delivered: Whether the items have been delivered

## Setup Instructions

### Using phpMyAdmin (Recommended)

1. Start Laragon and ensure MySQL is running
2. Open phpMyAdmin by clicking the "phpMyAdmin" button in Laragon
3. Create a new database named "itemtrack"
4. Select the "itemtrack" database
5. Go to the "Import" tab
6. Click "Choose File" and select the `itemtrack_db.sql` file from this directory
7. Click "Go" to import the database structure and sample data

### Using MySQL Command Line

1. Start Laragon and ensure MySQL is running
2. Open the Terminal in Laragon
3. Run the following command:
   ```
   mysql -u root < path/to/itemtrack_db.sql
   ```

## Testing the Connection

To test the database connection:

1. Make sure Laragon's web server is running
2. Open a web browser and navigate to:
   ```
   http://localhost/project-bolt-sb1-qpn5qmbl (1)/project/database/test_connection.php
   ```
3. You should see the database connection status and sample data

## Default Users

The database comes with the following sample users:

1. **John Doe**
   - Email: john@example.com
   - Role: requester
   - Department: Engineering

2. **Jane Smith**
   - Email: jane@example.com
   - Role: admin
   - Department: Operations

3. **Bob Johnson**
   - Email: bob@example.com
   - Role: manager
   - Department: Engineering

All sample users have the password: `password`
