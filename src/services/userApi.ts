import { User } from '../types';

// API URL
const USER_API_URL = "http://localhost/user_management_api.php";

// Fetch all users
export async function fetchUsers(): Promise<User[]> {
  try {
    console.log("UserAPI: Fetching users...");
    
    const response = await fetch(USER_API_URL);
    console.log("UserAPI: Fetch users response status:", response.status);
    
    const data = await response.json();
    console.log("UserAPI: Fetch users response data:", data);
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to fetch users");
    }
    
    // Map the API response to our User type
    return data.data.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "requester" | "admin" | "manager",
      department: user.department,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Add a new user
export async function addUser(userData: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "requester";
  department?: string;
}): Promise<User> {
  try {
    console.log("UserAPI: Adding user:", userData);
    
    const response = await fetch(USER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    
    console.log("UserAPI: Add user response status:", response.status);
    
    const data = await response.json();
    console.log("UserAPI: Add user response data:", data);
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to add user");
    }
    
    return {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role as "requester" | "admin" | "manager",
      department: data.data.department,
    };
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

// Update an existing user
export async function updateUser(
  userId: string,
  userData: Partial<User>
): Promise<User> {
  try {
    console.log("UserAPI: Updating user:", userId, userData);
    
    const response = await fetch(`${USER_API_URL}?id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    
    console.log("UserAPI: Update user response status:", response.status);
    
    const data = await response.json();
    console.log("UserAPI: Update user response data:", data);
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to update user");
    }
    
    return {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role as "requester" | "admin" | "manager",
      department: data.data.department,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete a user
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log("UserAPI: Deleting user:", userId);
    
    const response = await fetch(`${USER_API_URL}?id=${userId}`, {
      method: "DELETE",
    });
    
    console.log("UserAPI: Delete user response status:", response.status);
    
    const data = await response.json();
    console.log("UserAPI: Delete user response data:", data);
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
