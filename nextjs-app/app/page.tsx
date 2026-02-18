
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ChatBot from '@/components/ChatBot';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    atRiskStudents: 0,
    averageGpa: '0.00'
  });

  const getRiskLevel = (riskScore = 0) => {
    if (riskScore >= 0.6) return { level: 'High', color: 'text-red-700', bg: 'bg-red-500' };
    if (riskScore >= 0.4) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-500' };
  };

  const generatePrediction = async () => {
    // For the current user
    const currentUser = allUsers.find(u => u.email === session?.user?.email);
    if (!currentUser) return;

    try {
      setLoading(true);
      // Recalculate based on current data
      const predictionPayload = {
        student_id: currentUser.id,
        attendance_percentage: currentUser.attendancePercentage,
        internal_marks: currentUser.internalMarks,
        assignment_scores: currentUser.assignmentScores,
        lab_performance: currentUser.labPerformance,
        previous_gpa: currentUser.previousGpa,
        study_hours: currentUser.studyHours,
        socio_academic_factors: currentUser.socioAcademicFactors ? JSON.parse(currentUser.socioAcademicFactors) : {},
        participation_metrics: currentUser.participationMetrics
      };

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionPayload)
      });

      const newPred = await res.json();

      if (newPred && !newPred.error) {
        window.location.reload();
      }

    } catch (e) {
      console.error("Prediction error", e);
    } finally {
      setLoading(false);
    }
  };

  const currentUserStudent = allUsers.find(u => u.email === session?.user?.email);
  const currentRisk = currentUserStudent?.predictions?.[0]?.riskScore || 0;

  const riskData = [
    { name: 'Risk', value: currentRisk * 100 },
    { name: 'Safe', value: 100 - (currentRisk * 100) }
  ];
  const RISK_COLORS = ['#ef4444', '#22c55e'];


  useEffect(() => {
    const loadDashboardData = async () => {
      // If no session, still load data for demo/public dashboard if feasible?
      // Original Dashboard.js checks for user. If not user, it shows the Landing Page view.
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch students and predictions from API
        const res = await fetch('/api/students');
        const students = await res.json();

        if (students.error) {
          console.error(students.error);
          setLoading(false);
          return;
        }

        const studentsWithDetails = students.filter((s: any) =>
          s.previousGpa !== null && s.previousGpa !== undefined
        );

        setAllUsers(studentsWithDetails);

        // Calculate Stats
        const totalStudents = studentsWithDetails.length;
        let atRiskCount = 0;
        let totalGpa = 0;
        let gpaCount = 0;

        const trends: any[] = [];

        studentsWithDetails.forEach((student: any) => {
          const pred = student.predictions && student.predictions[0];
          const risk = pred?.riskScore || 0;
          if (risk >= 0.6) atRiskCount++;

          if (typeof student.previousGpa === 'number') {
            totalGpa += student.previousGpa;
            gpaCount++;
          }

          // Generate Mock Trends if it's the logged-in user
          if (session.user?.email === student.email) {
            // Determine mock history based on current
            const currentGpa = student.previousGpa || 3.0;
            const attendance = student.attendancePercentage || 85;
            const riskScore = risk;

            trends.push(
              { month: 'Jan', gpa: Number(currentGpa), attendance: Number(attendance), riskScore: Number(riskScore) },
              { month: 'Feb', gpa: Number(Math.min(4.0, currentGpa + (Math.random() * 0.2 - 0.1))), attendance: Number(Math.min(100, attendance + 2)), riskScore: Number(riskScore) },
              { month: 'Mar', gpa: Number(Math.min(4.0, currentGpa + (Math.random() * 0.2 - 0.1))), attendance: Number(Math.min(100, attendance - 1)), riskScore: Number(riskScore) },
              { month: 'Apr', gpa: Number(currentGpa), attendance: Number(attendance), riskScore: Number(riskScore) }
            );
          }
        });

        const avgGpa = gpaCount > 0 ? (totalGpa / gpaCount).toFixed(2) : '0.00';

        setStats({
          totalStudents,
          atRiskStudents: atRiskCount,
          averageGpa: avgGpa
        });

        setPerformanceData(trends);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [session]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-xl text-slate-600">Loading Dashboard...</div>
      </div>
    );
  }

  // Not Logged In View - Matches 'Landing Page' style of original
  if (!session?.user) {
    return (
      <div className="container mx-auto p-6 text-slate-800">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Student Performance System</h1>

        <div className="bg-white p-12 rounded-xl shadow-lg mb-8 max-w-4xl mx-auto border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Welcome to Your Academic Success Platform</h2>
            <p className="text-slate-500 mb-8 text-lg">Track performance, get predictions, and improve your academic journey</p>
            <div className="flex justify-center space-x-6">
              {/* Original buttons were handled by Login/Signup modals trigger */}
              <button
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
              // In real app, these would trigger context modals. 
              // For now user knows to use Navbar.
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-md text-center border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Performance Tracking</h3>
            <p className="text-slate-500">Monitor your academic progress with detailed analytics</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">AI Predictions</h3>
            <p className="text-slate-500">Get personalized performance predictions</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">💡</div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Smart Recommendations</h3>
            <p className="text-slate-500">Receive actionable improvement suggestions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 text-slate-800">
      <h1 className="text-3xl font-bold text-slate-900">Student Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-2 text-slate-700">Students with Academic Details</h2>
          <p className="text-sm text-slate-500 mb-4">Students participating in tracking</p>
          <p className="text-4xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <h2 className="text-lg font-semibold mb-2 text-slate-700">At-Risk Students</h2>
          <p className="text-sm text-slate-500 mb-4">Students flagged for attention</p>
          <p className="text-4xl font-bold text-red-600">{stats.atRiskStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <h2 className="text-lg font-semibold mb-2 text-slate-700">Average GPA</h2>
          <p className="text-sm text-slate-500 mb-4">Class wide academic average</p>
          <p className="text-4xl font-bold text-green-600">{stats.averageGpa}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Analysis Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Risk Analysis</h2>
            {currentUserStudent && (
              <button
                onClick={generatePrediction}
                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition shadow-sm"
              >
                🔄 Regenerate Prediction
              </button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center h-80">
            {currentUserStudent ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      dataKey="value"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RISK_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-sm text-slate-400">Risk Score</span>
                  <span className={`text-4xl font-bold ${currentRisk >= 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                    {(currentRisk * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center">
                <p>No academic data available.</p>
                <p className="text-sm">Add details to see risk analysis.</p>
              </div>
            )}
          </div>
          {currentUserStudent?.predictions?.[0] && (
            <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-slate-600 border border-slate-100">
              <strong>Prediction: </strong> {currentUserStudent.predictions[0].predictedPerformance} Performance
            </div>
          )}
        </div>

        {/* Performance Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Your Performance Trends</h2>
          {performanceData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" domain={[0, 4]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="gpa" stroke="#4F46E5" name="GPA" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="attendance" stroke="#10B981" name="Attendance %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg h-80 flex flex-col justify-center items-center">
              <p className="mb-2 font-medium">No performance data available.</p>
              <p className="text-sm">Add academic details to generate analysis.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Class Performance</h2>
          {allUsers.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {allUsers.map((student: any, index: number) => {
                const pred = student.predictions && student.predictions[0];
                const risk = getRiskLevel(pred?.riskScore || 0);

                return (
                  <div
                    key={index}
                    className={`border-l-4 p-4 rounded-lg bg-slate-50 hover:bg-white border-slate-200 transition-colors shadow-sm ${risk.level === 'High' ? 'border-l-red-500' :
                      risk.level === 'Medium' ? 'border-l-yellow-500' :
                        'border-l-green-500'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-semibold ${risk.color}`}>
                          {student.name || student.email}
                        </h3>
                        <p className="text-xs text-slate-500 mb-1">{student.email}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                          <span>GPA: <b>{student.previousGpa?.toFixed(2)}</b></span>
                          <span>Att: <b>{student.attendancePercentage}%</b></span>
                        </div>
                      </div>
                      <div className="text-right">
                        {pred && (
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${risk.bg}`}>
                            Risk: {(pred.riskScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No students have added details yet.</p>
            </div>
          )}
        </div>

        {/* At-Risk Students List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-red-700 flex items-center gap-2">
            ⚠️ At-Risk Students
          </h2>
          {allUsers.filter((s: any) => {
            const pred = s.predictions?.[0];
            return pred && pred.riskScore >= 0.5;
          }).length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {allUsers.filter((s: any) => {
                const pred = s.predictions?.[0];
                return pred && pred.riskScore >= 0.5;
              }).map((student: any, index: number) => {
                const pred = student.predictions[0];
                return (
                  <div key={index} className="border border-red-100 bg-red-50 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-red-800">{student.name}</h3>
                        <p className="text-xs text-red-600 mb-1">{student.email}</p>
                        <p className="text-sm text-red-700">
                          <b>GPA: {student.previousGpa?.toFixed(2)}</b> • Att: {student.attendancePercentage}%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                          Risk: {(pred.riskScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-green-50 rounded-lg border border-green-100">
              <p className="text-green-700 font-semibold mb-1">All Good! 🎉</p>
              <p className="text-sm">No at-risk students found.</p>
            </div>
          )}
        </div>
      </div>

      <ChatBot />
    </div>
  );
}
