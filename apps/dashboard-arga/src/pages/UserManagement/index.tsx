// src/pages/UserManagement/index.tsx
import { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Lazy-loaded components
const UserList = lazy(() => import('./UserList'));
const UserDetail = lazy(() => import('./UserDetail'));
const UserForm = lazy(() => import('./UserForm'));

// Main layout with Header and Sidebar
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

// Main UserManagement component to wrap all user routes
const UserManagement = () => {
    // State management for sidebar and dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat flex flex-col">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />

            <div className="flex">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <div className={`min-h-screen flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        <Routes>
                            <Route path="/" element={<UserList />} />
                            <Route path="/detail/:id" element={<UserDetail />} />
                            <Route path="/add" element={<UserForm />} />
                            <Route path="/edit/:id" element={<UserForm />} />
                            <Route path="*" element={<Navigate to="/user-management" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export const UserManagementRoutes = () => (
    <Routes>
        <Route path="/*" element={<UserManagement />} />
    </Routes>
);

export default UserManagement;