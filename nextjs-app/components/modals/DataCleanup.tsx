
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface DataCleanupProps {
    isOpen: boolean;
    onClose: () => void;
}

const DataCleanup = ({ isOpen, onClose }: DataCleanupProps) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const cleanupData = () => {
        setLoading(true);
        setMessage('');

        try {
            // Logic for cleanup in Next.js might refer to clearing DB or just localStorage tokens?
            // Original logic cleared localStorage. We can keep that for exact parity, 
            // but also maybe we should clear the session? 
            // For now, let's replicate the original "localStorage cleanup" as it was a frontend feature.

            const allKeys = Object.keys(localStorage);
            let deletedCount = 0;
            let preservedCount = 0;

            // We don't really use localStorage for main data anymore, but we can clean it anyway.
            localStorage.clear();
            deletedCount = allKeys.length;

            setMessage(`✅ Cleanup completed! Deleted ${deletedCount} items.`);

            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error: any) {
            setMessage('❌ Error during cleanup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-slate-800">
                <h2 className="text-2xl font-bold mb-6">🗑️ Data Cleanup</h2>

                <div className="mb-6 p-4 bg-gray-50 rounded">
                    <p className="text-gray-600">This will clear any local data stored in your browser.</p>
                </div>

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
                        {loading ? 'Cleaning...' : 'Clear Local Data'}
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
