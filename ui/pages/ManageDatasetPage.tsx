import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';

interface DatasetPerson {
    name: string;
    image_count: number;
    images: string[];
}

const ManageDatasetPage: React.FC = () => {
    const [persons, setPersons] = useState<DatasetPerson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [newPersonName, setNewPersonName] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingProgress, setTrainingProgress] = useState('');

    const fetchPersons = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${BASE_URL}/dataset/list`, { headers });
            
            if (!response.ok) {
                throw new Error('Failed to fetch dataset');
            }
            
            const data = await response.json();
            setPersons(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch dataset');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersons();
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
        setIsTraining(true);
        setTrainingProgress('Uploading images...');

        try {
            if (!selectedFiles || selectedFiles.length === 0) {
                throw new Error('Please select at least one image');
            }

            const formData = new FormData();
            formData.append('label', newPersonName);
            
            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('images', selectedFiles[i]);
            }

            setTrainingProgress('Uploading images and training model...');

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
                setFormSuccess(`Successfully added ${newPersonName} and trained model!`);
                setTrainingProgress('');
            } else {
                setFormSuccess(`Added ${newPersonName} but training failed: ${result.training_error}`);
                setTrainingProgress('');
            }
            
            setNewPersonName('');
            setSelectedFiles(null);
            
            // Reset file input
            const fileInput = document.getElementById('images') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
            fetchPersons(); // Refresh the list
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to upload images');
            setTrainingProgress('');
        } finally {
            setIsSubmitting(false);
            setIsTraining(false);
        }
    };

    const handleDeletePerson = async (personName: string) => {
        if (!window.confirm(`Are you sure you want to delete ${personName} and all their images?`)) {
            return;
        }

        setIsTraining(true);
        setTrainingProgress('Deleting person and retraining model...');

        try {
            const token = localStorage.getItem('authToken');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${BASE_URL}/dataset/${encodeURIComponent(personName)}`, {
                method: 'DELETE',
                headers
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Delete failed');
            }

            if (result.training_completed) {
                setFormSuccess(`Successfully deleted ${personName} and retrained model!`);
            } else {
                setFormSuccess(`Deleted ${personName} but retraining failed: ${result.training_error}`);
            }
            
            setTrainingProgress('');
            fetchPersons(); // Refresh the list
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to delete person');
            setTrainingProgress('');
        } finally {
            setIsTraining(false);
        }
    };

    const handleRetrain = async () => {
        setIsTraining(true);
        setTrainingProgress('Retraining model...');
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

            setFormSuccess('Model retrained successfully');
            setTrainingProgress('');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to retrain model');
            setTrainingProgress('');
        } finally {
            setIsTraining(false);
        }
    };

    return (
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Person</h2>
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
                        <label htmlFor="personName" className="block text-sm font-medium text-gray-700">Person Name</label>
                        <input 
                            type="text" 
                            id="personName" 
                            value={newPersonName} 
                            onChange={(e) => setNewPersonName(e.target.value)} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images</label>
                        <input 
                            type="file" 
                            id="images" 
                            multiple 
                            accept="image/*"
                            onChange={handleFileChange}
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Select multiple images (JPG, PNG)</p>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || isTraining} 
                        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-indigo-300"
                    >
                        {isSubmitting ? 'Uploading...' : isTraining ? 'Training...' : 'Add Person & Train'}
                    </button>
                </form>
                
                <div className="mt-4 pt-4 border-t">
                    <button 
                        onClick={handleRetrain}
                        disabled={isTraining}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                    >
                        {isTraining ? 'Training...' : 'Retrain Model'}
                    </button>
                </div>
            </div>
            
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Dataset Persons</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Images</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {persons.map(person => (
                                <tr key={person.name} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{person.name}</td>
                                    <td className="px-6 py-4">{person.image_count} images</td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => handleDeletePerson(person.name)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Delete
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

export default ManageDatasetPage;
