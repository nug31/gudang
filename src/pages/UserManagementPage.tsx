import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { UserList } from "../components/admin/UserList";

export const UserManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if user is authorized (manager only)
  useEffect(() => {
    if (!currentUser || currentUser.role !== "manager") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== "manager") {
    return (
      <MainLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Access Denied</p>
          <p>Only managers can access the user management page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
      <UserList />
    </MainLayout>
  );
};

export default UserManagementPage;
