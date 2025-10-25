import React, { useEffect, useState } from 'react';
import { getAttendance, getStudents } from '../services/api';
import { AttendanceRecordWithName } from '../types';

const UserPage: React.FC = () => {
    const [attendance, setAttendance] = useState<AttendanceRecordWithName[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterRoll, setFilterRoll] = useState('');

    useEffect(() => {
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
        fetchData();
    }, []);

    const filteredAttendance = attendance.filter(record => {
        if (!filterRoll) return true;
        const rollMatch = record.roll_no.toLowerCase().includes(filterRoll.toLowerCase());
        const nameMatch = record.name.toLowerCase().includes(filterRoll.toLowerCase());
        return rollMatch || nameMatch;
    });

    // Group by roll_no
    const groupedAttendance = filteredAttendance.reduce((acc, record) => {
        if (!acc[record.roll_no]) {
            acc[record.roll_no] = [];
        }
        acc[record.roll_no].push(record);
        return acc;
    }, {} as Record<string, AttendanceRecordWithName[]>);

    if (loading) return <div className="text-center p-8">Loading attendance...</div>;
    if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;

    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Attendance Information</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by Roll No or Name..."
                        value={filterRoll}
                        onChange={(e) => setFilterRoll(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedAttendance).map(([rollNo, records]) => (
                    <div key={rollNo} className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="mb-4 pb-4 border-b">
                            <h3 className="text-xl font-semibold text-gray-700">{records[0].name}</h3>
                            <p className="text-gray-500">Roll No: {rollNo}</p>
                            <p className="text-gray-500">Total Attendance: {records.length} days</p>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Date</th>
                                        <th scope="col" className="px-6 py-3">Time</th>
                                        <th scope="col" className="px-6 py-3">Camera ID</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(record => (
                                        <tr key={record.attendance_id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{new Date(record.detected_time).toLocaleTimeString()}</td>
                                            <td className="px-6 py-4">{record.camera_id}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                    Present
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPage;
