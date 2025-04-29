import React, { useState, useEffect } from "react";
import { Search, PlusCircle, Edit, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import * as api from "../../services/api";

export const UserList: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "requester",
    department: "",
  });

  // Check if current user is a manager
  const isManager = currentUser?.role === "manager";

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await api.fetchUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department &&
        user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAddModal = () => {
    // Only managers can add users
    if (!isManager) {
      alert("Only managers can add users");
      return;
    }

    setUserFormData({
      name: "",
      email: "",
      password: "",
      role: "requester",
      department: "",
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    // Only managers can edit users
    if (!isManager) {
      alert("Only managers can edit users");
      return;
    }

    setCurrentUserToEdit(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't show password
      role: user.role,
      department: user.department || "",
    });
    setShowEditModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserFormData({
      ...userFormData,
      [name]: value,
    });
  };

  const handleAddUser = async () => {
    // Only managers can add users
    if (!isManager) {
      alert("Only managers can add users");
      return;
    }

    // Validate form data
    if (!userFormData.name.trim()) {
      alert("Name is required");
      return;
    }

    if (!userFormData.email.trim()) {
      alert("Email is required");
      return;
    }

    if (!userFormData.password.trim()) {
      alert("Password is required");
      return;
    }

    try {
      console.log("UserList: Adding user with data:", userFormData);

      // Create new user
      const newUser = await api.addUser({
        name: userFormData.name,
        email: userFormData.email,
        password: userFormData.password,
        role: userFormData.role as "requester" | "admin" | "manager",
        department: userFormData.department || undefined,
      });

      console.log("UserList: User added successfully:", newUser);

      // Add the new user to the state
      setUsers((prev) => [...prev, newUser]);

      // Show success message
      alert("User added successfully!");

      // Close the modal
      setShowAddModal(false);

      // Reset form data
      setUserFormData({
        name: "",
        email: "",
        password: "",
        role: "requester",
        department: "",
      });
    } catch (error) {
      console.error("UserList: Error adding user:", error);

      // Show detailed error message
      alert(
        "Failed to add user: " +
          (error instanceof Error ? error.message : "Unknown error") +
          "\n\nPlease check the browser console for more details."
      );
    }
  };

  const handleUpdateUser = async () => {
    // Only managers can update users
    if (!isManager) {
      alert("Only managers can update users");
      return;
    }

    if (!currentUserToEdit || !userFormData.name.trim()) {
      return;
    }

    try {
      console.log("UserList: Updating user:", currentUserToEdit.id, userFormData);

      // Update user
      const updatedUser = await api.updateUser(currentUserToEdit.id, {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role as "requester" | "admin" | "manager",
        department: userFormData.department || undefined,
      });

      console.log("UserList: User updated successfully:", updatedUser);

      // Update the user in the state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === currentUserToEdit.id ? updatedUser : user
        )
      );

      // Show success message
      alert("User updated successfully!");

      // Close the modal
      setShowEditModal(false);
      setCurrentUserToEdit(null);
    } catch (error) {
      console.error("UserList: Error updating user:", error);

      // Show detailed error message
      alert(
        "Failed to update user: " +
          (error instanceof Error ? error.message : "Unknown error") +
          "\n\nPlease check the browser console for more details."
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Only managers can delete users
    if (!isManager) {
      alert("Only managers can delete users");
      return;
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      console.log("UserList: Deleting user:", userId);

      // Delete user
      await api.deleteUser(userId);

      console.log("UserList: User deleted successfully");

      // Remove the user from the state
      setUsers((prev) => prev.filter((user) => user.id !== userId));

      // Show success message
      alert("User deleted successfully!");
    } catch (error) {
      console.error("UserList: Error deleting user:", error);

      // Show detailed error message
      alert(
        "Failed to delete user: " +
          (error instanceof Error ? error.message : "Unknown error") +
          "\n\nPlease check the browser console for more details."
      );
    }
  };

  if (loading) {
    return (
      <Card title="User Management">
        <div className="text-center py-8">Loading users...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="User Management">
        <div className="text-center py-8 text-red-500">
          Error: {error}
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title="User Management">
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-3">
          <div className="relative md:flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="flex items-center"
            disabled={!isManager}
            title={!isManager ? "Only managers can add users" : "Add new user"}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add New User
          </Button>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "manager"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.department || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className={`text-blue-600 hover:text-blue-900 mr-4 ${
                          !isManager ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={!isManager}
                        title={
                          !isManager ? "Only managers can edit users" : "Edit user"
                        }
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={`text-red-600 hover:text-red-900 ${
                          !isManager ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={!isManager}
                        title={
                          !isManager
                            ? "Only managers can delete users"
                            : "Delete user"
                        }
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={userFormData.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={userFormData.email}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={userFormData.password}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={userFormData.role}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="requester">Requester</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              value={userFormData.department}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateUser}>
              Update User
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              value={userFormData.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              id="edit-email"
              name="email"
              type="email"
              value={userFormData.email}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role *
            </label>
            <select
              id="edit-role"
              name="role"
              value={userFormData.role}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="requester">Requester</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-department"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Department
            </label>
            <input
              id="edit-department"
              name="department"
              type="text"
              value={userFormData.department}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
