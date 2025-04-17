import { Button } from '@workspace/ui/components/button';
import LogoLightMode from '../../assets/logo_abi_lightmode.png';
import LogoDarkMode from '../../assets/logo_abi_darkmode.png';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginSvg from '../../assets/loginSvg.svg';
import GoogleIcon from '../../assets/googleIcon.svg';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import {  SSO_DASHBOARD_URL } from '@/config';


const Login = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { isAuthenticated } = useAppSelector((state: any) => state.auth);
    const location = useLocation();

    // If user is already authenticated, redirect to intended destination
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Listen for dark mode changes from Navbar
    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);

        // Create a mutation observer to watch for class changes on html element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    setIsDarkMode(isDark);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        // Cleanup observer on component unmount
        return () => observer.disconnect();
    }, []);

    const handleLogin = () => {
        // Redirect to SSO dashboard with return URL as current location
        const returnUrl = encodeURIComponent(window.location.origin);
        window.location.href = `${SSO_DASHBOARD_URL}?returnUrl=${returnUrl}`;
    };

    return (
        <>
            <Navbar />
            <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900">
                <div className="flex flex-wrap items-center min-h-screen">
                    {/* Left Side - Illustration */}
                    <div className="hidden w-full xl:w-1/2 md:block">
                        <div className="py-17.5 px-26 text-center flex flex-col justify-center items-center h-full">
                            <img
                                src={isDarkMode ? LogoDarkMode : LogoLightMode}
                                alt="Company Logo"
                                className="w-32 mb-8"
                            />
                            <img src={LoginSvg} alt="Login Illustration" className="w-96 h-auto" />
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full xl:w-1/2 px-8 pt-6 md:pt-4">
                        <div className="max-w-md mx-auto">
                            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                Login SSO
                            </h2>

                            <div className="w-full">
                                <div className="space-y-6">
                                    {/* Login Message */}
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Login to access the Arga Bumi Indonesia systems
                                    </p>

                                    {/* Google Login Button */}
                                    <Button
                                        onClick={handleLogin}
                                        className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300
                                        dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600
                                        transition-colors duration-300"
                                    >
                                        <div className="flex justify-center space-x-3">
                                            <img src={GoogleIcon} className='w-5 h-5' alt="" />
                                            <span className="text-sm font-medium">Continue with Google</span>
                                        </div>
                                    </Button>

                                    {/* Additional Information */}
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                                        By continuing, you agree to our Terms of Service and Privacy Policy
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;