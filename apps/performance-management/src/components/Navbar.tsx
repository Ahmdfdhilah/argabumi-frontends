import { Button } from "@workspace/ui/components/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <header className="font-montserrat h-16 bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
        </div>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;