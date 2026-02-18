
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import LoginModal from './modals/LoginModal';
import SignupModal from './modals/SignupModal';
import AcademicDetailsForm from './modals/AcademicDetailsForm';
import DataCleanup from './modals/DataCleanup';

const Navbar = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isAcademicFormOpen, setIsAcademicFormOpen] = useState(false);
    const [isCleanupOpen, setIsCleanupOpen] = useState(false);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    };

    return (
        <>
            <nav className="bg-blue-600 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-white text-xl font-bold">
                        Student Performance System
                    </Link>

                    <div className="flex items-center space-x-4">
                        {session?.user ? (
                            <>
                                <Link href="/" className="text-white hover:text-blue-200">Dashboard</Link>
                                {/* 
                  Note: Original had /profile route for non-admins. 
                  In this unified app, dashboard shows personal stats.
                  We can keep /profile or just use modals. 
                */}
                                {session.user.role !== 'admin' && (
                                    <button
                                        onClick={() => setIsAcademicFormOpen(true)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        ➕ Add Academic Details
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsCleanupOpen(true)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    🗑️ Cleanup Data
                                </button>

                                {session.user.role === 'admin' && (
                                    <>
                                        <Link href="/admin" className="text-white hover:text-blue-200">Admin Dashboard</Link>
                                    </>
                                )}

                                <div className="flex items-center space-x-2">
                                    <span className="text-white text-sm">Welcome, {session.user.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setIsSignupModalOpen(true)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
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
            />

            <DataCleanup
                isOpen={isCleanupOpen}
                onClose={() => setIsCleanupOpen(false)}
            />
        </>
    );
};

export default Navbar;
