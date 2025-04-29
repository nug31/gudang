import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RequestProvider } from "./context/RequestContext";
import { InventoryProvider } from "./context/InventoryContext";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RequestFormPage } from "./pages/RequestFormPage";
import { RequestHistoryPage } from "./pages/RequestHistoryPage";
import { RequestDetailPage } from "./pages/RequestDetailPage";
import { InventoryPage } from "./pages/InventoryPage";
import UserManagementPage from "./pages/UserManagementPage";
import SettingsPage from "./pages/SettingsPage";
import BrowseItemsPage from "./pages/BrowseItemsPage";
import { ReportPage } from "./pages/ReportPage";

// Protected route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  adminOnly?: boolean;
  managerOnly?: boolean;
}> = ({ children, adminOnly = false, managerOnly = false }) => {
  const { currentUser, loading } = useAuth();

  // Show loading indicator while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if route requires manager privileges
  if (managerOnly && currentUser.role !== "manager") {
    return <Navigate to="/" />;
  }

  // Check if route requires admin privileges
  if (
    adminOnly &&
    currentUser.role !== "admin" &&
    currentUser.role !== "manager"
  ) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <RequestProvider>
        <InventoryProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/request"
                element={
                  <ProtectedRoute>
                    <RequestFormPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/request/new"
                element={
                  <ProtectedRoute>
                    <RequestFormPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <RequestHistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/request/:id"
                element={
                  <ProtectedRoute>
                    <RequestDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/browse-items"
                element={
                  <ProtectedRoute>
                    <BrowseItemsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute managerOnly={true}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute managerOnly={true}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ReportPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirect all other paths to dashboard */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </InventoryProvider>
      </RequestProvider>
    </AuthProvider>
  );
}

export default App;
