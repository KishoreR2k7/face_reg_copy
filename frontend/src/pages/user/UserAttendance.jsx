import React, { useState, useEffect } from 'react';
import { User, Calendar, Download, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import AttendanceTable from '../../components/AttendanceTable';
import { apiEndpoints } from '../../services/api';
import toast from 'react-hot-toast';

const UserAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    attendancePercentage: 0
  });

  useEffect(() => {
    // Mock student ID - in real implementation, this would come from authentication
    const studentId = 'CS001'; // This should be dynamic based on logged-in user
    fetchUserAttendance(studentId);
  }, []);

  const fetchUserAttendance = async (studentId) => {
    try {
      setLoading(true);
      // Mock data since we're using mock authentication
      // const response = await apiEndpoints.getUserAttendance(studentId);
      // setAttendanceData(response.data.attendance || []);
      // setStudentInfo(response.data.student || {
      //   name: 'John Doe',
      //   roll_no: 'CS001',
      //   department: 'Computer Science',
      //   year: '3rd Year'
      // });
      
      // Mock attendance data
      const mockAttendance = [
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
          name: 'John Doe',
          roll_no: 'CS001',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          camera_name: 'Library',
          status: 'present',
          confidence: 0.92
        },
        {
          id: 3,
          name: 'John Doe',
          roll_no: 'CS001',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          camera_name: 'Cafeteria',
          status: 'absent',
          confidence: 0.88
        },
        {
          id: 4,
          name: 'John Doe',
          roll_no: 'CS001',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          camera_name: 'Main Entrance',
          status: 'present',
          confidence: 0.94
        },
        {
          id: 5,
          name: 'John Doe',
          roll_no: 'CS001',
          timestamp: new Date(Date.now() - 345600000).toISOString(),
          camera_name: 'Library',
          status: 'present',
          confidence: 0.91
        }
      ];
      
      setAttendanceData(mockAttendance);
      setStudentInfo({
        name: 'John Doe',
        roll_no: 'CS001',
        department: 'Computer Science',
        year: '3rd Year'
      });
      calculateSummary(mockAttendance);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
      // Mock data for demonstration
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const mockAttendance = [
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
        name: 'John Doe',
        roll_no: 'CS001',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        camera_name: 'Library',
        status: 'present',
        confidence: 0.92
      },
      {
        id: 3,
        name: 'John Doe',
        roll_no: 'CS001',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        camera_name: 'Cafeteria',
        status: 'absent',
        confidence: 0.88
      },
      {
        id: 4,
        name: 'John Doe',
        roll_no: 'CS001',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        camera_name: 'Main Entrance',
        status: 'present',
        confidence: 0.94
      },
      {
        id: 5,
        name: 'John Doe',
        roll_no: 'CS001',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        camera_name: 'Library',
        status: 'present',
        confidence: 0.91
      }
    ];
    
    setAttendanceData(mockAttendance);
    setStudentInfo({
      name: 'John Doe',
      roll_no: 'CS001',
      department: 'Computer Science',
      year: '3rd Year'
    });
    calculateSummary(mockAttendance);
  };

  const calculateSummary = (attendance) => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(record => record.status === 'present').length;
    const absentDays = attendance.filter(record => record.status === 'absent').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    setSummary({
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage: Math.round(attendancePercentage)
    });
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
    a.download = `my_attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully');
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600">View your attendance records and statistics</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-secondary flex items-center space-x-2"
          disabled={attendanceData.length === 0}
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Student Information */}
      {studentInfo && (
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{studentInfo.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Roll No: {studentInfo.roll_no}</span>
                <span>•</span>
                <span>{studentInfo.department}</span>
                <span>•</span>
                <span>{studentInfo.year}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getAttendanceColor(summary.attendancePercentage)}`}>
                {summary.attendancePercentage}%
              </div>
              <div className="text-sm text-gray-600">
                {getAttendanceStatus(summary.attendancePercentage)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalDays}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-green-600">{summary.presentDays}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent Days</p>
              <p className="text-2xl font-bold text-red-600">{summary.absentDays}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance %</p>
              <p className={`text-2xl font-bold ${getAttendanceColor(summary.attendancePercentage)}`}>
                {summary.attendancePercentage}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="text-sm text-gray-500">
            Last 7 days
          </div>
        </div>
        
        <div className="space-y-3">
          {attendanceData.slice(0, 5).map((record) => (
            <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleTimeString()} • {record.camera_name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.status === 'present' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {record.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {record.confidence ? `${(record.confidence * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Attendance Records</h3>
        <AttendanceTable
          data={attendanceData}
          loading={loading}
          showActions={false}
        />
      </div>
    </div>
  );
};

export default UserAttendance;
