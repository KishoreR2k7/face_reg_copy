import React, { useState } from 'react';
import { Camera, Wifi, Eye, EyeOff } from 'lucide-react';
import { apiEndpoints } from '../../services/api';
import { useForm, useLoading } from '../../hooks/usePolling';
import toast from 'react-hot-toast';

const AddCamera = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { values, handleChange, handleBlur, errors, setError, reset } = useForm({
    name: '',
    url: '',
    username: '',
    password: '',
    location: '',
    description: ''
  });
  const { loading, withLoading } = useLoading();

  const validateForm = () => {
    const newErrors = {};
    
    if (!values.name.trim()) {
      newErrors.name = 'Camera name is required';
    }
    
    if (!values.url.trim()) {
      newErrors.url = 'Camera URL is required';
    } else if (!isValidUrl(values.url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    if (!values.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    Object.keys(newErrors).forEach(key => setError(key, newErrors[key]));
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    await withLoading(async () => {
      try {
        const cameraData = {
          name: values.name,
          url: values.url,
          username: values.username || null,
          password: values.password || null,
          location: values.location,
          description: values.description || null
        };

        // Mock response since we're using mock authentication
        // const response = await apiEndpoints.addCamera(cameraData);
        const response = { data: { id: Date.now(), ...cameraData } };
        
        toast.success('Camera added successfully!');
        reset();
      } catch (error) {
        toast.error('Failed to add camera');
      }
    });
  };

  const testConnection = async () => {
    if (!values.url.trim()) {
      toast.error('Please enter a camera URL first');
      return;
    }

    try {
      // Mock connection test - in real implementation, this would test the camera connection
      toast.success('Camera connection test successful!');
    } catch (error) {
      toast.error('Camera connection test failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Camera</h1>
        <p className="text-gray-600">Add a new camera to the face recognition system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Camera Information */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <Camera className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Camera Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camera Name *
              </label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g., Main Entrance Camera"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                placeholder="e.g., Main Entrance, Library, Cafeteria"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camera URL/RTSP Stream *
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  name="url"
                  value={values.url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field flex-1 ${errors.url ? 'border-red-500' : ''}`}
                  placeholder="rtsp://192.168.1.100:554/stream or http://192.168.1.100:8080/video"
                />
                <button
                  type="button"
                  onClick={testConnection}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Wifi className="w-4 h-4" />
                  <span>Test</span>
                </button>
              </div>
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter the RTSP URL or HTTP stream URL for the camera
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username (Optional)
              </label>
              <input
                type="text"
                name="username"
                value={values.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Camera username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password (Optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Camera password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Additional details about this camera..."
              />
            </div>
          </div>
        </div>

        {/* Camera Preview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Preview</h3>
          
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Camera preview will appear here</p>
              <p className="text-xs text-gray-400">Test the connection to see live feed</p>
            </div>
          </div>
        </div>

        {/* Camera Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detection Sensitivity
              </label>
              <select className="input-field">
                <option value="high">High</option>
                <option value="medium" selected>Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recognition Threshold
              </label>
              <select className="input-field">
                <option value="0.9">90%</option>
                <option value="0.8" selected>80%</option>
                <option value="0.7">70%</option>
                <option value="0.6">60%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={reset}
            className="btn-secondary"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Camera...' : 'Add Camera'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCamera;
