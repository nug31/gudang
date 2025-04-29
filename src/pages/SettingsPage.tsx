import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Settings, Database, Server, Shield, Bell } from "lucide-react";

export const SettingsPage: React.FC = () => {
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
          <p>Only managers can access the settings page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="General Settings">
          <div className="p-4 space-y-4">
            <div className="flex items-start">
              <Settings className="h-5 w-5 text-gray-500 mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Application Settings</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Configure general application settings like name, logo, and theme.
                </p>
                <Button variant="secondary" className="mt-2">
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Database Settings">
          <div className="p-4 space-y-4">
            <div className="flex items-start">
              <Database className="h-5 w-5 text-gray-500 mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Database Configuration</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage database connections, backups, and maintenance.
                </p>
                <Button variant="secondary" className="mt-2">
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Server Settings">
          <div className="p-4 space-y-4">
            <div className="flex items-start">
              <Server className="h-5 w-5 text-gray-500 mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Server Configuration</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Configure server settings, caching, and performance options.
                </p>
                <Button variant="secondary" className="mt-2">
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Security Settings">
          <div className="p-4 space-y-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-gray-500 mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Security Configuration</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage security settings, authentication, and access control.
                </p>
                <Button variant="secondary" className="mt-2">
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Notification Settings">
          <div className="p-4 space-y-4">
            <div className="flex items-start">
              <Bell className="h-5 w-5 text-gray-500 mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Notification Configuration</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Configure email notifications, alerts, and reminders.
                </p>
                <Button variant="secondary" className="mt-2">
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
