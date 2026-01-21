import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        const studentsRes = await axios.get('http://localhost:8004/api/students/');
        const predictionsRes = await axios.get('http://localhost:8004/api/predictions/');

        setStudents(studentsRes.data || []);
        setPredictions(predictionsRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAnalyticsData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // ================= METRICS =================
  const metrics = useMemo(() => {
    const studentsWithPredictionsArr = students.filter(s =>
      predictions.some(p => p.student_id === s._id)
    );

    const riskLevels = { low: 0, medium: 0, high: 0 };
    const performanceLevels = { high: 0, medium: 0, low: 0 };

    studentsWithPredictionsArr.forEach(student => {
      const prediction = predictions.find(p => p.student_id === student._id);
      if (!prediction) return;

      // Risk
      if (prediction.risk_score >= 0.6) riskLevels.high++;
      else if (prediction.risk_score >= 0.4) riskLevels.medium++;
      else riskLevels.low++;

      // Performance
      if (prediction.predicted_performance === 'High') performanceLevels.high++;
      else if (prediction.predicted_performance === 'Medium') performanceLevels.medium++;
      else performanceLevels.low++;
    });

    return {
      totalStudents: students.length,
      studentsWithPredictions: studentsWithPredictionsArr.length,
      riskLevels,
      performanceLevels,
      averageGpa: students.reduce((sum, s) => sum + (s.previous_gpa || 0), 0) / students.length || 0,
      averageAttendance: students.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) / students.length || 0,
      averageStudyHours: students.reduce((sum, s) => sum + (s.study_hours || 0), 0) / students.length || 0
    };
  }, [students, predictions]);

  // ================= ACCESS DENIED =================
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Admin privileges required</p>
        </div>
      </div>
    );
  }

  // ================= CHART DATA =================
  const riskData = [
    { name: 'Low Risk', value: metrics.riskLevels.low, color: '#10B981' },
    { name: 'Medium Risk', value: metrics.riskLevels.medium, color: '#F59E0B' },
    { name: 'High Risk', value: metrics.riskLevels.high, color: '#EF4444' }
  ].filter(i => i.value > 0);

  const performanceData = [
    { name: 'High', value: metrics.performanceLevels.high, color: '#10B981' },
    { name: 'Medium', value: metrics.performanceLevels.medium, color: '#F59E0B' },
    { name: 'Low', value: metrics.performanceLevels.low, color: '#EF4444' }
  ].filter(i => i.value > 0);

  const barData = students.slice(0, 10).map(s => ({
    name: s.name || 'Unknown',
    gpa: s.previous_gpa || 0,
    attendance: s.attendance_percentage || 0
  }));

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  // ================= ERROR =================
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-red-600 text-xl font-bold">{error}</h1>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8">Analytics Dashboard</h1>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Metric title="Total Students" value={metrics.totalStudents} />
        <Metric title="With Predictions" value={metrics.studentsWithPredictions} />
        <Metric title="Average GPA" value={metrics.averageGpa.toFixed(2)} />
        <Metric title="Avg Attendance" value={`${metrics.averageAttendance.toFixed(1)}%`} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Risk Distribution">
          <PieChart width={300} height={300}>
            <Pie data={riskData} dataKey="value" outerRadius={100} label>
              {riskData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Performance Distribution">
          <PieChart width={300} height={300}>
            <Pie data={performanceData} dataKey="value" outerRadius={100} label>
              {performanceData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>
      </div>

      {/* BAR CHART */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">GPA & Attendance</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="gpa" fill="#6366F1" />
            <Bar dataKey="attendance" fill="#22C55E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="mt-8 bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'GPA', 'Attendance', 'Risk', 'Performance', 'Action'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map(s => {
              const p = predictions.find(x => x.student_id === s._id);
              return (
                <tr key={s._id}>
                  <td className="px-6 py-4">{s.name}</td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4">{s.previous_gpa?.toFixed(2) || 'N/A'}</td>
                  <td className="px-6 py-4">{s.attendance_percentage || 0}%</td>
                  <td className="px-6 py-4">{p ? p.risk_score.toFixed(2) : 'N/A'}</td>
                  <td className="px-6 py-4">{p?.predicted_performance || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/students/${s._id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ================= REUSABLE COMPONENTS =================
const Metric = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-sm text-gray-500">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default Analytics;
