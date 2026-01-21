import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Charts
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

const StudentProfile = () => {
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ---------------- LOAD STUDENT DATA ---------------- */
  useEffect(() => {
    if (!user) {
      setError('Please login to view your profile');
      setLoading(false);
      return;
    }

    const loadStudent = async () => {
      try {
        // 1️⃣ LocalStorage
        const localData = localStorage.getItem(
          `academic_${user.email.toLowerCase()}`
        );

        if (localData) {
          setStudent({
            id: user.id,
            name: user.name,
            email: user.email,
            ...JSON.parse(localData),
          });
          setLoading(false);
          return;
        }

        // 2️⃣ Backend
        const res = await axios.get(
          `http://localhost:8004/api/students/by-user/${user.id}`
        );
        setStudent(res.data);
      } catch (err) {
        setError('Please add your academic details first');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [user]);

  /* ---------------- GENERATE AI PREDICTION ---------------- */
  const generatePrediction = async () => {
    if (!student) return;
    setLoading(true);
    setError('');

    try {
      const predictionData = {
        student_id: student.id || '123',
        attendance_percentage: parseFloat(student.attendance_percentage) || 75,
        internal_marks: parseFloat(student.internal_marks) || 70,
        assignment_scores: parseFloat(student.assignment_scores) || 75,
        lab_performance: parseFloat(student.lab_performance) || 70,
        previous_gpa: parseFloat(student.previous_gpa) || 3.0,
        study_hours: parseFloat(student.study_hours) || 20,
        socio_academic_factors: student.socio_academic_factors || {},
        participation_metrics: parseFloat(student.participation_metrics) || 75,
      };

      const res = await axios.post('http://localhost:8002/api/predict', predictionData);

      setPredictions([{ id: Date.now(), ...res.data }]);
    } catch (err) {
      setError('Failed to generate AI prediction. Please ensure the ML service is running.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate prediction when student data loads
  useEffect(() => {
    if (student && predictions.length === 0) {
      generatePrediction();
    }
  }, [student]);

  /* ---------------- CHART DATA ---------------- */
  const performanceData = student
    ? [
        { name: 'Attendance', value: student.attendance_percentage },
        { name: 'Internal', value: student.internal_marks || 0 },
        { name: 'Assignments', value: student.assignment_scores || 0 },
        { name: 'Lab', value: student.lab_performance || 0 },
      ]
    : [];

  const riskData =
    predictions.length > 0
      ? [
          { name: 'Risk', value: predictions[0].risk_score * 100 },
          { name: 'Safe', value: 100 - predictions[0].risk_score * 100 },
        ]
      : [];

  const COLORS = ['#ef4444', '#22c55e'];

  /* ---------------- UI STATES ---------------- */
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  /* ---------------- JSX ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-500">
            AI-based academic performance & risk analysis
          </p>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Info</h2>
          <p><b>Name:</b> {student.name}</p>
          <p><b>Email:</b> {student.email}</p>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Metric label="Attendance (%)" value={student.attendance_percentage} />
          <Metric label="Previous GPA" value={student.previous_gpa} />
          <Metric label="Study Hours / Week" value={student.study_hours} />
        </div>

        {/* GRAPHS */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Academic Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Risk Analysis</h2>
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={100}
                    label
                  >
                    {riskData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 mt-20">
                Generate prediction to view risk graph
              </p>
            )}
          </div>

        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Study Pattern Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { name: 'Attendance', value: student.attendance_percentage },
                { name: 'Study Hours', value: student.study_hours * 5 },
                { name: 'Participation', value: student.participation_metrics || 0 },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">AI Prediction</h2>
            {error && (
              <button
                onClick={generatePrediction}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry Prediction
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {predictions.map(pred => (
            <div key={pred.id} className="bg-gray-50 p-4 rounded">
              <p><b>Performance:</b> {pred.predicted_performance}</p>
              <p><b>Risk Score:</b> {(pred.risk_score * 100).toFixed(0)}%</p>
              <ul className="list-disc ml-6 mt-2">
                {pred.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ))}

          {predictions.length === 0 && !error && !loading && (
            <p className="text-gray-500">Generating AI prediction...</p>
          )}
        </div>

      </div>
    </div>
  );
};

/* ---------------- METRIC CARD ---------------- */
const Metric = ({ label, value }) => (
  <div className="bg-white rounded-xl shadow p-6 text-center">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-3xl font-bold text-indigo-600">{value}</p>
  </div>
);

export default StudentProfile;
