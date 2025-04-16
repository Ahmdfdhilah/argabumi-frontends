import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  BarChart3,
  Building2,
} from 'lucide-react';
import Header from '@/components/Header';
import { To, useNavigate } from 'react-router-dom';
import Performance from '../assets/performance.jpg';
import Cms from '../assets/cms.jpg';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const [currentRole, setCurrentRole] = useState('employee');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const systems = [
    {
      title: 'Performance Management System',
      description: 'Monitor and manage employee performance metrics with real-time analytics and feedback systems',
      icon: BarChart3,
      roles: ['admin', 'employee', 'manager', 'sm_dept'],
      iconColor: '#4CAF50',
      titleColor: '#2E7D32',
      url: '/performance-management/dashboard',
      imageUrl: Performance,
    },
    {
      title: 'Company Profile CMS',
      description: 'Manage company website content and information with our advanced content management system',
      icon: Building2,
      roles: ['admin'],
      iconColor: '#FFA000',
      titleColor: '#E65100',
      url: '#',
      imageUrl: Cms,
    }
  ];

  const handleClick = (url: To) => {
    navigate(url);
  };

  return (
    <>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 font-montserrat`}>
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          currentSystem='Dashboard'
        />
        <div className="md:pt-16 flex">
          <div className="flex-1 p-8">
            <div className="mx-auto pt-16 lg:pt-0">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold dark:text-white">Welcome back, John Doe</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Here's an overview of your available systems</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systems
                  .filter(system => system.roles.includes(currentRole))
                  .map((system, index) => {
                    const Icon = system.icon;
                    return (
                      <Card
                        key={index}
                        onClick={() => handleClick(system.url)}
                        className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden cursor-pointer"
                      >
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={system.imageUrl}
                            alt={system.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <Icon
                            className="absolute top-4 right-4 h-8 w-8"
                            style={{ color: system.iconColor }}
                          />
                        </div>

                        <CardContent className="relative z-10 -mt-8">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-t-xl shadow-lg">
                            <h3
                              className="text-xl font-semibold mb-2 font-montserrat"
                              style={{ color: system.titleColor }}
                            >
                              {system.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {system.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;