import {
    Sun,
    Moon,
    Bell,
    Menu,
} from 'lucide-react';
import LogoLightMode from '../assets/logo_abi_lightmode.png';
import LogoDarkMode from '../assets/logo_abi_darkmode.png';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { useEffect, useState } from 'react';
import avatar from '@/assets/avatar.png';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logoutUser } from '../redux/features/authSlice';
import { useToast } from '@workspace/ui/components/sonner';

interface HeaderProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    isDarkMode: boolean;
    setIsDarkMode: (mode: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    isDarkMode,
    setIsDarkMode,
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const { loading, user } = useAppSelector(state => state.auth);

    const [notifications, setNotifications] = useState<{ id: number; title: string; read: boolean }[]>([
        { id: 1, title: "New system update available", read: false },
        { id: 2, title: "Meeting reminder: Strategy session", read: false },
        { id: 3, title: "Access request approved", read: true }
    ]);


    const unreadNotifications = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n));
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

    return (
        <header className="font-montserrat h-16 bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-30 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 h-full flex items-center justify-between">
                {/* Left section */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                    {/* Logo */}
                    <div className="flex items-center ml-1">
                        <img
                            src={isDarkMode ? LogoDarkMode : LogoLightMode}
                            alt="Company Logo"
                            className="h-10"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center space-x-1 md:space-x-4">
                    {/* Theme toggle */}
                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                                        {unreadNotifications}
                                    </span>
                                )}
                                <span className="sr-only">Notifications</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72">
                            <DropdownMenuLabel className="flex items-center justify-between">
                                <span>Notifications</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="text-xs h-6 hover:bg-transparent hover:text-green-600"
                                >
                                    Mark all as read
                                </Button>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {notifications.length === 0 ? (
                                <div className="py-2 px-2 text-center text-gray-500 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id)}
                                        className={`py-2 px-3 cursor-pointer ${notification.read ? 'opacity-70' : 'bg-green-50 dark:bg-gray-700'}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={`w-2 h-2 mt-2 rounded-full ${notification.read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-green-500'}`} />
                                            <div>
                                                <p className="text-sm">{notification.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Just now</p>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-center text-sm text-green-600 hover:text-green-800 dark:text-green-400 cursor-pointer">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Theme toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                        {isDarkMode ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {/* User menu with integrated role selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={avatar} alt="User" />
                                        <AvatarFallback className="bg-green-600 text-white">DJ</AvatarFallback>
                                    </Avatar>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <div className="flex flex-col space-y-1 p-2">
                                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                <div className="flex items-center gap-2 pt-1">
                                    <div className={`w-3 h-3 rounded-full  ${user?.is_superuser ? 'bg-red-500' : 'bg-blue-500'}`} />
                                    <span className="text-xs font-medium">{user?.is_superuser ? 'Super Admin' : 'Employee'}</span>
                                </div>
                            </div>
                            <DropdownMenuSeparator />

                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('#')}>Profile</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('#')}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 hover:text-red-700 dark:text-red-400 cursor-pointer" onClick={handleLogout}>
                                {loading ? 'Logging out...' : 'Logout'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Header;