import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Trash2, Play, Pause, AlertCircle } from 'lucide-react';
import CameraPreview from '../../components/CameraPreview';
import { apiEndpoints } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import toast from 'react-hot-toast';

const CamerasList = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Poll camera status every 10 seconds - disabled for mock mode
  // const { data: cameraStatus } = usePolling(
  //   apiEndpoints.getCameraStatus,
  //   10000,
  //   []
  // );
  const cameraStatus = null; // Mock mode - no real polling

  useEffect(() => {
    fetchCameras();
  }, []);

  useEffect(() => {
    if (cameraStatus) {
      // Update camera statuses with real-time data
      setCameras(prevCameras => 
        prevCameras.map(camera => ({
          ...camera,
          status: cameraStatus[camera.id]?.status || camera.status,
          last_seen: cameraStatus[camera.id]?.last_seen || camera.last_seen,
          fps: cameraStatus[camera.id]?.fps || camera.fps
        }))
      );
    }
  }, [cameraStatus]);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      // Mock camera data since we're using mock authentication
      // const response = await apiEndpoints.getCameras();
      // setCameras(response.data);
      
      setCameras([
        {
          id: 1,
          name: 'Main Entrance Camera',
          url: 'rtsp://192.168.1.100:554/stream',
          location: 'Main Entrance',
          status: 'active',
          last_seen: new Date().toISOString(),
          fps: 30
        },
        {
          id: 2,
          name: 'Library Camera',
          url: 'rtsp://192.168.1.101:554/stream',
          location: 'Library',
          status: 'active',
          last_seen: new Date(Date.now() - 5000).toISOString(),
          fps: 25
        },
        {
          id: 3,
          name: 'Cafeteria Camera',
          url: 'rtsp://192.168.1.102:554/stream',
          location: 'Cafeteria',
          status: 'inactive',
          last_seen: new Date(Date.now() - 300000).toISOString(),
          fps: 0
        },
        {
          id: 4,
          name: 'Lab Building Camera',
          url: 'rtsp://192.168.1.103:554/stream',
          location: 'Lab Building',
          status: 'error',
          last_seen: new Date(Date.now() - 600000).toISOString(),
          fps: 0
        }
      ]);
    } catch (error) {
      toast.error('Failed to fetch cameras');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCamera = async (cameraId) => {
    try {
      // Mock toggle functionality - in real implementation, this would call the backend
      setCameras(prevCameras =>
        prevCameras.map(camera =>
          camera.id === cameraId
            ? {
                ...camera,
                status: camera.status === 'active' ? 'inactive' : 'active'
              }
            : camera
        )
      );
      toast.success('Camera status updated');
    } catch (error) {
      toast.error('Failed to toggle camera');
    }
  };

  const handleDeleteCamera = async (cameraId) => {
    if (!window.confirm('Are you sure you want to delete this camera?')) {
      return;
    }

    try {
      // Mock API call since we're using mock authentication
      // await apiEndpoints.deleteCamera(cameraId);
      
      setCameras(prevCameras => prevCameras.filter(camera => camera.id !== cameraId));
      toast.success('Camera deleted successfully');
    } catch (error) {
      toast.error('Failed to delete camera');
    }
  };

  const getStatusSummary = () => {
    const active = cameras.filter(c => c.status === 'active').length;
    const inactive = cameras.filter(c => c.status === 'inactive').length;
    const error = cameras.filter(c => c.status === 'error').length;
    
    return { active, inactive, error, total: cameras.length };
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{statusSummary.error}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
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
              key={camera.id}
              camera={camera}
              onToggle={handleToggleCamera}
              onDelete={handleDeleteCamera}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {cameras.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setCameras(prevCameras =>
                  prevCameras.map(camera => ({ ...camera, status: 'active' }))
                );
                toast.success('All cameras started');
              }}
              className="btn-secondary"
            >
              Start All Cameras
            </button>
            <button
              onClick={() => {
                setCameras(prevCameras =>
                  prevCameras.map(camera => ({ ...camera, status: 'inactive' }))
                );
                toast.success('All cameras stopped');
              }}
              className="btn-secondary"
            >
              Stop All Cameras
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all cameras?')) {
                  setCameras([]);
                  toast.success('All cameras deleted');
                }
              }}
              className="btn-danger"
            >
              Delete All Cameras
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CamerasList;
