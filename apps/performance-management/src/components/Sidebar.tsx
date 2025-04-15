import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, BarChart3, Building2, LineChart, Target, Trophy, ChevronDown, ChevronRight, Home, Calendar, SquareKanban, Building } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useState, useEffect } from 'react';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    system?: string;
    role?: string;
}

interface MenuItem {
    title: string;
    path: string;
    icon?: any;
    roles: string[];
    subMenus?: MenuItem[];
}

// Define performance management menus
const performanceMenus: MenuItem[] = [
    {
        title: 'Home',
        path: '/',
        icon: Home,
        roles: ['admin', 'manager', 'sm_dept', 'employee'],
    },
    {
        title: 'Dashboard',
        path: '/performance-management/dashboard',
        icon: SquareKanban,
        roles: ['admin', 'manager', 'sm_dept'],
    },
    {
        title: 'Period Master',
        path: '/performance-management/period-master',
        icon: Calendar,
        roles: ['admin', 'manager', 'sm_dept'],
    },
    {
        title: 'Company Management',
        path: '/performance-management/company-management',
        icon: Building,
        roles: ['admin'],
        subMenus: [
            {
                title: 'Department Management',
                path: '/performance-management/company-management/departments',
                roles: ['admin']
            },
            {
                title: 'Teams Management',
                path: '/performance-management/company-management/teams',
                roles: ['admin']
            },
            {
                title: 'Employee Management',
                path: '/performance-management/company-management/employees',
                roles: ['admin']
            },
        ]
    },
    {
        title: 'BSC',
        path: '/performance-management/bsc',
        icon: BarChart3,
        roles: ['admin', 'manager', 'sm_dept'],
        subMenus: [
            {
                title: 'BSC Dashboard',
                path: '/performance-management/bsc/dashboard',
                roles: ['admin', 'manager', 'sm_dept']
            },
            {
                title: 'BSC KPI Input',
                path: '/performance-management/bsc/input',
                roles: ['admin', 'manager']
            }
        ]
    },
    {
        title: 'Individual Performance',
        path: '/performance-management/ipm',
        icon: LineChart,
        roles: ['admin', 'employee', 'manager', 'sm_dept'],
    },
    {
        title: 'Monthly Management Performance',
        path: '/monthly-performance-management/mpm/dashboard',
        icon: Target,
        roles: ['admin', 'manager', 'sm_dept'],
        subMenus: [
            {
                title: 'MPM Dashboard',
                path: '/performance-management/mpm/dashboard',
                roles: ['admin', 'manager', 'sm_dept']
            },
            {
                title: 'MPM Actual',
                path: '/performance-management/mpm/actual',
                roles: ['admin', 'manager', 'sm_dept']
            },
            {
                title: 'MPM Target',
                path: '/performance-management/mpm/target',
                roles: ['admin', 'manager', 'sm_dept']
            }
        ]
    },
];

const systems = [
    {
        title: 'Performance Management System',
        description: 'Monitor and manage employee performance metrics',
        icon: Trophy,
        roles: ['admin', 'employee', 'manager', 'sm_dept'],
        iconColor: '#4CAF50',
        titleColor: '#2E7D32',
        url: '/performance-management/bsc/dashboard',
        menus: performanceMenus
    },
    {
        title: 'Company Profile CMS',
        description: 'Manage company website content and information',
        icon: Building2,
        roles: ['admin'],
        iconColor: '#FFA000',
        titleColor: '#E65100',
        url: '#',
        menus: []
    }
];

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen, system, role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
    const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

    // Track viewport width for responsive adjustments
    useEffect(() => {
        const handleResize = () => {
            setViewportWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto close sidebar on small screens after navigation
    const handleNavigate = (path: string) => {
        navigate(path);
        if (viewportWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const currentSystem = systems.find(sys => sys.url.includes(system || ''));
    const accessibleMenus = currentSystem?.menus?.filter(menu =>
        menu.roles.includes(role || '')
    ) || [];

    const toggleSubmenu = (menuPath: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuPath]: !prev[menuPath]
        }));
    };

    const isMenuActive = (menu: MenuItem): boolean => {
        if (menu.subMenus) {
            return menu.subMenus.some(subMenu => location.pathname === subMenu.path);
        }
        return location.pathname === menu.path;
    };

    const isSubmenuActive = (path: string): boolean => {
        return location.pathname === path;
    };

    // Calculate sidebar width based on viewport
    const sidebarWidthClass = viewportWidth < 640 ? 'w-full' :
        viewportWidth < 768 ? 'w-72' : 'w-64';

    return (
        <>
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

         
            {/* Sidebar */}
            <aside className={`
                font-montserrat 
                fixed left-0 top-0 md:top-16 h-full md:h-[calc(100vh-4rem)]
                ${sidebarWidthClass}
                bg-white dark:bg-gray-800 
                shadow-lg z-40 md:z-20
                border-r border-gray-200 dark:border-gray-700
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                overflow-y-auto
                flex flex-col
            `}>
                {/* Close button on mobile */}
                {viewportWidth < 768 && (
                    <div className="flex justify-end p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <span className="sr-only">Close</span>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                )}

                <div className="relative h-full p-2 sm:p-4 flex flex-col">
                    {/* Navigation Menu */}
                    <nav className="space-y-1 flex-grow overflow-y-auto">
                        {accessibleMenus.map((menu, menuIndex) => (
                            <div key={menuIndex}>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        if (menu.subMenus) {
                                            toggleSubmenu(menu.path);
                                        } else {
                                            handleNavigate(menu.path);
                                        }
                                    }}
                                    className={`
                                        w-full justify-start 
                                        h-auto min-h-10 
                                        py-2 px-3
                                        text-left
                                        ${isMenuActive(menu)
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center w-full">
                                        {menu.icon && <menu.icon className="mr-2 h-4 w-4 flex-shrink-0" />}
                                        <span className="truncate text-sm">{menu.title}</span>
                                        {menu.subMenus && (
                                            <span className="ml-auto flex-shrink-0">
                                                {expandedMenus[menu.path]
                                                    ? <ChevronDown className="h-4 w-4" />
                                                    : <ChevronRight className="h-4 w-4" />
                                                }
                                            </span>
                                        )}
                                    </div>
                                </Button>

                                {/* Submenu */}
                                {menu.subMenus && expandedMenus[menu.path] && (
                                    <div className="ml-2 mt-1 space-y-1">
                                        {menu.subMenus.map((submenu, subIndex) => (
                                            <Button
                                                key={subIndex}
                                                variant="ghost"
                                                onClick={() => handleNavigate(submenu.path)}
                                                className={`
                                                    w-full justify-start 
                                                    pl-6 
                                                    h-auto min-h-9 
                                                    py-1.5 
                                                    ${isSubmenuActive(submenu.path)
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }
                                                `}
                                            >
                                                <span className="truncate text-xs sm:text-sm">{submenu.title}</span>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="mt-auto pt-2 space-y-1 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="ghost"
                            onClick={() => handleNavigate('/user-profile')}
                            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 py-2 px-3"
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span className="truncate text-sm">User Detail</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-3 mb-2"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span className="truncate text-sm">Logout</span>
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;