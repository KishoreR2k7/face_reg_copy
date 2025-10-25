
import React, { useState, useEffect } from 'react';
import { getStudents, addStudent } from '../services/api';
import { Student } from '../types';
import { BASE_URL } from '../services/api';

const ManageStudentsPage: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [newRollNo, setNewRollNo] = useState('');
    const [newName, setNewName] = useState('');
    const [newDate, setNewDate] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingProgress, setTrainingProgress] = useState('');

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await getStudents();
            setStudents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(e.target.files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setIsSubmitting(true);
        
        try {
            // First add the student
            await addStudent(newRollNo, newName);
            
            // If files are selected, upload them and train
            if (selectedFiles && selectedFiles.length > 0) {
                setIsTraining(true);
                setTrainingProgress('Uploading dataset...');
                
                const formData = new FormData();
                formData.append('label', newRollNo);
                
                for (let i = 0; i < selectedFiles.length; i++) {
                    formData.append('images', selectedFiles[i]);
                }

                const token = localStorage.getItem('authToken');
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;
                
                const response = await fetch(`${BASE_URL}/dataset/upload`, {
                    method: 'POST',
                    headers,
                    body: formData
                });

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Upload failed');
                }

                if (result.training_completed) {
                    setTrainingProgress('');
                    setFormSuccess(`Student added and trained successfully!`);
                } else {
                    setFormSuccess(`Student added but training failed: ${result.training_error}`);
                }
            } else {
                setFormSuccess('Student added successfully');
            }
            
            setNewName('');
            setNewRollNo('');
            setNewDate('');
            setSelectedFiles(null);
            
            // Reset file input
            const fileInput = document.getElementById('dataset') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
            fetchStudents();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to add student');
        } finally {
            setIsSubmitting(false);
            setIsTraining(false);
        }
    };

    const handleTrain = async () => {
        setIsTraining(true);
        setTrainingProgress('Training model...');
        
        try {
            const token = localStorage.getItem('authToken');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(`${BASE_URL}/dataset/train`, {
                method: 'POST',
                headers
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Training failed');
            }

            if (result.training_completed) {
                setFormSuccess('Model trained successfully');
            } else {
                setFormError(`Training failed: ${result.training_error}`);
            }
            setTrainingProgress('');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to train model');
            setTrainingProgress('');
        } finally {
            setIsTraining(false);
        }
    };

    return (
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Student</h2>
                {formError && <p className="text-red-500 mb-4">{formError}</p>}
                {formSuccess && <p className="text-green-500 mb-4">{formSuccess}</p>}
                {isTraining && trainingProgress && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-blue-700">{trainingProgress}</span>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">Roll Number</label>
                        <input type="text" id="rollNo" value={newRollNo} onChange={(e) => setNewRollNo(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Student Name</label>
                        <input type="text" id="name" value={newName} onChange={(e) => setNewName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" id="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="dataset" className="block text-sm font-medium text-gray-700">Dataset (Images)</label>
                        <input 
                            type="file" 
                            id="dataset" 
                            multiple 
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Select images or videos</p>
                    </div>
                    <button type="submit" disabled={isSubmitting || isTraining} className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-indigo-300">
                        {isSubmitting ? 'Adding...' : isTraining ? 'Training...' : 'Add Student & Train'}
                    </button>
                </form>
                
                <div className="mt-4 pt-4 border-t">
                    <button 
                        onClick={handleTrain}
                        disabled={isTraining}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                    >
                        {isTraining ? 'Training...' : 'Train Model'}
                    </button>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Registered Students</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Roll No</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.roll_no} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{student.roll_no}</td>
                                    <td className="px-6 py-4">{student.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageStudentsPage;
