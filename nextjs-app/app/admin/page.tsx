
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ChatBot from '@/components/ChatBot';

export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        atRiskStudents: 0,
        averageGpa: '0.00',
        highPerformers: 0,
        lowAttendance: 0
    });

    const getRiskLevel = (riskScore = 0) => {
        if (riskScore >= 0.75) return { level: 'Critical', color: 'text-red-700' };
        if (riskScore >= 0.6) return { level: 'High', color: 'text-red-600' };
        if (riskScore >= 0.4) return { level: 'Medium', color: 'text-yellow-600' };
        return { level: 'Low', color: 'text-green-600' };
    };

    useEffect(() => {
        const loadAdminData = async () => {
            // Role check is properly handled in Navbar/Middleware usually, but double check here or just returning null
            if (session?.user?.role !== 'admin') {
                // Should redirect or show 403, but just loading logic here
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/students');
                const students = await res.json();

                setAllStudents(students);

                const totalStudents = students.length;
                let atRiskCount = 0;
                let highPerfCount = 0;
                let lowAttCount = 0;
                let totalGpa = 0;
                let gpaCount = 0;

                students.forEach((s: any) => {
                    const pred = s.predictions?.[0];
                    const risk = pred?.riskScore || 0;
                    if (risk >= 0.6) atRiskCount++;
                    if (pred?.predictedPerformance === 'High') highPerfCount++;
                    if ((s.attendancePercentage || 0) < 75) lowAttCount++;

                    if (s.previousGpa) {
                        totalGpa += s.previousGpa;
                        gpaCount++;
                    }
                });

                const avgGpa = gpaCount > 0 ? (totalGpa / gpaCount).toFixed(2) : '0.00';

                setStats({
                    totalStudents,
                    atRiskStudents: atRiskCount,
                    averageGpa: avgGpa,
                    highPerformers: highPerfCount,
                    lowAttendance: lowAttCount
                });

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            loadAdminData();
        }
    }, [session]);

    if (!session || session.user.role !== 'admin') {
        return <div className="p-8 text-center text-red-600">Access Denied. Admin privileges required.</div>;
    }

    if (loading) {
        return <div className="p-8 text-center">Loading Admin Dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 text-slate-800">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500">
                        AI-driven student performance & risk monitoring
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard title="Total Students" value={stats.totalStudents} color="text-blue-600" />
                    <StatCard title="At-Risk (AI)" value={stats.atRiskStudents} color="text-red-600" />
                    <StatCard title="Average GPA" value={stats.averageGpa} color="text-green-600" />
                    <StatCard title="High Performers" value={stats.highPerformers} color="text-purple-600" />
                    <StatCard title="Low Attendance" value={stats.lowAttendance} color="text-orange-600" />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Student', 'Email', 'GPA', 'Attendance', 'Performance', 'Risk'].map(h => (
                                    <th
                                        key={h}
                                        className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {allStudents.map((student: any, idx: number) => {
                                const pred = student.predictions?.[0];
                                const risk = getRiskLevel(pred?.riskScore || 0);

                                return (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-center font-medium text-slate-900">{student.name}</td>
                                        <td className="px-6 py-4 text-center text-slate-500 text-sm">{student.email}</td>
                                        <td className="px-6 py-4 text-center text-slate-700">{student.previousGpa?.toFixed(2) || 'N/A'}</td>
                                        <td className="px-6 py-4 text-center text-slate-700">{student.attendancePercentage || 0}%</td>
                                        <td className="px-6 py-4 text-center">
                                            {pred ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${pred.predictedPerformance === 'High' ? 'bg-green-100 text-green-800' :
                                                        pred.predictedPerformance === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {pred.predictedPerformance}
                                                </span>
                                            ) : <span className="text-slate-400 italic">No Data</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {pred && (
                                                <span className={`font-semibold ${risk.color}`}>
                                                    {(pred.riskScore * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {allStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">No students found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <ChatBot />

            </div>
        </div>
    );
}

const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
        <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
);
