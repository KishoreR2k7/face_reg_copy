import React from 'react';
import { CheckCircle, XCircle, Clock, Camera, User } from 'lucide-react';

const AttendanceTable = ({ 
  data = [], 
  loading = false, 
  onMarkAttendance,
  showActions = false 
}) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
          <p className="text-gray-500">No attendance data available for the selected criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Date & Time</th>
              <th className="table-header">Name</th>
              <th className="table-header">Roll No</th>
              <th className="table-header">Camera</th>
              <th className="table-header">Status</th>
              <th className="table-header">Confidence</th>
              {showActions && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    {record.name || 'Unknown'}
                  </div>
                </td>
                <td className="table-cell font-mono text-sm">
                  {record.roll_no || 'N/A'}
                </td>
                <td className="table-cell">
                  <div className="flex items-center">
                    <Camera className="w-4 h-4 text-gray-400 mr-2" />
                    {record.camera_name || 'Unknown'}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center">
                    {getStatusIcon(record.status)}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-sm">
                    {record.confidence ? `${(record.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </td>
                {showActions && (
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onMarkAttendance && onMarkAttendance(record.id, 'present')}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => onMarkAttendance && onMarkAttendance(record.id, 'absent')}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
