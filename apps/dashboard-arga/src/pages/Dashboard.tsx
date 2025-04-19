import { useState, useEffect } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { useAppSelector } from '@/redux/hooks';
import { applicationService } from '@/services/applicationService';

interface System {
  id: number;
  title: string;
  description: string;
  base_url: string;
  code: string;
}

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Get user data from Redux store
  const { user, accessToken, refreshToken } = useAppSelector((state) => state.auth);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  useEffect(() => {
    const fetchAllowedApplications = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        // If user is superuser, get all applications
        if (user.is_superuser) {
          const allApps = await applicationService.fetchApplications();
          setSystems(allApps.map(app => ({
            id: app.id,
            title: app.name,
            description: app.description || '',
            base_url: app.base_url,
            code: app.code
          })));
          return;
        }
        
        // Handle case where allowed_apps might not exist in the token
        if (user.allowed_apps && user.allowed_apps.length > 0) {
          // For regular users with allowed_apps in token, use that data
          const allowedAppCodes = user.allowed_apps.map(app => app.code);
          
          if (allowedAppCodes.length === 0) {
            setSystems([]);
            return;
          }
          
          // Fetch all applications and filter by allowed codes
          const allApps = await applicationService.fetchApplications();
          const filteredApps = allApps.filter(app => 
            allowedAppCodes.includes(app.code)
          );
          
          setSystems(filteredApps.map(app => ({
            id: app.id,
            title: app.name,
            description: app.description || '',
            base_url: app.base_url,
            code: app.code
          })));
        } else {
          // If allowed_apps doesn't exist in token, fetch user's apps from backend
          try {
            if (!user.id) {
              setSystems([]);
              return;
            }
            
            // Use the fetchUserApplications service function
            const userApps = await applicationService.fetchUserApplications(user.id);
            
            setSystems(userApps.map(app => ({
              id: app.id,
              title: app.name,
              description: app.description || '',
              base_url: app.base_url,
              code: app.code
            })));
          } catch (err) {
            console.error("Error fetching user applications:", err);
            setSystems([]);
          }
        }
        
      } catch (error) {
        console.error("Error fetching applications:", error);
        setSystems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllowedApplications();
  }, [user, navigate]);

  const handleClick = (base_url: string) => {
    // Add the access token as a query parameter when opening the application
    const tokenizedUrl = new URL(base_url);
    tokenizedUrl.searchParams.append('sso_token', accessToken || '');
    tokenizedUrl.searchParams.append('refresh_token', refreshToken || '');
    window.open(tokenizedUrl.toString(), '_blank');
  };

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

        <div className={`min-h-screen flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
          <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
            <div className="mx-auto">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className='flex flex-col py-4'>
                    <h1 className="text-3xl font-bold text-primary-500 dark:text-white">
                      Welcome back, {user?.first_name} {user?.last_name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      Here's an overview of your available systems
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading applications...</p>
                </div>
              ) : systems.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    You don't have access to any applications yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {systems.map((system, index) => (
                    <Card
                      key={index}
                      onClick={() => handleClick(system.base_url)}
                      className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden cursor-pointer"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      <CardContent className="relative z-10 -mt-8">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-t-xl shadow-lg">
                          <h3 className="text-xl font-semibold mb-2 font-montserrat">
                            {system.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {system.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;