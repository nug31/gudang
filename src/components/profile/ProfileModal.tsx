import React, { useState, useRef, useEffect } from "react";
import { User, Camera, Upload, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import * as api from "../../services/api";
import { Modal3D, Button3D } from "../3d";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State to track which fields have been modified
  const [modifiedFields, setModifiedFields] = useState<{
    name: boolean;
    department: boolean;
    profileImage: boolean;
  }>({
    name: false,
    department: false,
    profileImage: false,
  });

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setDepartment(currentUser.department || "");
      setProfileImage(currentUser.profileImage || null);

      // Reset modified fields tracking
      setModifiedFields({
        name: false,
        department: false,
        profileImage: false,
      });
    }

    // Reset messages when modal opens/closes
    setError(null);
    setSuccessMessage(null);

    // Clear any existing timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  }, [currentUser, isOpen]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Check for changes in fields
  useEffect(() => {
    if (currentUser) {
      setModifiedFields((prev) => ({
        ...prev,
        name: name !== currentUser.name,
      }));
    }
  }, [name, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setModifiedFields((prev) => ({
        ...prev,
        department: department !== (currentUser.department || ""),
      }));
    }
  }, [department, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setModifiedFields((prev) => ({
        ...prev,
        profileImage: profileImage !== currentUser.profileImage,
      }));
    }
  }, [profileImage, currentUser]);

  // Compute whether any changes have been made
  const hasChanges =
    modifiedFields.name ||
    modifiedFields.department ||
    modifiedFields.profileImage;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setError("Image size should be less than 3MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create a preview first
      const reader = new FileReader();

      // Create a promise to wait for the FileReader to complete
      const imageDataPromise = new Promise<string>((resolve) => {
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setProfileImage(result); // Set preview immediately
          resolve(result);
        };
      });

      reader.readAsDataURL(file);

      // Wait for the image data to be ready
      const imageData = await imageDataPromise;

      // Auto-update the profile image
      const updatedUserData = {
        ...currentUser,
        profileImage: imageData,
      };

      // Update the user profile in the backend
      const updatedUser = await api.updateUser(currentUser.id, {
        profileImage: imageData,
      });

      // Update the current user in the auth context
      updateCurrentUser(updatedUser);

      // Show success message
      setError(null);
      setSuccessMessage("Profile photo updated successfully!");

      // Clear success message after 3 seconds
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating profile image:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update profile image"
      );

      // Revert to previous image if there was an error
      setProfileImage(currentUser.profileImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentUser) return;

    setIsUploading(true);
    setError(null);

    try {
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Set preview to null immediately
      setProfileImage(null);

      // Update the user profile in the backend
      const updatedUser = await api.updateUser(currentUser.id, {
        profileImage: undefined, // This will remove the profile image
      });

      // Update the current user in the auth context
      updateCurrentUser(updatedUser);

      // Show success message
      setError(null);
      setSuccessMessage("Profile photo removed successfully!");

      // Clear success message after 3 seconds
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error removing profile image:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove profile image"
      );

      // Revert to previous image if there was an error
      setProfileImage(currentUser.profileImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    try {
      // Check if there are any changes to submit
      const hasNameChanged = name !== currentUser.name;
      const hasDepartmentChanged =
        department !== (currentUser.department || "");
      const hasProfileImageChanged = profileImage !== currentUser.profileImage;

      // If nothing has changed, show a message and return
      if (!hasNameChanged && !hasDepartmentChanged && !hasProfileImageChanged) {
        setError("No fields to update. Please make changes before saving.");
        return;
      }

      setIsUploading(true);
      setError(null);

      // Prepare the updated user data - only include fields that have changed
      const updatedUserData: Partial<User> = {};

      if (hasNameChanged) {
        updatedUserData.name = name;
      }

      if (hasDepartmentChanged) {
        updatedUserData.department = department || undefined;
      }

      if (hasProfileImageChanged) {
        updatedUserData.profileImage = profileImage || undefined;
      }

      // Update the user profile
      const updatedUser = await api.updateUser(currentUser.id, updatedUserData);

      // Update the current user in the auth context
      updateCurrentUser(updatedUser);

      // Show success message
      setSuccessMessage("Profile updated successfully!");

      // Clear success message after 3 seconds and close modal
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
        // Close the modal
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal3D
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      glassEffect={true}
      footer={
        <div className="flex justify-end space-x-3">
          <Button3D variant="outline" onClick={onClose}>
            Cancel
          </Button3D>
          <Button3D
            variant={hasChanges ? "primary" : "outline"}
            onClick={handleSubmit}
            isLoading={isUploading}
            disabled={!hasChanges}
            className={!hasChanges ? "opacity-60 cursor-not-allowed" : ""}
          >
            {hasChanges ? "Save Changes" : "No Changes"}
          </Button3D>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <div className="mr-3 flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              {error ===
              "No fields to update. Please make changes before saving." ? (
                <>
                  <p className="font-medium">No changes detected</p>
                  <p className="text-sm">
                    Please make changes to your profile before saving.
                  </p>
                </>
              ) : (
                error
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <div className="mr-3 flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Profile Image */}
        <div className="flex flex-col items-center">
          {modifiedFields.profileImage && (
            <div className="mb-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Profile Image Modified
            </div>
          )}
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 ${
                isUploading
                  ? "border-blue-400 animate-pulse"
                  : modifiedFields.profileImage
                  ? "border-blue-300"
                  : "border-gray-300"
              }`}
            >
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : null}

              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className={`w-full h-full object-cover ${
                    isUploading ? "opacity-50" : ""
                  }`}
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {profileImage && !isUploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`absolute bottom-0 right-0 ${
                isUploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white rounded-full p-1.5 shadow-md transition-colors`}
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Photo
            </button>
            <span className="text-xs text-gray-500 mt-1">
              Max file size: 3MB (JPEG, PNG, GIF)
            </span>
          </div>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            Name
            {modifiedFields.name && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Modified
              </span>
            )}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 border ${
              modifiedFields.name
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            required
          />
        </div>

        {/* Department */}
        <div>
          <label
            htmlFor="department"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            Department
            {modifiedFields.department && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Modified
              </span>
            )}
          </label>
          <input
            id="department"
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={`w-full px-3 py-2 border ${
              modifiedFields.department
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
        </div>
      </div>
    </Modal3D>
  );
};
