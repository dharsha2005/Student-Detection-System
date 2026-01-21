import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ChatBot from '../components/ChatBot';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [allStudents, setAllStudents] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [stats, setStats] = useState({
    totalStudents: 0,
    atRiskStudents: 0,
    averageGpa: 0,
    highPerformers: 0,
    lowAttendance: 0
  });

  /* ---------------- RISK LEVEL ---------------- */
  const getRiskLevel = (riskScore = 0) => {
    if (riskScore >= 0.75) return { level: 'Critical', color: 'text-red-700' };
    if (riskScore >= 0.6) return { level: 'High', color: 'text-red-600' };
    if (riskScore >= 0.4) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  /* ---------------- GPA FALLBACK ---------------- */
  const getGpaPerformance = (gpa = 0) => {
    if (gpa >= 3.5) return { level: 'Excellent', color: 'text-green-600' };
    if (gpa >= 3.0) return { level: 'Good', color: 'text-blue-600' };
    if (gpa >= 2.5) return { level: 'Average', color: 'text-yellow-600' };
    return { level: 'Poor', color: 'text-red-600' };
  };

  /* ---------------- LOAD PREDICTIONS ---------------- */
  const loadAllPredictions = async (students) => {
    try {
      const res = await axios.get('http://localhost:8004/api/predictions/');
      const backendPredictions = res.data || [];
      
      const result = [];
      students.forEach(student => {
        const prediction = backendPredictions.find(
          p => p.student_id === (student.id || student._id)
        );
        
        if (prediction) {
          result.push({
            studentId: student.id || student._id,
            student,
            prediction: prediction
          });
        }
      });
      
      return result;
    } catch (err) {
      console.error('Failed to load predictions from backend:', err);
      // Fallback to localStorage if backend fails
      const fallbackResult = [];
      students.forEach(student => {
        const key = `predictions_${student.email.toLowerCase()}`;
        const stored = localStorage.getItem(key);

        if (stored) {
          try {
            const preds = JSON.parse(stored);
            if (Array.isArray(preds) && preds.length > 0) {
              fallbackResult.push({
                studentId: student.id || student._id,
                student,
                prediction: preds[0]
              });
            }
          } catch (e) {
            console.log('Prediction parse error:', student.email);
          }
        }
      });
      return fallbackResult;
    }
  };

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const loadAdminData = async () => {
      try {
        const res = await axios.get('http://localhost:8004/api/students/');
        const students = res.data || [];
        setAllStudents(students);

        const predictions = await loadAllPredictions(students);
        setAllPredictions(predictions);

        const totalStudents = students.length;
        const atRiskStudents = predictions.filter(
          p => p.prediction?.risk_score >= 0.6
        ).length;

        const highPerformers = predictions.filter(
          p => p.prediction?.predicted_performance === 'High'
        ).length;

        const lowAttendance = students.filter(
          s => (s.attendance_percentage || 0) < 75
        ).length;

        const avgGpa =
          students.reduce((sum, s) => sum + (s.previous_gpa || 0), 0) /
          (students.length || 1);

        setStats({
          totalStudents,
          atRiskStudents,
          highPerformers,
          lowAttendance,
          averageGpa: avgGpa.toFixed(2)
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [user]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedStudent(null);
    setShowDetailsModal(false);
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Admin Dashboard...
      </div>
    );
  }

  /* ---------------- JSX ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">
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
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Email', 'GPA', 'Attendance', 'Performance', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase text-center"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {allStudents.map((student, idx) => {
                const pred = allPredictions.find(
                  p => p.studentId === (student.id || student._id)
                );

                const performance = pred
                  ? {
                      level: pred.prediction.predicted_performance,
                      color:
                        pred.prediction.predicted_performance === 'High'
                          ? 'text-green-600'
                          : pred.prediction.predicted_performance === 'Medium'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }
                  : getGpaPerformance(student.previous_gpa);

                return (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-center font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-center">{student.previous_gpa?.toFixed(2) || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{student.attendance_percentage || 0}%</td>
                    <td className={`px-6 py-4 text-center font-semibold ${performance.color}`}>
                      {performance.level}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(student)}
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

        {/* MODAL */}
        {showDetailsModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-3xl w-full p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4">
                {selectedStudent.name} – Full Report
              </h2>

              {(() => {
                const pred = allPredictions.find(
                  p => p.studentId === (selectedStudent.id || selectedStudent._id)
                );

                if (!pred) return <p>No AI prediction available</p>;

                const risk = getRiskLevel(pred.prediction.risk_score);

                return (
                  <>
                    <p className="mt-2">
                      <b>AI Performance:</b>{' '}
                      <span className="font-semibold">
                        {pred.prediction.predicted_performance}
                      </span>
                    </p>
                    <p className={`mt-2 font-semibold ${risk.color}`}>
                      <b>Risk:</b>{' '}
                      {(pred.prediction.risk_score * 100).toFixed(1)}% ({risk.level})
                    </p>
                  </>
                );
              })()}

              <div className="mt-6 text-right">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI ChatBot Assistant - Now floating in corner */}
        <ChatBot />

      </div>
    </div>
  );
};

/* ---------------- STAT CARD ---------------- */
const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center justify-center text-center">
    <p className="text-sm text-gray-500 mb-2">{title}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AdminDashboard;
