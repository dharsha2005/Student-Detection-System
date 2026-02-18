
import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Plus, Search, Eye } from 'lucide-react';

async function getStudents() {
    // Use DB directly for Server Component efficiency
    return await db.student.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            predictions: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });
}

export default async function StudentsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const students = await getStudents();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
                    <p className="text-slate-500">Manage student records and performance data</p>
                </div>
                <Link
                    href="/students/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Student
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled // Search implementation would require client side logic or search params
                        />
                    </div>
                    <span className="text-xs text-slate-400">Search coming in next update</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">ID/Email</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Major</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Performance</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No students found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => {
                                    const latestPrediction = student.predictions[0];
                                    const riskColor =
                                        latestPrediction?.predictedPerformance === 'High' ? 'text-green-600 bg-green-50' :
                                            latestPrediction?.predictedPerformance === 'Medium' ? 'text-blue-600 bg-blue-50' :
                                                'text-red-600 bg-red-50';

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                <div className="flex flex-col">
                                                    <span>{student.email}</span>
                                                    <span className="text-xs text-slate-400">ID: {student.id.slice(0, 8)}...</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{student.major}</td>
                                            <td className="px-6 py-4">
                                                {latestPrediction ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskColor}`}>
                                                        {latestPrediction.predictedPerformance}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
