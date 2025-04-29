// API service for connecting to the PHP backend
import { User, Item, Request, RequestStatus, RequestItem } from "../types";
import { Category } from "../context/InventoryContext";
import { mockUsers, mockItems, mockRequests } from "../data/mockData";

// API base URLs
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}${import.meta.env.VITE_API_BASE_PATH}`;
const REGISTER_API_URL = `${API_URL}${import.meta.env.VITE_REGISTER_API_PATH}`;
const REQUEST_API_URL = `${API_URL}${import.meta.env.VITE_REQUEST_API_PATH}`;
const ITEM_API_URL = `${API_URL}${import.meta.env.VITE_ITEM_API_PATH}`;
const USER_API_URL = `${API_URL}${import.meta.env.VITE_USER_API_PATH}`;
const CATEGORY_API_URL = `${API_URL}${import.meta.env.VITE_CATEGORY_API_PATH}`;

// Log API URLs for debugging
console.log("API URLs:", {
  API_BASE_URL,
  REGISTER_API_URL,
  REQUEST_API_URL,
  ITEM_API_URL,
  USER_API_URL,
  CATEGORY_API_URL,
});

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Unknown API error");
  }

  return data.data as T;
}

// User-related API calls
export async function fetchUsers(): Promise<User[]> {
  try {
    console.log("API Service: Fetching users from user management API...");

    // Use the user management API endpoint
    const response = await fetch(USER_API_URL);
    console.log("API Service: Fetch users response status:", response.status);

    // Parse the response
    const data = await response.json();
    console.log("API Service: Fetch users response data:", data);

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
    // Fallback to mock data if API fails
    console.warn("Falling back to mock data");
    return mockUsers;
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    console.log("API Service: Logging in user:", email);

    // Make a POST request to the simple login API
    const response = await fetch("http://localhost/simple_login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("API Service: Login response status:", response.status);

    // Parse the response
    const data = await response.json();
    console.log("API Service: Login response data:", data);

    // Check if the login was successful
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Login failed");
    }

    // Return the user data
    return {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role as "requester" | "admin" | "manager",
      department: data.data.department,
    };
  } catch (error) {
    console.error("Login error:", error);

    // Fallback to mock login if API fails
    console.warn("API login failed, falling back to mock login:", error);

    // For demo purposes, always return the admin user
    return {
      id: "admin123",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      department: "IT",
    };
  }
}

export async function register(userData: {
  name: string;
  email: string;
  password: string;
  department?: string;
}): Promise<User> {
  try {
    // Make a POST request to the registration API
    const response = await fetch(REGISTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Parse the response
    const data = await response.json();

    // Check if the registration was successful
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Registration failed");
    }

    // Return the user data
    return {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role as "requester" | "admin" | "manager",
      department: data.data.department,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function addUser(userData: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "requester";
  department?: string;
}): Promise<User> {
  try {
    console.log("API Service: Adding user:", userData);

    const response = await fetch(USER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("API Service: Add user response status:", response.status);

    const data = await response.json();
    console.log("API Service: Add user response data:", data);

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

export async function updateUser(
  userId: string,
  userData: Partial<User>
): Promise<User> {
  try {
    console.log("API Service: Updating user:", userId, userData);

    // Handle profile image if it's a base64 string (check both profileImage and avatar fields)
    let profileImageUrl = userData.profileImage || userData.avatar;

    // If the profile image is a base64 string, upload it first
    if (profileImageUrl && profileImageUrl.startsWith("data:image")) {
      try {
        // Convert base64 to Blob
        const base64Response = await fetch(profileImageUrl);
        const blob = await base64Response.blob();

        // Create form data for the image upload
        const formData = new FormData();
        formData.append("image", blob, "profile.jpg");
        formData.append("userId", userId);

        // Use correct path for upload endpoint
        const uploadUrl = `${API_URL}/upload_profile_image.php`;
        console.log("Uploading to:", uploadUrl);

        const uploadResult = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          console.log("Opening XHR to:", uploadUrl);
          xhr.open("POST", uploadUrl, true);

          // Set a timeout for the request (10 seconds)
          xhr.timeout = 10000;

          // Log progress
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              console.log(`Upload progress: ${percentComplete}%`);
            }
          };

          xhr.onload = function () {
            console.log("Upload response status:", xhr.status);
            console.log("Upload response text:", xhr.responseText);

            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                console.log("Parsed response:", response);

                if (response.success) {
                  // Check both possible response formats
                  if (response.data.imageUrl) {
                    resolve(response.data.imageUrl);
                  } else if (response.data.avatar) {
                    resolve(response.data.avatar);
                  } else {
                    reject(new Error("No image URL in response"));
                  }
                } else {
                  reject(new Error(response.error || "Failed to upload image"));
                }
              } catch (e) {
                console.error("Error parsing response:", e);
                reject(new Error("Invalid response from server"));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.ontimeout = function () {
            console.error("Request timed out");
            reject(new Error("Request timed out"));
          };

          xhr.onerror = function (e) {
            console.error("XHR Error:", e);
            reject(new Error("Network error during upload"));
          };

          console.log("Sending form data...");
          xhr.send(formData);
          console.log("Form data sent");
        });

        // Update the profile image URL with the one returned from the server
        profileImageUrl = uploadResult;
      } catch (uploadError) {
        console.error("Error uploading profile image:", uploadError);

        // Keep using the base64 image if upload fails
        console.warn("Using base64 image as fallback");
        // We'll keep the original base64 string in profileImageUrl
      }
    }

    // Update the user data with the new profile image URL if available
    const updatedUserData = {
      ...userData,
    };

    // Handle profile image explicitly, including null values
    if ("profileImage" in userData || "avatar" in userData) {
      // If profileImageUrl is null, explicitly set both fields to undefined (which will be sent as null to the server)
      if (profileImageUrl === null) {
        console.log("Setting profile image to null/undefined");
        updatedUserData.profileImage = undefined;
        updatedUserData.avatar = undefined;
      } else if (profileImageUrl) {
        console.log("Setting profile image to:", profileImageUrl);
        updatedUserData.profileImage = profileImageUrl;
        updatedUserData.avatar = profileImageUrl; // Set both fields for compatibility
      }
    }

    const response = await fetch(`${USER_API_URL}?id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUserData),
    });

    console.log("API Service: Update user response status:", response.status);

    const data = await response.json();
    console.log("API Service: Update user response data:", data);

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to update user");
    }

    return {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role as "requester" | "admin" | "manager",
      department: data.data.department,
      profileImage: data.data.profileImage || data.data.avatar,
      avatar: data.data.avatar || data.data.profileImage,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log("API Service: Deleting user:", userId);

    const response = await fetch(`${USER_API_URL}?id=${userId}`, {
      method: "DELETE",
    });

    console.log("API Service: Delete user response status:", response.status);

    const data = await response.json();
    console.log("API Service: Delete user response data:", data);

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Item-related API calls
export async function fetchItems(): Promise<Item[]> {
  try {
    console.log("API Service: Fetching items from direct API...");

    // Use the direct API endpoint
    const response = await fetch(ITEM_API_URL);
    console.log("API Service: Fetch response status:", response.status);

    // Parse the response
    const data = await response.json();
    console.log("API Service: Fetch response data:", data);

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to fetch items");
    }

    // Return the items from the response
    return data.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    // Fallback to mock data if API fails
    console.warn("Falling back to mock data");
    return mockItems;
  }
}

export async function addItem(item: Omit<Item, "id">): Promise<Item> {
  try {
    // Prepare the item data
    const apiItemData = {
      name: item.name,
      description: item.description,
      totalStock: item.totalStock,
      availableStock: item.availableStock,
      reservedStock: item.reservedStock,
      lowStockThreshold: item.lowStockThreshold,
      category: item.category,
    };

    console.log("Adding item to database:", apiItemData);

    // Make a POST request to the item API
    const response = await fetch(ITEM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiItemData),
    });

    console.log("API response status:", response.status);

    // Parse the response
    const data = await response.json();
    console.log("API response data:", data);

    // Check if the request was successful
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to add item");
    }

    // Return the new item
    const newItem = {
      id: data.data.id,
      name: data.data.name,
      description: data.data.description,
      totalStock: data.data.totalStock,
      availableStock: data.data.availableStock,
      reservedStock: data.data.reservedStock,
      lowStockThreshold: data.data.lowStockThreshold,
      category: data.data.category,
    };

    console.log("New item created:", newItem);
    return newItem;
  } catch (error) {
    console.error("Error adding item:", error);

    // Fallback to mock data if API fails
    console.warn("API item addition failed, falling back to mock data:", error);

    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem: Item = {
          ...item,
          id: Math.random().toString(36).substring(2, 11),
        };

        console.log("Created mock item instead:", newItem);
        resolve(newItem);
      }, 500);
    });
  }
}

// Request-related API calls
export async function fetchRequests(): Promise<Request[]> {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=requests`);
    const data = await handleApiResponse<any[]>(response);

    // Map the API response to our Request type
    return data.map((req) => {
      // Map request items
      const items: RequestItem[] = req.items.map((item: any) => ({
        itemId: item.item_id,
        itemName: item.item_name,
        quantity: parseInt(item.quantity),
      }));

      // Create the request object
      const request: Request = {
        id: req.id,
        projectName: req.project_name,
        requester: {
          id: req.requester_id,
          name: req.requester_name,
          email: req.requester_email,
        },
        items: items,
        reason: req.reason,
        priority: req.priority as "low" | "medium" | "high",
        dueDate: req.due_date ? new Date(req.due_date) : undefined,
        status: req.status as RequestStatus,
        createdAt: new Date(req.created_at),
        updatedAt: new Date(req.updated_at),
      };

      // Add pickup details if available
      if (req.pickup_details) {
        request.pickupDetails = {
          location: req.pickup_details.location,
          time: req.pickup_details.pickup_time
            ? new Date(req.pickup_details.pickup_time)
            : undefined,
          delivered: req.pickup_details.delivered === "1",
        };
      }

      return request;
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    // Fallback to mock data if API fails
    console.warn("Falling back to mock data");
    return mockRequests;
  }
}

export async function submitRequest(requestData: {
  projectName: string;
  requesterId: string;
  items: { itemId: string; itemName: string; quantity: number }[];
  reason: string;
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
}): Promise<Request> {
  try {
    console.log("API Service: Submitting request:", requestData);

    // Validate request data
    if (!requestData.projectName) {
      throw new Error("Project name is required");
    }

    if (!requestData.requesterId) {
      throw new Error("Requester ID is required");
    }

    if (!requestData.items || requestData.items.length === 0) {
      throw new Error("At least one item is required");
    }

    if (!requestData.reason) {
      throw new Error("Reason is required");
    }

    // Prepare the request data
    const apiRequestData = {
      projectName: requestData.projectName,
      requesterId: requestData.requesterId,
      items: requestData.items.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
      })),
      reason: requestData.reason,
      priority: requestData.priority || "medium",
      dueDate: requestData.dueDate
        ? requestData.dueDate.toISOString().split("T")[0]
        : undefined,
    };

    console.log("API Service: Request data being sent:", apiRequestData);

    // Make a POST request to the simple request handler
    const response = await fetch(REQUEST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestData),
    });

    console.log(
      "API Service: Request submission response status:",
      response.status
    );

    // Parse the response
    const data = await response.json();
    console.log("API Service: Request submission response data:", data);

    // Check if the request was successful
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to submit request");
    }

    // Format the response data to match our Request type
    return {
      id: data.data.id,
      projectName: data.data.projectName,
      requester: {
        id: data.data.requester.id,
        name: data.data.requester.name,
        email: data.data.requester.email,
      },
      items: data.data.items,
      reason: data.data.reason,
      priority: data.data.priority as "low" | "medium" | "high",
      dueDate: data.data.dueDate ? new Date(data.data.dueDate) : undefined,
      status: data.data.status as RequestStatus,
      createdAt: new Date(data.data.createdAt),
      updatedAt: new Date(data.data.updatedAt),
    };
  } catch (error) {
    console.error("Error submitting request:", error);

    // Fallback to mock data if API fails
    console.warn(
      "API request submission failed, falling back to mock data:",
      error
    );

    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRequest: Request = {
          id: Math.random().toString(36).substring(2, 11),
          projectName: requestData.projectName,
          requester: {
            id: requestData.requesterId,
            name:
              mockUsers.find((u) => u.id === requestData.requesterId)?.name ||
              "Unknown User",
            email:
              mockUsers.find((u) => u.id === requestData.requesterId)?.email ||
              "unknown@example.com",
          },
          items: requestData.items,
          reason: requestData.reason,
          priority: requestData.priority || "medium",
          dueDate: requestData.dueDate,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        resolve(newRequest);
      }, 500);
    });
  }
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  pickupDetails?: {
    location: string;
    time?: Date;
    delivered: boolean;
  }
): Promise<Request> {
  try {
    console.log(
      "API Service: Updating request status:",
      requestId,
      status,
      pickupDetails
    );

    // Prepare the update data
    const updateData: any = { status };
    if (pickupDetails) {
      updateData.pickupDetails = pickupDetails;
    }

    console.log("API Service: Update data being sent:", updateData);

    // Make a PUT request to the direct update API
    const response = await fetch(
      `http://localhost/direct_update.php?id=${requestId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    console.log(
      "API Service: Update request status response status:",
      response.status
    );

    // Parse the response
    const data = await response.json();
    console.log("API Service: Update request status response data:", data);

    // Check if the request was successful
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to update request status");
    }

    // Format the response data to match our Request type
    const responseData = data.data;
    return {
      id: responseData.id,
      projectName: responseData.projectName,
      requester: responseData.requester,
      items: responseData.items,
      reason: responseData.reason,
      priority: responseData.priority as "low" | "medium" | "high",
      dueDate: responseData.dueDate
        ? new Date(responseData.dueDate)
        : undefined,
      status: responseData.status as RequestStatus,
      createdAt: new Date(responseData.createdAt),
      updatedAt: new Date(responseData.updatedAt),
      ...(responseData.pickupDetails && {
        pickupDetails: {
          location: responseData.pickupDetails.location,
          time: responseData.pickupDetails.pickupTime
            ? new Date(responseData.pickupDetails.pickupTime)
            : undefined,
          delivered: responseData.pickupDetails.delivered,
        },
      }),
    };
  } catch (error) {
    console.error("Error updating request status:", error);

    // Fallback to mock data if API fails
    console.warn("API update failed, falling back to mock data:", error);

    // Simulate API call with mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockRequests.find((r) => r.id === requestId);

        if (!request) {
          reject(new Error("Request not found"));
          return;
        }

        const updatedRequest: Request = {
          ...request,
          status,
          updatedAt: new Date(),
          ...(pickupDetails && { pickupDetails }),
        };

        resolve(updatedRequest);
      }, 500);
    });
  }
}

// Category-related API calls
export async function fetchCategories(): Promise<Category[]> {
  try {
    console.log("API Service: Fetching categories...");

    // Use the category API endpoint with mode: 'cors' to handle CORS issues
    const response = await fetch(CATEGORY_API_URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(
      "API Service: Fetch categories response status:",
      response.status
    );

    // Parse the response
    const data = await response.json();
    console.log("API Service: Fetch categories response data:", data);

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to fetch categories");
    }

    // Return the categories from the response
    return data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);

    // Fallback to mock data if API fails
    console.warn(
      "API category fetch failed, falling back to mock data:",
      error
    );

    // Return mock categories
    return [
      {
        id: "cat_electronics",
        name: "Electronics",
        description: "Electronic components and devices",
        color: "#3B82F6",
      },
      {
        id: "cat_tools",
        name: "Tools",
        description: "Hand tools and power tools",
        color: "#10B981",
      },
      {
        id: "cat_equipment",
        name: "Equipment",
        description: "Specialized equipment and machinery",
        color: "#8B5CF6",
      },
      {
        id: "cat_supplies",
        name: "Supplies",
        description: "General office and project supplies",
        color: "#F59E0B",
      },
    ];
  }
}

export async function addCategory(
  category: Omit<Category, "id">
): Promise<Category> {
  try {
    console.log("API Service: Adding category:", category);

    // Make a POST request to the category API
    const response = await fetch(CATEGORY_API_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });

    console.log("API Service: Add category response status:", response.status);

    // Parse the response
    const data = await response.json();
    console.log("API Service: Add category response data:", data);

    // Check if the request was successful
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to add category");
    }

    // Return the new category
    return data.data;
  } catch (error) {
    console.error("Error adding category:", error);

    // Fallback to mock data if API fails
    console.warn(
      "API category addition failed, falling back to mock data:",
      error
    );

    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCategory: Category = {
          ...category,
          id: Math.random().toString(36).substring(2, 11),
        };

        console.log("Created mock category instead:", newCategory);
        resolve(newCategory);
      }, 500);
    });
  }
}

export async function updateCategory(
  categoryId: string,
  categoryData: Partial<Omit<Category, "id">>
): Promise<Category> {
  try {
    console.log("API Service: Updating category:", categoryId, categoryData);

    // Make a PUT request to the category API
    const response = await fetch(`${CATEGORY_API_URL}?id=${categoryId}`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    console.log(
      "API Service: Update category response status:",
      response.status
    );

    // Parse the response
    const data = await response.json();
    console.log("API Service: Update category response data:", data);

    // Check if the request was successful
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to update category");
    }

    // Return the updated category
    return data.data;
  } catch (error) {
    console.error("Error updating category:", error);

    // Fallback to mock data if API fails
    console.warn(
      "API category update failed, falling back to mock data:",
      error
    );

    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedCategory: Category = {
          id: categoryId,
          name: categoryData.name || "Updated Category",
          description: categoryData.description || "",
          color: categoryData.color || "#3B82F6",
        };

        console.log("Updated mock category instead:", updatedCategory);
        resolve(updatedCategory);
      }, 500);
    });
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    console.log("API Service: Deleting category:", categoryId);

    // Make a DELETE request to the category API
    const response = await fetch(`${CATEGORY_API_URL}?id=${categoryId}`, {
      method: "DELETE",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(
      "API Service: Delete category response status:",
      response.status
    );

    // Parse the response
    const data = await response.json();
    console.log("API Service: Delete category response data:", data);

    // Check if the request was successful
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to delete category");
    }
  } catch (error) {
    console.error("Error deleting category:", error);

    // Fallback to mock data if API fails
    console.warn(
      "API category deletion failed, falling back to mock data:",
      error
    );

    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Deleted mock category:", categoryId);
        resolve();
      }, 500);
    });
  }
}
