import React, { useState, useEffect } from 'react';
import { Brain, Upload, Play, CheckCircle, AlertCircle, Users, Video, Image } from 'lucide-react';
import FileUploader from '../../components/FileUploader';
import { apiEndpoints } from '../../services/api';
import { useForm, useLoading } from '../../hooks/usePolling';
import toast from 'react-hot-toast';

const TrainingCenter = () => {
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [files, setFiles] = useState([]);
  const { values, handleChange, handleBlur, errors, setError, reset } = useForm({
    name: '',
    roll_no: '',
    email: '',
    department: '',
    year: ''
  });
  const { loading, withLoading } = useLoading();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Mock students data
      setStudents([
        { id: 1, name: 'John Doe', roll_no: 'CS001', department: 'Computer Science', year: '3rd Year', trained: true },
        { id: 2, name: 'Jane Smith', roll_no: 'CS002', department: 'Computer Science', year: '2nd Year', trained: false },
        { id: 3, name: 'Bob Johnson', roll_no: 'CS003', department: 'Electronics', year: '4th Year', trained: true }
      ]);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!values.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!values.roll_no.trim()) {
      newErrors.roll_no = 'Roll number is required';
    }
    
    if (!values.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!values.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!values.year.trim()) {
      newErrors.year = 'Year is required';
    }
    
    if (files.length === 0) {
      newErrors.files = 'At least one image or video is required';
    }
    
    Object.keys(newErrors).forEach(key => setError(key, newErrors[key]));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    await withLoading(async () => {
      try {
        const formData = new FormData();
        
        // Add student information
        formData.append('name', values.name);
        formData.append('roll_no', values.roll_no);
        formData.append('email', values.email);
        formData.append('department', values.department);
        formData.append('year', values.year);
        
        // Add image/video files
        files.forEach((file, index) => {
          formData.append('files', file);
        });

        // Mock API call
        const response = { data: { student_id: Date.now() } };
        
        toast.success('Student added successfully!');
        
        // Start training
        await startTraining(response.data.student_id);
        
        reset();
        setFiles([]);
        fetchStudents(); // Refresh students list
      } catch (error) {
        toast.error('Failed to add student');
      }
    });
  };

  const startTraining = async (studentId) => {
    try {
      // Mock training response
      const response = { data: { job_id: `job_${Date.now()}` } };
      const jobId = response.data.job_id;
      
      setTrainingStatus('training');
      toast.success('Training started!');
      
      // Poll training status
      pollTrainingStatus(jobId);
    } catch (error) {
      toast.error('Failed to start training');
    }
  };

  const pollTrainingStatus = async (jobId) => {
    const pollInterval = setInterval(async () => {
      try {
        // Mock training completion after 5 seconds
        const status = 'completed';
        const progress = 100;
        
        if (status === 'completed') {
          setTrainingStatus('completed');
          setTrainingProgress(100);
          clearInterval(pollInterval);
          toast.success('Training completed successfully!');
        } else if (status === 'failed') {
          setTrainingStatus('failed');
          clearInterval(pollInterval);
          toast.error('Training failed');
        } else if (status === 'training') {
          setTrainingProgress(progress || 0);
        }
      } catch (error) {
        clearInterval(pollInterval);
        setTrainingStatus('failed');
        toast.error('Failed to check training status');
      }
    }, 1000);
  };

  const retrainStudent = async (studentId) => {
    try {
      setTrainingStatus('training');
      setTrainingProgress(0);
      toast.success('Retraining started!');
      
      // Mock retraining
      setTimeout(() => {
        setTrainingStatus('completed');
        setTrainingProgress(100);
        toast.success('Retraining completed!');
      }, 3000);
    } catch (error) {
      toast.error('Failed to retrain student');
    }
  };

  const getTrainingStatusIcon = () => {
    switch (trainingStatus) {
      case 'training':
        return <Brain className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrainingStatusText = () => {
    switch (trainingStatus) {
      case 'training':
        return 'Training in progress...';
      case 'completed':
        return 'Training completed';
      case 'failed':
        return 'Training failed';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Training Center</h1>
        <p className="text-gray-600">Add students and train face recognition models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Student Form */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Add New Student</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="roll_no"
                  value={values.roll_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.roll_no ? 'border-red-500' : ''}`}
                  placeholder="Enter roll number"
                />
                {errors.roll_no && (
                  <p className="mt-1 text-sm text-red-600">{errors.roll_no}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={values.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.department ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={values.year}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.year ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Photos/Videos *
              </label>
              <FileUploader
                onFilesSelect={setFiles}
                multiple={true}
                maxFiles={10}
                accept="image/*,video/*"
              />
              {errors.files && (
                <p className="mt-2 text-sm text-red-600">{errors.files}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                <p>• Upload 5-10 clear photos or videos of the student</p>
                <p>• Ensure good lighting and face visibility</p>
                <p>• Supported formats: JPG, PNG, MP4, AVI</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || trainingStatus === 'training'}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Student...' : 'Add Student & Train'}
            </button>
          </form>
        </div>

        {/* Training Status */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <Brain className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Training Status</h3>
          </div>
          
          {trainingStatus ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getTrainingStatusIcon()}
                <span className="text-lg font-medium">{getTrainingStatusText()}</span>
              </div>
              
              {trainingStatus === 'training' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No training in progress</p>
              <p className="text-sm text-gray-400">Add a student to start training</p>
            </div>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Trained Students</h3>
          <span className="text-sm text-gray-500">{students.length} students</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Roll No</th>
                <th className="table-header">Department</th>
                <th className="table-header">Year</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{student.name}</td>
                  <td className="table-cell font-mono">{student.roll_no}</td>
                  <td className="table-cell">{student.department}</td>
                  <td className="table-cell">{student.year}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.trained 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.trained ? 'Trained' : 'Not Trained'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => retrainStudent(student.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Retrain
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingCenter;
