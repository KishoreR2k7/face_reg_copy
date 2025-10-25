import React, { useState } from 'react';
import { UserPlus, Upload, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import FileUploader from '../../components/FileUploader';
import { apiEndpoints } from '../../services/api';
import { useForm, useLoading } from '../../hooks/usePolling';
import toast from 'react-hot-toast';

const AddStudent = () => {
  const [files, setFiles] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const { values, handleChange, handleBlur, errors, setError, reset } = useForm({
    name: '',
    roll_no: '',
    email: '',
    department: '',
    year: ''
  });
  const { loading, withLoading } = useLoading();

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
      newErrors.files = 'At least one image is required';
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
        
        // Add image files
        files.forEach((file, index) => {
          formData.append('images', file);
        });

        // Mock response since we're using mock authentication
        // const response = await apiEndpoints.addStudent(formData);
        const response = { data: { student_id: Date.now() } };
        
        toast.success('Student added successfully!');
        
        // Start training
        await startTraining(response.data.student_id);
        
        reset();
        setFiles([]);
      } catch (error) {
        toast.error('Failed to add student');
      }
    });
  };

  const startTraining = async (studentId) => {
    try {
      // Mock training response since we're using mock authentication
      // const response = await apiEndpoints.trainModel();
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
        // Mock training status since we're using mock authentication
        // const response = await apiEndpoints.getTrainingStatus(jobId);
        // const status = response.data.status;
        
        // Mock training completion after 3 seconds
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
          setTrainingProgress(response.data.progress || 0);
        }
      } catch (error) {
        clearInterval(pollInterval);
        setTrainingStatus('failed');
        toast.error('Failed to check training status');
      }
    }, 2000);
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
        <h1 className="text-2xl font-bold text-gray-900">Add Student</h1>
        <p className="text-gray-600">Add a new student to the face recognition system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <UserPlus className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* Image Upload */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <Upload className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Student Photos</h3>
          </div>
          
          <FileUploader
            onFilesSelect={setFiles}
            multiple={true}
            maxFiles={5}
            accept="image/*"
          />
          
          {errors.files && (
            <p className="mt-2 text-sm text-red-600">{errors.files}</p>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <p>• Upload 3-5 clear photos of the student</p>
            <p>• Ensure good lighting and face visibility</p>
            <p>• Supported formats: JPG, PNG, JPEG</p>
          </div>
        </div>

        {/* Training Status */}
        {trainingStatus && (
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              {getTrainingStatusIcon()}
              <h3 className="text-lg font-semibold text-gray-900">
                Training Status
              </h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{getTrainingStatusText()}</p>
              
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
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              reset();
              setFiles([]);
            }}
            className="btn-secondary"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading || trainingStatus === 'training'}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Student...' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
