import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Home, LogOut, SquareKanban, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useToast } from '@workspace/ui/components/sonner';
import { logoutUser } from '@/redux/features/authSlice';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

interface MenuItem {
    title: string;
    path: string;
    icon?: any;
    roles: string[];
    subMenus?: MenuItem[];
}

const menus: MenuItem[] = [
    {
        title: 'Home',
        path: '/dashboard',
        icon: Home,
        roles: ['admin', 'users'],
    },
    {
        title: 'Users Management',
        path: '/user-management',
        icon: User,
        roles: ['admin'],
    },
    {
        title: 'Application Management',
        path: '/application-management',
        icon: SquareKanban,
        roles: ['admin'],
    }
];

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const { user } = useAppSelector(state => state.auth);
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

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();

            toast({
                title: "Success",
                description: "Successfully logged out",
            });

            navigate('/login');
        } catch (error) {
            toast({
                title: "Error",
                description: typeof error === 'string' ? `Logout failed: ${error}` : 'Logout failed',
                variant: "destructive",
            });
        }
    };

    const filterMenusByRole = (menus: MenuItem[], role: string): MenuItem[] => {
        return menus
            .filter(menu => menu.roles.includes(role))
            .map(menu => ({
                ...menu,
                subMenus: menu.subMenus ? filterMenusByRole(menu.subMenus, role) : undefined,
            }));
    };

    const currentRole = user?.is_superuser ? 'admin' : 'users';
    const accessibleMenus = filterMenusByRole(menus, currentRole);

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
                            onClick={() => handleNavigate('/user-detail')}
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