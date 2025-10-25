
import React, { useEffect, useState, useMemo } from 'react';
import { getAttendance, getStudents, BASE_URL } from '../services/api';
import { AttendanceRecordWithName, Student } from '../types';

interface StudentDetailModalProps {
    student: Student | null;
    attendance: AttendanceRecordWithName[];
    onClose: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, attendance, onClose }) => {
    if (!student) return null;

    const studentAttendance = attendance.filter(a => a.roll_no === student.roll_no);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-700">Student Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-600 mb-2"><span className="font-semibold">Roll Number:</span> {student.roll_no}</p>
                        <p className="text-gray-600 mb-2"><span className="font-semibold">Name:</span> {student.name}</p>
                        <p className="text-gray-600"><span className="font-semibold">Total Attendance:</span> {studentAttendance.length} days</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Date</th>
                                    <th scope="col" className="px-4 py-3">Time</th>
                                    <th scope="col" className="px-4 py-3">Camera ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentAttendance.map(record => (
                                    <tr key={record.attendance_id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-4">{new Date(record.detected_time).toLocaleTimeString()}</td>
                                        <td className="px-4 py-4">{record.camera_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AttendanceLogPage: React.FC = () => {
    const [attendance, setAttendance] = useState<AttendanceRecordWithName[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterName, setFilterName] = useState('');
    const [filterRoll, setFilterRoll] = useState('');
    const [updatingRecords, setUpdatingRecords] = useState<Set<number>>(new Set());
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attendanceData, studentsData] = await Promise.all([getAttendance(), getStudents()]);
            const studentsMap = new Map<string, string>(studentsData.map(s => [s.roll_no, s.name]));
            const attendanceWithNames = attendanceData.map(record => ({
                ...record,
                name: studentsMap.get(record.roll_no) || 'Unknown Student'
            }));
            setAttendance(attendanceWithNames.sort((a, b) => new Date(b.detected_time).getTime() - new Date(a.detected_time).getTime()));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const filteredAttendance = useMemo(() => {
        return attendance.filter(record => {
            const nameMatch = record.name.toLowerCase().includes(filterName.toLowerCase());
            const rollMatch = record.roll_no.toLowerCase().includes(filterRoll.toLowerCase());
            return nameMatch && rollMatch;
        });
    }, [attendance, filterName, filterRoll]);

    const handleDeleteAttendance = async (attendanceId: number) => {
        if (!window.confirm('Are you sure you want to mark this as absent (delete this record)?')) {
            return;
        }

        setUpdatingRecords(prev => new Set(prev).add(attendanceId));
        
        try {
            const token = localStorage.getItem('authToken');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(`${BASE_URL}/attendance/${attendanceId}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error('Failed to delete attendance record');
            }

            fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete attendance record');
        } finally {
            setUpdatingRecords(prev => {
                const next = new Set(prev);
                next.delete(attendanceId);
                return next;
            });
        }
    };

    const handleStudentClick = (rollNo: string) => {
        fetch(`${BASE_URL}/students`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
            .then(res => res.json())
            .then(students => {
                const student = students.find((s: Student) => s.roll_no === rollNo);
                if (student) {
                    setSelectedStudent(student);
                    setShowDetailModal(true);
                }
            });
    };

    if (loading) return <div className="text-center p-8">Loading attendance logs...</div>;
    if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;

    return (
        <>
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold text-gray-700">Attendance Records</h2>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                         <input
                            type="text"
                            placeholder="Filter by Name..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                            type="text"
                            placeholder="Filter by Roll No..."
                            value={filterRoll}
                            onChange={(e) => setFilterRoll(e.target.value)}
                            className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Roll No</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Time</th>
                                <th scope="col" className="px-6 py-3">Camera ID</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendance.map(record => (
                                <tr key={record.attendance_id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => handleStudentClick(record.roll_no)}>
                                        {record.roll_no}
                                    </td>
                                    <td className="px-6 py-4">{record.name}</td>
                                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{new Date(record.detected_time).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4">{record.camera_id}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDeleteAttendance(record.attendance_id)}
                                            disabled={updatingRecords.has(record.attendance_id)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:bg-green-300 mr-2"
                                        >
                                            {updatingRecords.has(record.attendance_id) ? 'Updating...' : 'Present ✓'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAttendance(record.attendance_id)}
                                            disabled={updatingRecords.has(record.attendance_id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:bg-red-300"
                                        >
                                            Mark Absent
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredAttendance.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No matching records found.</p>
                    )}
                </div>
            </div>
        </div>
        
        {showDetailModal && (
            <StudentDetailModal
                student={selectedStudent}
                attendance={attendance}
                onClose={() => setShowDetailModal(false)}
            />
        )}
        </>
    );
};

export default AttendanceLogPage;
