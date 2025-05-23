# ItemTrack - Project Item Request System

ItemTrack is an inventory management and item request system built with React, TypeScript, and MySQL.

## Features

- User authentication with role-based access control
- Inventory management
- Item request submission and approval workflow
- Dashboard with statistics and charts
- Export data to Excel and PDF

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v5.7 or higher)
- PHP (v7.4 or higher)
- Laragon or similar local development environment

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

1. Start Laragon and ensure MySQL is running
2. Open phpMyAdmin by clicking the "phpMyAdmin" button in Laragon
3. Create a new database named "itemtrack"
4. Select the "itemtrack" database
5. Go to the "Import" tab
6. Click "Choose File" and select the `database/itemtrack_db.sql` file
7. Click "Go" to import the database structure and sample data

Alternatively, you can use the setup script:

1. Copy the `setup_db.php` file to your Laragon www directory
2. Open a web browser and navigate to `http://localhost/setup_db.php`
3. Follow the instructions on the page to set up the database

### 4. Set up the API

1. Copy the following files to your Laragon www directory:
   - `api_test.php`
   - `auth_api.php`
   - `error_test.php`
   - `test_db.php`
   - `integration_test.html`

2. Test the API by opening `http://localhost/integration_test.html` in your browser

### 5. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

### Default Users

The database comes with these sample users:

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

### User Roles

- **Requester**: Can submit item requests and view their request history
- **Manager**: Can approve/deny requests and view inventory
- **Admin**: Has full access to all features, including inventory management

## Project Structure

- `src/`: Source code
  - `components/`: React components
  - `context/`: React context providers
  - `data/`: Mock data
  - `pages/`: Page components
  - `services/`: API services
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions
- `database/`: Database setup files
- `public/`: Static assets

## Testing

To test the application, open `http://localhost/integration_test.html` in your browser and click the "Run All Tests" button.

## Deployment

Before deploying to production, make sure to:

1. Set up a proper authentication system with JWT tokens
2. Implement HTTPS for all API calls
3. Add CSRF protection
4. Implement rate limiting to prevent abuse
5. Set up proper error logging
6. Optimize database queries with indexes

## License

[MIT](LICENSE)
#   g u d g  
 #   g u d a n g  
 # gudang
