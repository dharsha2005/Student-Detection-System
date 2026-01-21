import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import AcademicDetailsForm from './AcademicDetailsForm';
import DataCleanup from './DataCleanup';

const Navbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isAcademicFormOpen, setIsAcademicFormOpen] = useState(false);
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAcademicDetailsSave = (academicData) => {
    // Refresh profile page to show new data
    if (window.location.pathname === '/profile') {
      window.location.reload();
    }
  };

  return (
    <>
      <nav className="bg-blue-600 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-white text-xl font-bold">
            Student Performance System
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/" className="text-white hover:text-blue-200">Dashboard</Link>
                {user.role !== 'admin' && (
                  <Link to="/profile" className="text-white hover:text-blue-200">Profile</Link>
                )}
                {user.role !== 'admin' && (
                  <button
                    onClick={() => setIsAcademicFormOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ➕ Add Academic Details
                  </button>
                )}
                <button
                  onClick={() => setIsCleanupOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  🗑️ Cleanup Data
                </button>
                {user.role === 'admin' && (
                  <>
                    <Link to="/analytics" className="text-white hover:text-blue-200">Analytics</Link>
                    <Link to="/admin" className="text-white hover:text-blue-200">Admin</Link>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-white">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
      
      <AcademicDetailsForm 
        isOpen={isAcademicFormOpen}
        onClose={() => setIsAcademicFormOpen(false)}
        onSave={handleAcademicDetailsSave}
      />
      
      <DataCleanup 
        isOpen={isCleanupOpen}
        onClose={() => setIsCleanupOpen(false)}
      />
    </>
  );
};

export default Navbar;
