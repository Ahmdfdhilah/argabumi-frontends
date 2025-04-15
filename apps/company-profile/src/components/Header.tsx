import { useState, useEffect, SetStateAction } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@workspace/ui/components/sheet';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@workspace/ui/components/navigation-menu';
import logo from '../assets/logo_abi_lightmode.png';


export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState('');
    const location = useLocation();

    // Handle scroll events for dynamic header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check if link is active
    const isActive = (path: string) => location.pathname === path;
    const isServiceActive = () => location.pathname.includes('/services');

    // Services dropdown content
    const servicesItems = [
        { title: "Service 1", href: "/services/service-1", description: "Description for Service 1" },
        { title: "Service 2", href: "/services/service-2", description: "Description for Service 2" },
        { title: "Service 3", href: "/services/service-3", description: "Description for Service 3" },
    ];

    // Toggle mobile dropdown
    const toggleMobileDropdown = (name: SetStateAction<string>) => {
        setActiveDropdown(activeDropdown === name ? '' : name);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-accent backdrop-blur-sm py-4'
            }`}>
            <div className="container mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <img src={logo} alt="logo" className="h-10 md:h-12" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-8">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Link to="/">
                                    <NavigationMenuLink
                                        className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/')
                                            ? 'text-primary'
                                            : 'text-gray-700 hover:text-primary'
                                            }`}
                                    >
                                        Home
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <Link to="/about">
                                    <NavigationMenuLink
                                        className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/about')
                                            ? 'text-primary'
                                            : 'text-gray-700 hover:text-primary'
                                            }`}
                                    >
                                        About
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className={`px-3 py-2 text-sm font-medium transition-colors bg-transparent ${isServiceActive()
                                        ? 'text-primary'
                                        : 'text-gray-700 hover:text-primary'
                                        }`}
                                >
                                    Services
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                        {servicesItems.map((service) => (
                                            <li key={service.href}>
                                                <Link to={service.href}>
                                                    <NavigationMenuLink
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                    >
                                                        <div className="text-sm font-medium leading-none">{service.title}</div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            {service.description}
                                                        </p>
                                                    </NavigationMenuLink>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <Link to="/portfolio">
                                    <NavigationMenuLink
                                        className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/portfolio')
                                            ? 'text-primary'
                                            : 'text-gray-700 hover:text-primary'
                                            }`}
                                    >
                                        Portfolio
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <Link to="/blog">
                                    <NavigationMenuLink
                                        className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/blog')
                                            ? 'text-primary'
                                            : 'text-gray-700 hover:text-primary'
                                            }`}
                                    >
                                        Blog
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <Link to="/contact">
                        <Button size="sm" className="font-medium">
                            Contact Us
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-700">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full bg-accent sm:w-80 pt-12 px-4">
                            <nav className="flex flex-col space-y-6">
                                <Link
                                    to="/"
                                    className={`text-lg font-medium ${isActive('/') ? 'text-primary' : 'text-gray-700'}`}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/about"
                                    className={`text-lg font-medium ${isActive('/about') ? 'text-primary' : 'text-gray-700'}`}
                                >
                                    About
                                </Link>

                                <div>
                                    <button
                                        onClick={() => toggleMobileDropdown('services')}
                                        className={`flex items-center justify-between w-full text-lg font-medium ${isServiceActive() ? 'text-primary' : 'text-gray-700'
                                            }`}
                                    >
                                        Services
                                        {activeDropdown === 'services' ? (
                                            <ChevronUp className="h-5 w-5 ml-1" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 ml-1" />
                                        )}
                                    </button>

                                    {activeDropdown === 'services' && (
                                        <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                                            {servicesItems.map((service) => (
                                                <Link
                                                    key={service.href}
                                                    to={service.href}
                                                    className="block text-gray-600 hover:text-primary"
                                                >
                                                    {service.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to="/portfolio"
                                    className={`text-lg font-medium ${isActive('/portfolio') ? 'text-primary' : 'text-gray-700'}`}
                                >
                                    Portfolio
                                </Link>
                                <Link
                                    to="/blog"
                                    className={`text-lg font-medium ${isActive('/blog') ? 'text-primary' : 'text-gray-700'}`}
                                >
                                    Blog
                                </Link>

                                <Link to="/contact" className="mt-4">
                                    <Button className="w-full">Contact Us</Button>
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}