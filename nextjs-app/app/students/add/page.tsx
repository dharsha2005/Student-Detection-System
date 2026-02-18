
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddStudentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        enrollment_year: new Date().getFullYear(),
        major: 'Computer Science',
        attendance_percentage: 75,
        internal_marks: 70,
        assignment_scores: 70,
        lab_performance: 70,
        previous_gpa: 3.0,
        study_hours: 10,
        participation_metrics: 50,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'name' || name === 'email' || name === 'major' ? value : Number(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to create student');

            router.push('/students');
            router.refresh(); // Refresh server components
        } catch (error) {
            console.error(error);
            alert('Error creating student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/students" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Add New Student</h1>
                    <p className="text-slate-500">Enter student details for AI performance prediction</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <h3 className="col-span-full font-semibold text-slate-800 border-b border-slate-100 pb-2">Academic Profile</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <input
                            type="text" name="name" required
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.name} onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <input
                            type="email" name="email" required
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.email} onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Major</label>
                        <select
                            name="major"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.major} onChange={handleChange}
                        >
                            <option>Computer Science</option>
                            <option>Information Technology</option>
                            <option>Electronics</option>
                            <option>Mechanical Engineering</option>
                            <option>Civil Engineering</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Enrollment Year</label>
                        <input
                            type="number" name="enrollment_year"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.enrollment_year} onChange={handleChange}
                        />
                    </div>

                    <h3 className="col-span-full font-semibold text-slate-800 border-b border-slate-100 pb-2 mt-4">Performance Metrics (For AI)</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Attendance (%)</label>
                        <input
                            type="number" name="attendance_percentage" min="0" max="100"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.attendance_percentage} onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Internal Marks (avg)</label>
                        <input
                            type="number" name="internal_marks" min="0" max="100"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.internal_marks} onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Assignment Scores (avg)</label>
                        <input
                            type="number" name="assignment_scores" min="0" max="100"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.assignment_scores} onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Lab Performance (avg)</label>
                        <input
                            type="number" name="lab_performance" min="0" max="100"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.lab_performance} onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Previous GPA (0-4.0)</label>
                        <input
                            type="number" name="previous_gpa" min="0" max="4.0" step="0.1"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.previous_gpa} onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Study Hours / Week</label>
                        <input
                            type="number" name="study_hours" min="0" max="168"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.study_hours} onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Participation Metric (0-100)</label>
                        <input
                            type="number" name="participation_metrics" min="0" max="100"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.participation_metrics} onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save Student'}
                    </button>
                </div>
            </form>
        </div>
    );
}
