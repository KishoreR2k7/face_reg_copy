import React from 'react';
import { Camera, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const CameraPreview = ({ 
  camera, 
  isActive = false, 
  onToggle, 
  onDelete,
  showActions = true 
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Camera className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{camera.name}</h3>
            <p className="text-sm text-gray-500">{camera.url}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(camera.status)}`}>
            {getStatusIcon(camera.status)}
            <span className="ml-1">{camera.status || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Camera Preview Placeholder */}
      <div className="relative bg-gray-100 rounded-lg h-48 mb-4 overflow-hidden">
        {camera.status === 'active' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Live Feed</p>
              <p className="text-xs text-gray-400">Camera is active</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No Signal</p>
              <p className="text-xs text-gray-400">Camera is {camera.status || 'inactive'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Location:</span>
          <span className="text-gray-900">{camera.location || 'Not specified'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Last Seen:</span>
          <span className="text-gray-900">
            {camera.last_seen 
              ? new Date(camera.last_seen).toLocaleString()
              : 'Never'
            }
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">FPS:</span>
          <span className="text-gray-900">{camera.fps || 'N/A'}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2">
          <button
            onClick={() => onToggle && onToggle(camera.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              camera.status === 'active'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {camera.status === 'active' ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={() => onDelete && onDelete(camera.id)}
            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
