import { HelpCircle, Mail, FileText } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

const Footer = ({ currentSystem = "Arga Bumi Indonesia Dashboard" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 font-montserrat">
      <div className="container mx-auto px-0 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center px-0">
          {/* Left Section - System Info */}
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4 p-2 bg-[#f0f9f0] dark:bg-[#0a2e14] rounded-full">
              <FileText className="h-5 w-5 text-[#1B6131] dark:text-[#46B749]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1B6131] dark:text-[#46B749]">{currentSystem}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Version 1.0.0</p>
            </div>
          </div>

          {/* Center Section - Quick Links */}
          <div className="flex space-x-4 mb-4 md:mb-0">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-[#1B6131] hover:dark:text-[#46B749] p-0 h-auto">
              <HelpCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Help</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-[#1B6131] hover:dark:text-[#46B749] p-0 h-auto">
              <FileText className="h-4 w-4 mr-1" />
              <span className="text-xs">Documentation</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-[#1B6131] hover:dark:text-[#46B749] p-0 h-auto">
              <Mail className="h-4 w-4 mr-1" />
              <span className="text-xs">Contact</span>
            </Button>
          </div>

          {/* Right Section - Copyright */}
          <div className="hidden lg:block text-xs text-gray-600 dark:text-gray-400 flex items-center">
            <span>&copy; {currentYear} Arga Bumi Indonesia. All rights reserved.</span>
          </div>
        </div>
        <div className="flex">
          {/* Mobile only center - Copyright */}
          <div className="lg:hidden mx-auto text-xs text-gray-600 dark:text-gray-400 flex items-center sm:mt-2">
            <span>&copy; {currentYear} Arga Bumi Indonesia. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;