
import { db } from '@/lib/db';
import { StatCard } from '@/components/StatCard';
import { PerformanceChart } from '@/components/PerformanceChart';
import { Users, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getDashboardStats() {
    const totalStudents = await db.student.count();

    const predictions = await db.prediction.findMany({
        select: { predictedPerformance: true, riskScore: true },
    });

    const performanceDistribution = {
        High: 0,
        Medium: 0,
        Low: 0,
    };

    let totalRiskScore = 0;

    predictions.forEach(p => {
        const perf = p.predictedPerformance as 'High' | 'Medium' | 'Low';
        if (performanceDistribution[perf] !== undefined) {
            performanceDistribution[perf]++;
        }
        totalRiskScore += p.riskScore;
    });

    const averageRiskScore = predictions.length > 0 ? totalRiskScore / predictions.length : 0;
    const atRiskCount = performanceDistribution['Low'];

    return {
        totalStudents,
        atRiskCount,
        averageRiskScore,
        performanceDistribution,
    };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const stats = await getDashboardStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back, {session.user?.name || 'User'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    label="At-Risk Students"
                    value={stats.atRiskCount}
                    icon={AlertTriangle}
                    color="red"
                    trend={stats.atRiskCount > 0 ? "Requires Attention" : "All Good"}
                />
                <StatCard
                    label="Average Risk Score"
                    value={`${(stats.averageRiskScore * 100).toFixed(1)}%`}
                    icon={Activity}
                    color="purple"
                />
                <StatCard
                    label="High Performers"
                    value={stats.performanceDistribution.High}
                    icon={TrendingUp}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <PerformanceChart data={stats.performanceDistribution} />
                </div>

                {/* Recent Activity or Quick Actions could go here */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="font-medium text-slate-800">Add New Student</p>
                            <p className="text-sm text-slate-500 mb-3">Register a new student and generate AI predictions.</p>
                            <a href="/students/add" className="text-sm font-medium text-blue-600 hover:underline">Go to Registration &rarr;</a>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="font-medium text-slate-800">View Students List</p>
                            <p className="text-sm text-slate-500 mb-3">Browse and filter existing student records.</p>
                            <a href="/students" className="text-sm font-medium text-blue-600 hover:underline">View All Students &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
