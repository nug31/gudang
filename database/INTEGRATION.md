# Integrating the MySQL Database with the React Application

This guide explains how to integrate the MySQL database with your React application.

## Overview

The current React application uses mock data from `src/data/mockData.ts`. To use the MySQL database instead, you'll need to:

1. Set up the database (as described in README.md)
2. Use the PHP API to fetch data from the database
3. Update the React contexts to use the API instead of mock data

## Step 1: Set Up API Communication

First, create a service to handle API communication:

```typescript
// src/services/api.ts

const API_BASE_URL = 'http://localhost/project-bolt-sb1-qpn5qmbl (1)/project/database/api.php';

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}?endpoint=users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function fetchItems() {
  const response = await fetch(`${API_BASE_URL}?endpoint=items`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
}

export async function fetchRequests() {
  const response = await fetch(`${API_BASE_URL}?endpoint=requests`);
  if (!response.ok) {
    throw new Error('Failed to fetch requests');
  }
  return response.json();
}

export async function fetchRequest(id: string) {
  const response = await fetch(`${API_BASE_URL}?endpoint=requests&id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch request');
  }
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}?endpoint=login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  return response.json();
}

export async function register(userData: {
  name: string;
  email: string;
  password: string;
  department?: string;
}) {
  const response = await fetch(`${API_BASE_URL}?endpoint=users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  
  return response.json();
}

export async function createRequest(requestData: {
  projectName: string;
  requesterId: string;
  items: { itemId: string; quantity: number }[];
  reason: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}) {
  const response = await fetch(`${API_BASE_URL}?endpoint=requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create request');
  }
  
  return response.json();
}

export async function createItem(itemData: {
  name: string;
  description?: string;
  totalStock?: number;
  availableStock?: number;
  reservedStock?: number;
  lowStockThreshold?: number;
  category: string;
}) {
  const response = await fetch(`${API_BASE_URL}?endpoint=items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create item');
  }
  
  return response.json();
}
```

## Step 2: Update the Auth Context

Update the AuthContext to use the API:

```typescript
// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { login as apiLogin, register as apiRegister } from '../services/api';

// ... existing code ...

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... existing state ...

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API instead of using mock data
      const user = await apiLogin(email, password);
      
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; department?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API instead of using mock data
      const newUser = await apiRegister(data);
      
      // Auto-login after registration
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the code ...
};
```

## Step 3: Update the Inventory Context

Update the InventoryContext to use the API:

```typescript
// src/context/InventoryContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Item } from '../types';
import { fetchItems, createItem } from '../services/api';

// ... existing code ...

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... existing state ...

  useEffect(() => {
    // Fetch items from the API
    const getItems = async () => {
      try {
        setLoading(true);
        const data = await fetchItems();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };
    
    getItems();
  }, []);

  // ... update other methods to use the API ...

  const addItem = async (item: Omit<Item, 'id'>) => {
    try {
      const newItem = await createItem(item);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  };

  // ... rest of the code ...
};
```

## Step 4: Update the Request Context

Update the RequestContext to use the API:

```typescript
// src/context/RequestContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Request, RequestStatus } from '../types';
import { fetchRequests, createRequest, fetchRequest } from '../services/api';
import { useAuth } from './AuthContext';

// ... existing code ...

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... existing state ...
  const { currentUser } = useAuth();

  useEffect(() => {
    // Fetch requests from the API
    const getRequests = async () => {
      try {
        setLoading(true);
        const data = await fetchRequests();
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };
    
    getRequests();
  }, []);

  // ... update other methods to use the API ...

  const submitRequest = async (newRequest: Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const requestData = {
        projectName: newRequest.projectName,
        requesterId: currentUser.id,
        items: newRequest.items,
        reason: newRequest.reason,
        priority: newRequest.priority,
        dueDate: newRequest.dueDate ? newRequest.dueDate.toISOString().split('T')[0] : undefined
      };
      
      const result = await createRequest(requestData);
      
      // Fetch the newly created request to get the full data
      const createdRequest = await fetchRequest(result.id);
      
      setRequests(prev => [...prev, createdRequest]);
      return createdRequest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
      throw err;
    }
  };

  // ... rest of the code ...
};
```

## Step 5: Testing the Integration

1. Make sure Laragon is running with MySQL and Apache
2. Import the database schema using phpMyAdmin
3. Start your React application with `npm run dev`
4. Test the login functionality with one of the sample users:
   - Email: john@example.com
   - Password: password

## Troubleshooting

### CORS Issues

If you encounter CORS issues, make sure the API is properly configured to allow cross-origin requests. The `api.php` file already includes CORS headers, but you may need to adjust them based on your development environment.

### Database Connection Issues

If you have issues connecting to the database:

1. Check that MySQL is running in Laragon
2. Verify the database credentials in `db_config.php`
3. Make sure the database and tables exist
4. Check the Apache error logs for PHP errors

### API Endpoint Issues

If the API endpoints are not working:

1. Test them directly using the test page at `http://localhost/project-bolt-sb1-qpn5qmbl (1)/project/database/index.html`
2. Check the network tab in your browser's developer tools to see the API responses
3. Verify that the API base URL in `api.ts` matches your local setup
