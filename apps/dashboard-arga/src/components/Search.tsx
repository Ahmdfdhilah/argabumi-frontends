import { Search, X, CornerDownLeft } from 'lucide-react';
import { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

// Define the structure for search suggestions/results
interface SearchResult {
  id: string;
  title: string;
  path: string;
  icon?: string;
  type: 'menu' | 'content' | 'recent';
  description?: string;
}

interface SearchBarProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  mobileClassName?: string;
  currentRole: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  isSearchOpen,
  setIsSearchOpen,
  onSearch,
  placeholder = 'Search dashboards, reports, KPIs...',
  className = '',
  mobileClassName = '',
  currentRole = 'employee',
}) => {
  const navigate = useNavigate(); // Add useNavigate hook
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mock navigation data based on your menu structure
  const navigationItems = [
    { id: 'home', title: 'Home', path: '/', type: 'menu', roles: ['admin', 'manager', 'sm_dept', 'employee'] },
    { id: 'dashboard', title: 'Dashboard', path: '/performance-management/dashboard', type: 'menu', roles: ['admin', 'manager', 'sm_dept'] },
    { id: 'period-master', title: 'Period Master', path: '/performance-management/period-master', type: 'menu', roles: ['admin', 'manager', 'sm_dept'] },
    { id: 'departments', title: 'Department Management', path: '/performance-management/organization-units/departments', type: 'menu', roles: ['admin'] },
    { id: 'teams', title: 'Teams Management', path: '/performance-management/organization-units/teams', type: 'menu', roles: ['admin'] },
    { id: 'employees', title: 'Employee Management', path: '/performance-management/organization-units/employees', type: 'menu', roles: ['admin'] },
    { id: 'bsc-dashboard', title: 'BSC Dashboard', path: '/performance-management/bsc/dashboard', type: 'menu', roles: ['admin', 'manager', 'sm_dept'] },
    { id: 'bsc-input', title: 'BSC KPI Input', path: '/performance-management/bsc/input', type: 'menu', roles: ['admin', 'manager'] },
    { id: 'ipm', title: 'Individual Performance', path: '/performance-management/ipm', type: 'menu', roles: ['admin', 'employee', 'manager', 'sm_dept'] },
    { id: 'mpm-dashboard', title: 'MPM Dashboard', path: '/performance-management/mpm/dashboard', type: 'menu', roles: ['admin', 'manager', 'sm_dept'] },
    { id: 'mpm-actual', title: 'MPM Actual', path: '/performance-management/mpm/actual', type: 'menu', roles: ['admin', 'manager', 'sm_dept'] },
    { id: 'mpm-target', title: 'MPM Target', path: '/performance-management/mpm/target', type: 'menu', roles: ['admin', 'manager', 'sm_dept'] },
  ];

  // Sample content items for search
  const contentItems: SearchResult[] = [
    { id: 'kpi-report-q1', title: 'Q1 KPI Performance Report', path: '/reports/kpi-q1', type: 'content', description: 'Quarterly KPI performance summary' },
    { id: 'company-structure', title: 'Company Organization Structure', path: '/company/structure', type: 'content', description: 'Current organization hierarchy' },
    { id: 'employee-handbook', title: 'Employee Performance Handbook', path: '/resources/handbook', type: 'content', description: 'Guidelines for performance reviews' },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const updatedSearches = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5); // Keep only the 5 most recent searches

    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle clicks outside the search component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search query to prevent excessive processing
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Process search and update suggestions when query changes
  useEffect(() => {
    if (!debouncedSearchQuery) {
      // Show recent searches when search field is empty but focused
      if (isSearchOpen && showSuggestions) {
        const recentItems: SearchResult[] = recentSearches.map((query, index) => ({
          id: `recent-${index}`,
          title: query,
          path: '',
          type: 'recent',
          description: 'Recent search'
        }));
        setSuggestions(recentItems);
      } else {
        setSuggestions([]);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Filter navigation items based on query and user role
    const filteredNavItems = navigationItems
      .filter(item =>
        item.roles.includes(currentRole) &&
        item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
      .map(item => ({
        id: item.id,
        title: item.title,
        path: item.path,
        type: 'menu' as const,
        description: `Navigate to ${item.title}`
      }));

    // Filter content items
    const filteredContentItems = contentItems
      .filter(item =>
        item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      );

    // Combine and sort results
    const combinedResults = [...filteredNavItems, ...filteredContentItems];

    // Sort by relevance - exact matches first, then starts with, then includes
    const sortedResults = combinedResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const query = debouncedSearchQuery.toLowerCase();

      if (aTitle === query && bTitle !== query) return -1;
      if (bTitle === query && aTitle !== query) return 1;
      if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
      if (bTitle.startsWith(query) && !aTitle.startsWith(query)) return 1;
      return aTitle.localeCompare(bTitle);
    });

    setSuggestions(sortedResults);
    setIsLoading(false);
  }, [debouncedSearchQuery, currentRole, isSearchOpen, showSuggestions, recentSearches]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    onSearch(searchQuery);
    saveRecentSearch(searchQuery);
    setShowSuggestions(false);

    if (isMobile) {
      setIsSearchOpen(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    onSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    if (suggestion.type === 'recent') {
      setSearchQuery(suggestion.title);
      onSearch(suggestion.title);
    } else {
      setSearchQuery(suggestion.title);
      onSearch(suggestion.title);
      saveRecentSearch(suggestion.title);

      // Navigate to the suggestion's path
      if (suggestion.path) {
        navigate(suggestion.path);
        setShowSuggestions(false);

        // Close mobile search if on mobile
        if (isMobile) {
          setIsSearchOpen(false);
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    }

    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    }

    // Enter to select
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }

    // Escape to close
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Render suggestion item
  const renderSuggestionItem = (suggestion: SearchResult, index: number) => {
    const isSelected = index === selectedIndex;

    return (
      <div
        key={suggestion.id}
        className={`px-4 py-3 cursor-pointer flex items-start gap-3 ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
          } hover:bg-gray-100 dark:hover:bg-gray-700`}
        onClick={() => handleSuggestionClick(suggestion)}
      >
        {suggestion.type === 'menu' && (
          <div className="mt-0.5 flex-shrink-0 w-5 h-5 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
        )}
        {suggestion.type === 'content' && (
          <div className="mt-0.5 flex-shrink-0 w-5 h-5 text-blue-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {suggestion.type === 'recent' && (
          <div className="mt-0.5 flex-shrink-0 w-5 h-5 text-gray-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{suggestion.title}</div>
          {suggestion.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {suggestion.description}
            </div>
          )}
        </div>

        {isSelected && (
          <div className="flex-shrink-0 self-center text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span className="text-xs">Enter</span>
            <CornerDownLeft className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };

  // Mobile search overlay
  if (isMobile && isSearchOpen) {
    return (
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsSearchOpen(false);
            setShowSuggestions(false);
          }
        }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex flex-col">
        <div className={`bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 ${mobileClassName}`}>
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-16 py-2 text-base w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              autoFocus
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="mr-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setShowSuggestions(false);
                }}
                className="ml-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Mobile search suggestions */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsSearchOpen(false);
                setShowSuggestions(false);
              }
            }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : suggestions.length > 0 ? (
              <div>
                {suggestions.map((suggestion, index) =>
                  renderSuggestionItem(suggestion, index)
                )}
              </div>
            ) : searchQuery ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Start typing to search
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop search bar
  return (
    <div className={`hidden md:block flex-1 max-w-lg mx-6 relative ${className}`}>
      <form onSubmit={handleSearch} className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsSearchOpen(true);
            setShowSuggestions(true);
          }}
          className="pl-10 pr-10 py-2 text-sm w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
        />

        {/* Keyboard shortcut indicator */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {!searchQuery && (
            <div className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
              ⌘K
            </div>
          )}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="pointer-events-auto"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </form>

      {/* Search suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto z-40"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {/* Fixed: Use proper type checking */}
              {suggestions.length > 0 && suggestions[0].type === 'recent' && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750">
                  Recent searches
                </div>
              )}

              {suggestions.map((suggestion, index) => {
                // Add section headers
                const currentType = suggestion.type;
                const prevType = index > 0 ? suggestions[index - 1].type : null;

                // Only show section header when type changes and properly check type
                let showHeader = false;

                if (currentType === 'menu' || currentType === 'content') {
                  // Only show header when changing from recent to non-recent or between menu and content
                  if (index === 0 ||
                    (prevType === 'recent') ||
                    (prevType !== currentType && (prevType === 'menu' || prevType === 'content'))) {
                    showHeader = true;
                  }
                }

                return (
                  <div key={suggestion.id}>
                    {showHeader && (
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750">
                        {currentType === 'menu' ? 'Navigation' : 'Content'}
                      </div>
                    )}
                    {renderSuggestionItem(suggestion, index)}
                  </div>
                );
              })}

              {/* Search all results footer */}
              <div
                className="px-4 py-3 text-center text-sm border-t border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer font-medium"
                onClick={() => {
                  handleSearch(new Event('submit') as any);
                }}
              >
                Search for "{searchQuery}"
              </div>
            </>
          ) : searchQuery ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No results found for "{searchQuery}"
            </div>
          ) : recentSearches.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 flex justify-between items-center">
                <span>Recent searches</span>
                <button
                  className="text-xs text-blue-500 hover:text-blue-700"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((query, index) => (
                <div
                  key={`recent-${index}`}
                  className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setSearchQuery(query);
                    onSearch(query);
                    setShowSuggestions(false);
                  }}
                >
                  <div className="flex-shrink-0 w-5 h-5 text-gray-400">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="text-sm">{query}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Start typing to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;