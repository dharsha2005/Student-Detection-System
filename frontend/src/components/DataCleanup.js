import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DataCleanup = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const cleanupData = () => {
    setLoading(true);
    setMessage('');

    try {
      // Get all keys from localStorage
      const allKeys = Object.keys(localStorage);
      let deletedCount = 0;
      let preservedCount = 0;

      allKeys.forEach(key => {
        // Preserve data for currently signed-in user
        if (user && (
          key === `academic_${user.id}` || 
          key === `predictions_${user.id}` ||
          key === 'user' // Preserve current user session
        )) {
          preservedCount++;
        } else {
          // Delete all other data
          localStorage.removeItem(key);
          deletedCount++;
        }
      });

      setMessage(`✅ Cleanup completed! Deleted ${deletedCount} items, preserved ${preservedCount} items for current user.`);
      
      // Refresh the page after 2 seconds to show effects
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setMessage('❌ Error during cleanup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDataSummary = () => {
    const allKeys = Object.keys(localStorage);
    const userDataKeys = allKeys.filter(key => 
      key.startsWith('academic_') || 
      key.startsWith('predictions_') || 
      key === 'user'
    );
    
    return {
      total: allKeys.length,
      userData: userDataKeys.length,
      other: allKeys.length - userDataKeys.length
    };
  };

  if (!isOpen) return null;

  const dataSummary = getDataSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">🗑️ Data Cleanup</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Current Storage Status:</h3>
          <div className="space-y-1 text-sm">
            <p>Total items: <span className="font-bold">{dataSummary.total}</span></p>
            <p>User data items: <span className="font-bold text-blue-600">{dataSummary.userData}</span></p>
            <p>Other items: <span className="font-bold text-orange-600">{dataSummary.other}</span></p>
          </div>
        </div>

        {user && (
          <div className="mb-6 p-4 bg-green-50 rounded">
            <h3 className="font-semibold mb-2">Will Preserve:</h3>
            <div className="space-y-1 text-sm">
              <p>✅ Current user session</p>
              <p>✅ Academic data for {user.name}</p>
              <p>✅ Predictions for {user.name}</p>
            </div>
          </div>
        )}

        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 rounded">
            <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Warning:</h3>
            <p className="text-sm text-yellow-700">
              No user is currently signed in. All data will be deleted including user sessions.
            </p>
          </div>
        )}

        {message && (
          <div className={`mb-4 p-3 rounded text-sm ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            onClick={cleanupData}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cleaning...' : 'Delete All Data Except Signed-in User'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataCleanup;
