import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AcademicDetailsForm = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    major: '',
    enrollment_year: new Date().getFullYear(),
    attendance_percentage: 75,
    internal_marks: 70,
    assignment_scores: 75,
    lab_performance: 70,
    previous_gpa: 3.0,
    study_hours: 20,
    participation_metrics: 75
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // Try to load existing academic details
      const storedDetails = localStorage.getItem(`academic_${user.email.toLowerCase()}`);
      if (storedDetails) {
        setFormData(JSON.parse(storedDetails));
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'enrollment_year' ? parseInt(value) : 
               ['attendance_percentage', 'internal_marks', 'assignment_scores', 
                'lab_performance', 'study_hours', 'participation_metrics'].includes(name) ? 
               parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔍 User data:', user);
    console.log('🔍 User ID type:', typeof user.id);
    console.log('🔍 User ID value:', user.id);
    console.log('🔍 Form data:', formData);

    try {
      // Save to backend (this would create/update student record)
      const studentData = {
        user_id: user.id,
        name: user.name,
        email: user.email,
        ...formData,
        socio_academic_factors: {
          family_income: "medium",
          parent_education: "college"
        }
      };

      // Try to save to backend first
      try {
        console.log('🔍 Sending student data to backend:', studentData);
        
        // First check if student already exists
        try {
          console.log('🔍 Checking if student exists for user:', user.id);
          const existingStudent = await axios.get(`http://localhost:8004/api/students/by-user/${user.id}`);
          console.log('📋 Found existing student:', existingStudent.data);
          
          if (existingStudent.data && existingStudent.data._id) {
            console.log('🔄 Updating existing student with ID:', existingStudent.data._id);
            // Update existing student
            const studentId = existingStudent.data._id || existingStudent.data.id;
            const response = await axios.put(`http://localhost:8004/api/students/${studentId}`, studentData);
            console.log('✅ Student data updated in backend:', response.data);
            console.log('✅ Response status:', response.status);
          } else {
            console.log('🆕 Creating new student - no existing record found');
            // Create new student if doesn't exist
            const response = await axios.post(`http://localhost:8004/api/students/`, studentData);
            console.log('✅ Student data created in backend:', response.data);
            console.log('✅ Response status:', response.status);
          }
        } catch (findError) {
          console.log('❌ Error checking existing student:', findError);
          console.log('❌ Error response:', findError.response);
          
          // Create new student if doesn't exist
          const response = await axios.post(`http://localhost:8004/api/students/`, studentData);
          console.log('✅ Student data created in backend:', response.data);
          console.log('✅ Response status:', response.status);
        }
      } catch (backendError) {
        console.log('❌ Backend error:', backendError);
        console.log('❌ Error response:', backendError.response);
        // Fallback to localStorage if backend is not available
        localStorage.setItem(`academic_${user.email.toLowerCase()}`, JSON.stringify(formData));
      }

      // Save to localStorage as backup
      localStorage.setItem(`academic_${user.email.toLowerCase()}`, JSON.stringify(formData));
      
      // Clear predictions when academic details are updated
      localStorage.removeItem(`predictions_${user.email.toLowerCase()}`);
      
      onSave(formData);
      onClose();
    } catch (error) {
      setError('Failed to save academic details');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Academic Details</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Major
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Major</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Medicine">Medicine</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Enrollment Year
              </label>
              <input
                type="number"
                name="enrollment_year"
                value={formData.enrollment_year}
                onChange={handleChange}
                min="2020"
                max="2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Attendance Percentage (%)
              </label>
              <input
                type="number"
                name="attendance_percentage"
                value={formData.attendance_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Internal Marks (0-100)
              </label>
              <input
                type="number"
                name="internal_marks"
                value={formData.internal_marks}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Assignment Scores (0-100)
              </label>
              <input
                type="number"
                name="assignment_scores"
                value={formData.assignment_scores}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Lab Performance (0-100)
              </label>
              <input
                type="number"
                name="lab_performance"
                value={formData.lab_performance}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Previous GPA (0-4)
              </label>
              <input
                type="number"
                name="previous_gpa"
                value={formData.previous_gpa}
                onChange={handleChange}
                min="0"
                max="4"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Study Hours per Week
              </label>
              <input
                type="number"
                name="study_hours"
                value={formData.study_hours}
                onChange={handleChange}
                min="0"
                max="80"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4 md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Participation Metrics (0-100)
              </label>
              <input
                type="number"
                name="participation_metrics"
                value={formData.participation_metrics}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}
          
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Details'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicDetailsForm;
