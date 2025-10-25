import React, { useState, useEffect } from 'react';
import { Users, Camera, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '../../components/MetricCard';
import AttendanceTable from '../../components/AttendanceTable';
import { apiEndpoints } from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentRecognitions, setRecentRecognitions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data since we're using mock authentication
      // const response = await apiEndpoints.getDashboardSummary();
      // setDashboardData(response.data);
      
      // Mock dashboard data
      setDashboardData({
        total_students: 150,
        active_cameras: 8,
        present_today: 142,
        absent_today: 8
      });
      
      // Mock recent recognitions data
      setRecentRecognitions([
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
        }
      ]);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Mock weekly data for the chart
  const weeklyData = [
    { day: 'Mon', present: 45, absent: 5 },
    { day: 'Tue', present: 42, absent: 8 },
    { day: 'Wed', present: 48, absent: 2 },
    { day: 'Thu', present: 40, absent: 10 },
    { day: 'Fri', present: 38, absent: 12 },
    { day: 'Sat', present: 25, absent: 5 },
    { day: 'Sun', present: 15, absent: 5 }
  ];

  const metrics = [
    {
      title: 'Total Students',
      value: dashboardData?.total_students || 0,
      icon: Users,
      change: '+5',
      changeType: 'positive'
    },
    {
      title: 'Active Cameras',
      value: dashboardData?.active_cameras || 0,
      icon: Camera,
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Present Today',
      value: dashboardData?.present_today || 0,
      icon: CheckCircle,
      change: '+12',
      changeType: 'positive'
    },
    {
      title: 'Absent Today',
      value: dashboardData?.absent_today || 0,
      icon: XCircle,
      change: '-3',
      changeType: 'negative'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            change={metric.change}
            changeType={metric.changeType}
            loading={loading}
          />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Present"
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Absent"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Recognitions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Recognitions</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            {recentRecognitions.map((recognition) => (
              <div key={recognition.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{recognition.name}</p>
                    <p className="text-sm text-gray-500">{recognition.roll_no}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(recognition.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500">{recognition.camera_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Attendance Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance Records</h3>
        <AttendanceTable 
          data={recentRecognitions}
          loading={loading}
          showActions={false}
        />
      </div>
    </div>
  );
};

export default Dashboard;
