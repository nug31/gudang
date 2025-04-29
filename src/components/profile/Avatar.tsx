import React, { useState } from "react";
import { User as LucideUser, Camera, Dice6 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../services/api";

interface AvatarProps {
  size?: "sm" | "md" | "lg";
  showUploadButton?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  size = "md",
  showUploadButton = true 
}) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const handleImageUpload = async (file: File) => {
    if (!currentUser?.id) return;

    // Check file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must be less than 3MB");
      return;
    }

    // Check file type
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      setError("Only JPEG, PNG and GIF images are allowed");
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      setIsUploading(true);
      setError(null);
      
      reader.onloadend = async () => {
        try {
          // Update user with new profile image
          const result = await updateUser(currentUser.id, {
            avatar: reader.result as string,
          });

          if (result.avatar) {
            // Update context and localStorage
            updateCurrentUser({
              ...currentUser,
              avatar: result.avatar,
            });
          } else {
            throw new Error("No profile image URL returned");
          }
        } catch (error: unknown) {
          let errorMessage = "Failed to upload image. Please try again.";
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          console.error("Error uploading image:", error);
          setError(errorMessage);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setError("Failed to read image file. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-gray-300 transition-all ${
          isUploading ? "opacity-50" : ""
        }`}
      >
        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <LucideUser className={`${size === "sm" ? "h-6 w-6" : "h-12 w-12"} text-gray-400`} />
        )}
      </div>
      
{showUploadButton && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (!currentUser?.id) return;
                
                setIsUploading(true);
                setError(null);
                try {
                  // Generate random seed
                  const seed = Math.random().toString(36).substring(7);
                  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                  
                  // Fetch the SVG
                  const response = await fetch(avatarUrl);
                  const svgData = await response.text();
                  
                  // Convert SVG to data URL
                  const dataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
                  
                  // Update user with new avatar
                  const result = await updateUser(currentUser.id, {
                    avatar: dataUrl
                  });

                  if (result.avatar) {
                    updateCurrentUser({
                      ...currentUser,
                      avatar: result.avatar
                    });
                  }
                } catch (error) {
                  setError("Failed to generate random avatar");
                  console.error(error);
                } finally {
                  setIsUploading(false);
                }
              }}
              className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75"
            >
              <Dice6 className={`${size === "sm" ? "h-4 w-4" : "h-6 w-6"} text-white`} />
            </button>
            
            <label className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 cursor-pointer">
              <Camera className={`${size === "sm" ? "h-4 w-4" : "h-6 w-6"} text-white`} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};
