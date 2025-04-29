import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown, Edit } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ProfileModal } from "../profile/ProfileModal";
import { EnhancedButton3D } from "../3d";

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileProfileDropdown, setShowMobileProfileDropdown] =
    useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Handle desktop dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }

      // Handle mobile dropdown
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMobileProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/images/logo.png"
              alt="Gudang Mitra"
              className="h-12 w-12"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Gudang Mitra
            </span>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-4">
              {/* Desktop Logout Button */}
              <div className="hidden md:block">
                <EnhancedButton3D
                  variant="logout"
                  onClick={handleLogout}
                  depth={4}
                  icon={<LogOut className="h-4 w-4" />}
                  animation="float"
                  rounded={true}
                  className="text-sm px-4 py-1.5 font-medium"
                >
                  Logout
                </EnhancedButton3D>
              </div>

              <div className="hidden md:flex items-center">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300">
                      {currentUser.profileImage ? (
                        <img
                          src={currentUser.profileImage}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-1">
                        {currentUser.name}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-1">
                        {currentUser.role}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl py-1 z-10 border border-gray-200 transition-all duration-300 origin-top-right transform ${
                      showProfileDropdown
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300 mr-3">
                          {currentUser.profileImage ? (
                            <img
                              src={currentUser.profileImage}
                              alt={currentUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentUser.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 border-t border-gray-100 pt-1">
                        {currentUser.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-3 text-blue-500" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Logout Button */}
              <div className="md:hidden mr-3">
                <EnhancedButton3D
                  variant="logout"
                  onClick={handleLogout}
                  depth={4}
                  icon={<LogOut className="h-4 w-4" />}
                  animation="float"
                  rounded={true}
                  className="text-sm px-4 py-1.5 font-medium"
                >
                  Logout
                </EnhancedButton3D>
              </div>

              {/* Mobile Profile Button and Dropdown */}
              <div className="md:hidden flex items-center">
                <div className="relative" ref={mobileDropdownRef}>
                  <button
                    onClick={() =>
                      setShowMobileProfileDropdown(!showMobileProfileDropdown)
                    }
                    className="relative flex items-center space-x-2 focus:outline-none"
                    aria-label="Profile Menu"
                  >
                    <div
                      className={`w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 ${
                        showMobileProfileDropdown
                          ? "border-blue-500 shadow-lg"
                          : "border-blue-300 shadow-md"
                      } hover:border-blue-500 transition-all duration-300 transform ${
                        showMobileProfileDropdown ? "scale-110" : ""
                      }`}
                    >
                      {currentUser.profileImage ? (
                        <img
                          src={currentUser.profileImage}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-white shadow-sm transition-transform duration-300 ${
                        showMobileProfileDropdown ? "rotate-180 transform" : ""
                      }`}
                    >
                      <ChevronDown className="h-3 w-3 text-white" />
                    </div>
                  </button>

                  {/* Mobile Profile Dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl py-1 z-10 border border-gray-200 transition-all duration-300 origin-top-right transform ${
                      showMobileProfileDropdown
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300 mr-3">
                          {currentUser.profileImage ? (
                            <img
                              src={currentUser.profileImage}
                              alt={currentUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentUser.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 border-t border-gray-100 pt-1">
                        {currentUser.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowMobileProfileDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-3 text-blue-500" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EnhancedButton3D
              variant="primary"
              onClick={() => navigate("/login")}
              depth={5}
              icon={<User className="h-4 w-4" />}
              animation="float"
              rounded={true}
            >
              Login
            </EnhancedButton3D>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
};
