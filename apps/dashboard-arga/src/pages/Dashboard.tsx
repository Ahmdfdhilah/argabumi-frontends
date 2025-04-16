import { useState, useEffect } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { useAppSelector } from '@/redux/hooks';
import { applicationService } from '@/services/applicationService';
import { useToast } from "@workspace/ui/components/sonner";

interface System {
  id: number;
  title: string;
  description: string;
  base_url: string;
  code: string;
}

const Dashboard = () => {
  const [currentRole, setCurrentRole] = useState('employee');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get user data from Redux store
  const user = useAppSelector((state) => state.auth.user);
  
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
        
        // For regular users, get only their allowed applications
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
        
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load applications",
          variant: "destructive",
        });
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllowedApplications();
  }, [user, navigate]);

  const handleClick = (base_url: string) => {
    window.open(base_url, '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentSystem='Performance Management System'
      />

      <div className="flex">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
          <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
            <div className="mx-auto">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold dark:text-white">
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