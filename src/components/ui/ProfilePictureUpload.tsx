import React, { useState, useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ProfilePictureUploadProps {
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  onUploadSuccess, 
  className = '' 
}) => {
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await apiService.uploadProfilePicture(file);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.profile_picture_url) {
        // Convert relative URL to absolute URL
        const fullUrl = response.data.profile_picture_url.startsWith('http') 
          ? response.data.profile_picture_url 
          : `http://localhost:8000${response.data.profile_picture_url}`;
        onUploadSuccess?.(fullUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadSuccess?.('');
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Profile Picture Display */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {currentUser?.profile_picture ? (
            <img
              src={currentUser.profile_picture.startsWith('http') 
                ? currentUser.profile_picture 
                : `http://localhost:8000${currentUser.profile_picture}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : currentUser?.avatar ? (
            <img
              src={currentUser.avatar.startsWith('http') 
                ? currentUser.avatar 
                : `http://localhost:8000${currentUser.avatar}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>
        
        {/* Upload Button */}
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Status */}
      {isUploading && (
        <div className="text-sm text-blue-600">
          Uploading...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      {/* Remove Button */}
      {(currentUser?.profile_picture || currentUser?.avatar) && (
        <button
          onClick={handleRemove}
          className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Remove</span>
        </button>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center">
        Click the upload button to change your profile picture
      </div>
    </div>
  );
};

export default ProfilePictureUpload;


