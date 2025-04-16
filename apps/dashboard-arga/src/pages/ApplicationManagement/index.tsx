import { lazy, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

// Lazy-loaded components
const ApplicationList = lazy(() => import('./ApplicationList'));
const ApplicationDetail = lazy(() => import('./ApplicationDetail'));
const ApplicationForm = lazy(() => import('./ApplicationForm'));

// Main ApplicationManagement component to wrap all application routes
const ApplicationManagement = () => {
    // State management for sidebar and dark mode
    const [currentRole, setCurrentRole] = useState('admin');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
                currentSystem="Application Management"
            />

            <div className="flex">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        <Routes>
                            <Route path="/" element={<ApplicationList />} />
                            <Route path="/detail/:id" element={<ApplicationDetail />} />
                            <Route path="/new" element={<ApplicationForm />} />
                            <Route path="/edit/:id" element={<ApplicationForm />} />
                            <Route path="*" element={<Navigate to="/application-management" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export const ApplicationManagementRoutes = () => (
    <Routes>
        <Route path="/*" element={<ApplicationManagement />} />
    </Routes>
);

export default ApplicationManagement;