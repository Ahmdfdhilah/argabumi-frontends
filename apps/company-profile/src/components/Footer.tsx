// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import logo from '../assets/logo_abi_darkmode.png';

function Footer() {
    return (
        <footer className="bg-primary text-white">
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                {/* Main company info */}
                <div className="mb-8">
                    <div className="py-4">
                        <img src={logo} className='h-16' alt="arga-bumi-indonesia" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h2 className="font-bold mb-2 text-accent">PT. Arga Bumi Indonesia</h2>
                            <p className="mb-1">Singapore Office</p>
                            <p className="text-accent">5 Temasek Boulevard, #17–01, Suntec Tower 5, Singapore</p>
                            <p className="mt-2 mb-1">Indonesia Office</p>
                            <p className="text-accent">Ciputra World 89 Mayjen Sungkono, Surabaya, East Java, Indonesia</p>
                        </div>
                    </div>
                </div>

                {/* Links section */}
                <div className="border-t border-accent pt-4 mb-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex space-x-6 mb-4 md:mb-0">
                            <Link to="/pms" className="hover:text-accent">Product</Link>
                            <Link to="/blog" className="hover:text-accent">Blog</Link>
                            <Link to="/contact" className="hover:text-accent">Contact Us</Link>
                        </div>
                        <div className="flex space-x-6">
                            <Link to="/direct-booking" className="hover:text-accent">Mitra Registration</Link>
                            <Link to="/ems" className="hover:text-accent">About Us</Link>
                        </div>
                    </div>
                </div>

                {/* Copyright and legal links */}
                <div className="border-t border-accent pt-4 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-accent mb-2 md:mb-0">Arga Bumi Indonesia © 2025</p>
                    <div className="flex space-x-4">
                        <Link to="/privacy" className="text-accent hover:text-white">Privacy Policy</Link>
                        <Link to="/terms" className="text-accent hover:text-white">Terms of Services</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
