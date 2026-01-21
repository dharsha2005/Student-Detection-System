import React, { useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    enrollment_year: '',
    major: '',
    attendance_percentage: '',
    internal_marks: '',
    assignment_scores: '',
    lab_performance: '',
    previous_gpa: '',
    study_hours: '',
    socio_academic_factors: '{}',
    participation_metrics: ''
  });

  const handleInputChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8004/api/students/', newStudent)
      .then(response => {
        alert('Student added successfully!');
        setNewStudent({
          name: '',
          email: '',
          enrollment_year: '',
          major: '',
          attendance_percentage: '',
          internal_marks: '',
          assignment_scores: '',
          lab_performance: '',
          previous_gpa: '',
          study_hours: '',
          socio_academic_factors: '{}',
          participation_metrics: ''
        });
      })
      .catch(error => {
        console.error('Error adding student:', error);
        alert('Error adding student');
      });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={newStudent.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={newStudent.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Enrollment Year</label>
            <input
              type="number"
              name="enrollment_year"
              value={newStudent.enrollment_year}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Major</label>
            <input
              type="text"
              name="major"
              value={newStudent.major}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Attendance Percentage</label>
            <input
              type="number"
              step="0.1"
              name="attendance_percentage"
              value={newStudent.attendance_percentage}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Internal Marks</label>
            <input
              type="number"
              step="0.1"
              name="internal_marks"
              value={newStudent.internal_marks}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assignment Scores</label>
            <input
              type="number"
              step="0.1"
              name="assignment_scores"
              value={newStudent.assignment_scores}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lab Performance</label>
            <input
              type="number"
              step="0.1"
              name="lab_performance"
              value={newStudent.lab_performance}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Previous GPA</label>
            <input
              type="number"
              step="0.1"
              name="previous_gpa"
              value={newStudent.previous_gpa}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Study Hours</label>
            <input
              type="number"
              step="0.1"
              name="study_hours"
              value={newStudent.study_hours}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Participation Metrics</label>
            <input
              type="number"
              step="0.1"
              name="participation_metrics"
              value={newStudent.participation_metrics}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
