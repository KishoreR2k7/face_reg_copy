import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import AttendanceTable from '../../components/AttendanceTable';
import { apiEndpoints } from '../../services/api';
import toast from 'react-hot-toast';

const AttendanceLog = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    camera: '',
    status: ''
  });
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    fetchAttendanceData();
    fetchCameras();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      // Mock data since we're using mock authentication
      // const response = await apiEndpoints.getAttendance(filters);
      // setAttendanceData(response.data);
      
      // Mock attendance data
      setAttendanceData([
        {
          id: 1,
          name: 'John Doe',
          roll_no: 'CS001',
          timestamp: new Date().toISOString(),
          camera_name: 'Main Entrance',
          status: 'present',
          confidence: 0.95
        },
        {
          id: 2,
          name: 'Jane Smith',
          roll_no: 'CS002',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          camera_name: 'Library',
          status: 'present',
          confidence: 0.92
        },
        {
          id: 3,
          name: 'Bob Johnson',
          roll_no: 'CS003',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          camera_name: 'Cafeteria',
          status: 'absent',
          confidence: 0.88
        },
        {
          id: 4,
          name: 'Alice Brown',
          roll_no: 'CS004',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          camera_name: 'Main Entrance',
          status: 'present',
          confidence: 0.94
        },
        {
          id: 5,
          name: 'Charlie Wilson',
          roll_no: 'CS005',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          camera_name: 'Library',
          status: 'present',
          confidence: 0.91
        }
      ]);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCameras = async () => {
    try {
      // Mock camera data since we're using mock authentication
      // const response = await apiEndpoints.getCameras();
      // setCameras(response.data);
      
      setCameras([
        { id: 1, name: 'Main Entrance' },
        { id: 2, name: 'Library' },
        { id: 3, name: 'Cafeteria' },
        { id: 4, name: 'Lab Building' }
      ]);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchAttendanceData();
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      camera: '',
      status: ''
    });
  };

  const handleMarkAttendance = async (recordId, status) => {
    try {
      // Mock API call since we're using mock authentication
      // await apiEndpoints.markAttendanceManual({
      //   record_id: recordId,
      //   status: status
      // });
      
      // Update local data
      setAttendanceData(prevData => 
        prevData.map(record => 
          record.id === recordId 
            ? { ...record, status: status }
            : record
        )
      );
      
      toast.success(`Marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Time', 'Name', 'Roll No', 'Camera', 'Status', 'Confidence'],
      ...attendanceData.map(record => [
        new Date(record.timestamp).toLocaleDateString(),
        new Date(record.timestamp).toLocaleTimeString(),
        record.name || 'Unknown',
        record.roll_no || 'N/A',
        record.camera_name || 'Unknown',
        record.status || 'Unknown',
        record.confidence ? `${(record.confidence * 100).toFixed(1)}%` : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Log</h1>
          <p className="text-gray-600">View and manage attendance records</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center space-x-2"
            disabled={attendanceData.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchAttendanceData}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Camera
            </label>
            <select
              name="camera"
              value={filters.camera}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Cameras</option>
              {cameras.map(camera => (
                <option key={camera.id} value={camera.name}>
                  {camera.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button
            onClick={applyFilters}
            className="btn-primary"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <AttendanceTable
        data={attendanceData}
        loading={loading}
        onMarkAttendance={handleMarkAttendance}
        showActions={true}
      />
    </div>
  );
};

export default AttendanceLog;
