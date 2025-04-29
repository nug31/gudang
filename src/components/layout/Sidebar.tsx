import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Clock,
  Package,
  BarChart3,
  Users,
  Settings,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "manager";
  const isManager = currentUser?.role === "manager";

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16">
      <div className="px-6 py-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Navigation
        </p>

        <nav className="mt-4 space-y-1">
          <NavLink to="/" className={navLinkClasses}>
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>

          <NavLink to="/request" className={navLinkClasses}>
            <PlusCircle className="mr-3 h-5 w-5" />
            New Request
          </NavLink>

          <NavLink to="/history" className={navLinkClasses}>
            <Clock className="mr-3 h-5 w-5" />
            Request History
          </NavLink>

          <NavLink to="/browse-items" className={navLinkClasses}>
            <Search className="mr-3 h-5 w-5" />
            Browse Items
          </NavLink>

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Admin
                </p>
              </div>

              <NavLink to="/inventory" className={navLinkClasses}>
                <Package className="mr-3 h-5 w-5" />
                Inventory
              </NavLink>

              <NavLink to="/reports" className={navLinkClasses}>
                <BarChart3 className="mr-3 h-5 w-5" />
                Reports
              </NavLink>

              <NavLink to="/users" className={navLinkClasses}>
                <Users className="mr-3 h-5 w-5" />
                Users
              </NavLink>

              {isManager && (
                <NavLink to="/settings" className={navLinkClasses}>
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </NavLink>
              )}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};
