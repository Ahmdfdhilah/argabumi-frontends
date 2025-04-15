// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import logo from '../assets/logo_abi_lightmode.png';

function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdown, setDropdown] = useState('');
    const location = useLocation();

    // Handle scroll events to create a dynamic header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check if link is active
    const isActive = (path: string) => location.pathname === path;

    // Services dropdown menu content
    const servicesDropdown = [
        { name: "Service 1", path: "/services/service-1" },
        { name: "Service 2", path: "/services/service-2" },
        { name: "Service 3", path: "/services/service-3" },
    ];

    // Toggle dropdown menu
    const toggleDropdown = (name: string) => {
        setDropdown(dropdown === name ? '' : name);
    };

    return (
        <header className={`md:px-12 xl:px-24 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-6'
            }`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center space-x-2"
                >
                    <img src={logo} alt="logo" className="h-10 md:h-12" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:block">
                    <ul className="flex space-x-8">
                        <li>
                            <Link
                                to="/"
                                className={`font-medium transition-all duration-300 pb-2 border-b-2 ${isActive('/')
                                    ? 'border-primary-600 text-primary-600'
                                    : `border-transparent ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-primary-500 hover:text-primary-300'}`
                                    }`}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className={`font-medium transition-all duration-300 pb-2 border-b-2 ${isActive('/about')
                                    ? 'border-primary-600 text-primary-600'
                                    : `border-transparent ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-primary-500 hover:text-primary-300'}`
                                    }`}
                            >
                                About
                            </Link>
                        </li>
                        <li className="relative">
                            <button
                                onClick={() => toggleDropdown('services')}
                                className={`font-medium transition-all duration-300 pb-2 border-b-2 flex items-center ${location.pathname.includes('/services')
                                    ? 'border-primary-600 text-primary-600'
                                    : `border-transparent ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-primary-500 hover:text-primary-300'}`
                                    }`}
                            >
                                Services <ChevronDown className="ml-1 w-4 h-4" />
                            </button>

                            {dropdown === 'services' && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-20">
                                    {servicesDropdown.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                                            onClick={() => setDropdown('')}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </li>
                        <li>
                            <Link
                                to="/portfolio"
                                className={`font-medium transition-all duration-300 pb-2 border-b-2 ${isActive('/portfolio')
                                    ? 'border-primary-600 text-primary-600'
                                    : `border-transparent ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-primary-500 hover:text-primary-300'}`
                                    }`}
                            >
                                Portfolio
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/blog"
                                className={`font-medium transition-all duration-300 pb-2 border-b-2 ${isActive('/blog')
                                    ? 'border-primary-600 text-primary-600'
                                        : `border-transparent ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-primary-500 hover:text-primary-300'}`
                                    }`}
                            >
                                Blog
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Contact Button */}
                <div className="hidden lg:block">
                    <Link
                        to="/contact"
                        className='px-6 py-2 rounded-full transition-all duration-300 bg-primary-600 text-white hover:bg-primary-700'
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <X className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
                    ) : (
                        <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white shadow-lg">
                    <nav className="container mx-auto px-6 py-4">
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/"
                                    className={`block py-2 ${isActive('/') ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className={`block py-2 ${isActive('/about') ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => toggleDropdown('mobileServices')}
                                    className={`flex items-center justify-between w-full py-2 ${location.pathname.includes('/services') ? 'text-primary-600 font-medium' : 'text-gray-700'
                                        }`}
                                >
                                    Services
                                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdown === 'mobileServices' ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdown === 'mobileServices' && (
                                    <div className="pl-4 mt-2 border-l border-gray-200 space-y-2">
                                        {servicesDropdown.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className="block py-2 text-gray-600 hover:text-primary-600"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                            <li>
                                <Link
                                    to="/portfolio"
                                    className={`block py-2 ${isActive('/portfolio') ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Portfolio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className={`block py-2 ${isActive('/blog') ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="block py-3 mt-4 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </header>
    );
}

export default Header;