import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Trash2, Play, Pause, AlertCircle } from 'lucide-react';
import CameraPreview from '../../components/CameraPreview';
import { apiEndpoints } from '../../services/api';
import toast from 'react-hot-toast';

const CamerasList = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getCameras();
      setCameras(response.data);
    } catch (error) {
      toast.error('Failed to fetch cameras');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCamera = async (cameraId, currentStatus) => {
    try {
      await apiEndpoints.toggleCamera(cameraId);
      setCameras(prevCameras =>
        prevCameras.map(camera =>
          camera.camera_id === cameraId
            ? { ...camera, is_active: !currentStatus }
            : camera
        )
      );
      toast.success(`Camera ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to toggle camera status');
    }
  };

  const handleDeleteCamera = async (cameraId) => {
    if (!window.confirm('Are you sure you want to delete this camera?')) {
      return;
    }

    try {
      await apiEndpoints.deleteCamera(cameraId);
      setCameras(prevCameras => prevCameras.filter(camera => camera.camera_id !== cameraId));
      toast.success('Camera deleted successfully');
    } catch (error) {
      toast.error('Failed to delete camera');
    }
  };

  const getStatusSummary = () => {
    const active = cameras.filter(c => c.is_active).length;
    const inactive = cameras.filter(c => !c.is_active).length;
    
    return { active, inactive, total: cameras.length };
  };

  const statusSummary = getStatusSummary();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cameras List</h1>
          <p className="text-gray-600">Manage all cameras in the system</p>
        </div>
        <button
          onClick={fetchCameras}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cameras</p>
              <p className="text-2xl font-bold text-gray-900">{statusSummary.total}</p>
            </div>
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{statusSummary.active}</p>
            </div>
            <Play className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{statusSummary.inactive}</p>
            </div>
            <Pause className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Cameras Grid */}
      {cameras.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cameras found</h3>
            <p className="text-gray-500 mb-6">Add your first camera to get started</p>
            <button
              onClick={() => window.location.href = '/admin/cameras'}
              className="btn-primary"
            >
              Add Camera
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((camera) => (
            <CameraPreview
              key={camera.camera_id}
              camera={camera}
              onToggle={() => handleToggleCamera(camera.camera_id, camera.is_active)}
              onDelete={() => handleDeleteCamera(camera.camera_id)}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CamerasList;
