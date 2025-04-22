import { useState } from 'react';
import { ChevronRight, Home, FolderIcon, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  currentPage: string;
  subtitle?: string | React.ReactNode;
  showHomeIcon?: boolean;
  className?: string;
  isLoading?: boolean;
}

const Breadcrumb = ({
  items = [],
  currentPage,
  subtitle,
  showHomeIcon = true,
  className = "",
  isLoading = false,
}: BreadcrumbProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Loading state 
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 mb-8 overflow-hidden shadow-sm">
        <div className="mx-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-green-200/50 dark:bg-green-700/50 rounded-md mb-2" />
            <div className="h-5 w-36 bg-green-200/50 dark:bg-green-700/50 rounded-md" />
          </div>
          <div className="animate-pulse">
            <div className="h-10 w-64 bg-green-200/50 dark:bg-green-700/50 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Render for desktop (full breadcrumb)
  const DesktopBreadcrumb = () => (
    <ol className="flex items-center flex-wrap sm:flex-nowrap gap-2 text-sm">
      {showHomeIcon && (
        <li className="flex items-center shrink-0">
          <Link
            to="/"
            className="flex items-center text-[#1B6131] dark:text-[#46B749] hover:text-green-900 dark:hover:text-green-100 transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-[#1B6131] dark:text-[#46B749] opacity-70 shrink-0" />
        </li>
      )}

      {items.map((item, index) => (
        <li key={item.path} className="flex items-center shrink-0">
          <Link
            to={item.path}
            className={`
              text-[#1B6131] dark:text-[#46B749] 
              hover:text-green-900 dark:hover:text-green-100 
              transition-colors whitespace-nowrap
              ${index === items.length - 1 ? 'font-semibold' : ''}
            `}
          >
            {item.label}
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-green-500 dark:text-green-600 opacity-70 shrink-0" />
        </li>
      ))}

      <li
        aria-current="page"
        className="text-[#1B6131] dark:text-[#46B749] font-semibold tracking-tight whitespace-nowrap"
      >
        {currentPage}
      </li>
    </ol>
  );

  // Render for mobile (truncated breadcrumb)
  const MobileBreadcrumb = () => {
    if (items.length <= 1) {
      return <DesktopBreadcrumb />;
    }

    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    return (
      <ol className="flex items-center flex-wrap sm:flex-nowrap gap-2 text-sm">
        {showHomeIcon && (
          <li className="flex items-center shrink-0">
            <Link
              to="/"
              className="flex items-center text-[#1B6131] dark:text-[#46B749] hover:text-green-900 dark:hover:text-green-100 transition-colors"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-[#1B6131] dark:text-[#46B749] opacity-70 shrink-0" />
          </li>
        )}

        {items.length > 0 && (
          <li className="flex items-center shrink-0">
            <Link
              to={firstItem.path}
              className="text-[#1B6131] dark:text-[#46B749] hover:text-green-900 dark:hover:text-green-100 transition-colors whitespace-nowrap"
            >
              {firstItem.label}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-[#1B6131] dark:text-[#46B749] opacity-70 shrink-0" />
          </li>
        )}

        {/* More dialog */}
        {items.length > 2 && (
          <li className="flex items-center shrink-0">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#1B6131] dark:text-[#46B749] hover:bg-green-100 dark:hover:bg-green-900 border-green-200 dark:border-green-800 px-2 py-1 h-auto flex items-center gap-1"
                >
                  <span className="text-xs">Navigate</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[95%] max-w-[500px] rounded-lg border-green-200 dark:border-green-800">
                <DialogHeader className="border-b border-green-100 dark:border-green-800 pb-3">
                  <DialogTitle className="flex items-center gap-2 text-[#1B6131] dark:text-[#46B749]">
                    <FolderIcon className="w-5 h-5" />
                    Navigation Path
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-1 py-2 max-h-[60vh] overflow-y-auto">
                  {/* Home link */}
                  <Link
                    to="/"
                    className="flex items-center gap-3 py-2 px-3 rounded-md 
                      text-green-700 dark:text-green-300 
                      hover:bg-green-50 dark:hover:bg-green-900/50
                      transition-colors group"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    <Home className="w-5 h-5 text-green-500 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
                    <span className="flex-1 font-medium">Home</span>
                  </Link>

                  <Separator className="my-2" />
                  {
                    items.map((item, index) => {
                      const ItemIcon = item.icon || FolderIcon;
                      const isActive = index === items.length - 1;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`
                            flex items-center gap-3 py-2 px-3 rounded-md 
                            ${isActive
                              ? 'bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-200'
                              : 'text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/50'
                            }
                            transition-colors group
                          `}
                          onClick={() => setIsDialogOpen(false)}
                        >
                          <ItemIcon className={`
                            w-5 h-5 
                            ${isActive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-green-500 group-hover:text-green-700 dark:group-hover:text-green-300'
                            } 
                            transition-colors
                          `} />
                          <span className="flex-1 font-medium">{item.label}</span>
                          {isActive && (
                            <span className="text-xs py-0.5 px-2 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                              Current
                            </span>
                          )}
                        </Link>
                      );
                    })
                  }
                </div>

                <DialogFooter className="border-t border-green-100 dark:border-green-800 pt-3">
                  <Button
                    variant="outline"
                    className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/50"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close Navigation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <ChevronRight className="w-4 h-4 mx-2 text-green-500 dark:text-green-600 opacity-70 shrink-0" />
          </li>
        )}

        {items.length > 1 && (
          <li className="flex items-center shrink-0">
            <Link
              to={lastItem.path}
              className="text-[#1B6131] dark:text-[#46B749] hover:text-green-900 dark:hover:text-green-100 transition-colors whitespace-nowrap font-medium"
            >
              {lastItem.label}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-green-500 dark:text-green-600 opacity-70 shrink-0" />
          </li>
        )}

        <li
          aria-current="page"
          className="text-green-900 dark:text-green-100 font-semibold tracking-tight whitespace-nowrap"
        >
          {currentPage}
        </li>
      </ol>
    );
  };

  return (
    <div className={`bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] mb-8 shadow-sm ${className}`}>
      <div className="mx-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <div>
            <h2 className="text-xl font-bold text-[#1B6131] dark:text-[#46B749] tracking-tight">
              {currentPage}
            </h2>
            {subtitle && (
              <p className="hidden md:flex text-sm text-green-600 dark:text-green-400 mt-1 max-w-md truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <nav aria-label="breadcrumb" className="w-full sm:w-auto">
          {/* Responsive Breadcrumb */}
          <div className="block xl:hidden">
            <MobileBreadcrumb />
          </div>
          <div className="hidden xl:block">
            <DesktopBreadcrumb />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;