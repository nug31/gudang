import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Clock,
  Package,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="md:hidden fixed bottom-6 right-6 z-50 p-3 bg-blue-600 rounded-full shadow-lg text-white focus:outline-none"
        onClick={toggleMenu}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMenu}
        />
      )}

      <aside
        className={`md:hidden fixed top-16 bottom-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 h-full overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Navigation
          </p>

          <nav className="mt-4 space-y-1">
            <NavLink to="/" className={navLinkClasses} onClick={closeMenu}>
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </NavLink>

            <NavLink
              to="/request"
              className={navLinkClasses}
              onClick={closeMenu}
            >
              <PlusCircle className="mr-3 h-5 w-5" />
              New Request
            </NavLink>

            <NavLink
              to="/history"
              className={navLinkClasses}
              onClick={closeMenu}
            >
              <Clock className="mr-3 h-5 w-5" />
              Request History
            </NavLink>

            <NavLink
              to="/browse-items"
              className={navLinkClasses}
              onClick={closeMenu}
            >
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

                <NavLink
                  to="/inventory"
                  className={navLinkClasses}
                  onClick={closeMenu}
                >
                  <Package className="mr-3 h-5 w-5" />
                  Inventory
                </NavLink>

                <NavLink
                  to="/reports"
                  className={navLinkClasses}
                  onClick={closeMenu}
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Reports
                </NavLink>

                <NavLink
                  to="/users"
                  className={navLinkClasses}
                  onClick={closeMenu}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Users
                </NavLink>

                {isManager && (
                  <NavLink
                    to="/settings"
                    className={navLinkClasses}
                    onClick={closeMenu}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </NavLink>
                )}
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};
