import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
    ChevronRight,
    ChevronDown,
    Edit,
    Plus,
    Building2,
    RefreshCw,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import Footer from '@/components/Footer';
import organizationUnitService, { OrganizationUnitTreeNode } from '@/services/organizationUnitService';

// Type to track expanded state of tree nodes
type ExpandedNodes = {
    [key: number]: boolean;
};

const OrganizationHierarchyPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [hierarchy, setHierarchy] = useState<OrganizationUnitTreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});

    // Fetch organization hierarchy
    useEffect(() => {
        fetchHierarchy();
    }, []);

    const fetchHierarchy = async () => {
        try {
            setIsLoading(true);
            const data = await organizationUnitService.getOrganizationHierarchy();
            setHierarchy(data.tree);
        } catch (error) {
            console.error('Failed to fetch organization hierarchy:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNode = (nodeId: number) => {
        setExpandedNodes(prev => ({
            ...prev,
            [nodeId]: !prev[nodeId]
        }));
    };

    const handleDeleteUnit = async (orgUnitId: number) => {
        if (window.confirm('Are you sure you want to delete this organization unit? This will also delete all child units.')) {
            try {
                await organizationUnitService.deleteOrganizationUnit(orgUnitId);
                // Refresh hierarchy after deletion
                fetchHierarchy();
            } catch (error) {
                console.error('Failed to delete organization unit:', error);
            }
        }
    };

    // Recursive component to render the tree
    const renderTreeNode = (node: OrganizationUnitTreeNode, level: number = 0) => {
        const isExpanded = expandedNodes[node.org_unit_id] || level < 2; // Auto-expand first two levels
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.org_unit_id} className="ml-4">
                <div className={`flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md ${level === 0 ? 'mt-2' : ''}`}>
                    <div 
                        className="mr-2 cursor-pointer" 
                        onClick={() => hasChildren && toggleNode(node.org_unit_id)}
                    >
                        {hasChildren ? (
                            isExpanded ? 
                                <ChevronDown className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" /> : 
                                <ChevronRight className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                        ) : (
                            <span className="w-4"></span> // Empty space for alignment
                        )}
                    </div>
                    <Building2 className="h-4 w-4 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-medium">{node.org_unit_name}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({node.org_unit_code})</span>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                    node.is_active 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                    {node.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                    Level {node.org_unit_level}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                    Type: {node.org_unit_type}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-7 w-7 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => window.location.href = `/performance-management/organization-units/${node.org_unit_id}/details`}>
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.location.href = `/performance-management/organization-units/${node.org_unit_id}/edit`}>
                                            Edit Unit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.location.href = `/performance-management/organization-units/add?parent=${node.org_unit_id}`}>
                                            Add Child Unit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUnit(node.org_unit_id)}>
                                            Delete Unit
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-2">
                        {node.children.map(childNode => renderTreeNode(childNode, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
               
            />

            <div className="flex">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        {/* <Breadcrumb
                            items={[{ name: 'Organization Units', href: '/performance-management/organization-units' }]}
                            currentPage="Organization Hierarchy"
                            showHomeIcon={true}
                        /> */}

                        {/* Organization Hierarchy Viewer */}
                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md mt-8">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="text-gray-700 dark:text-gray-200 flex p-0">
                                        Organization Hierarchy
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                            onClick={() => window.location.href = '/performance-management/organization-units/add'}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Root Unit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-[#1B6131] text-[#1B6131] hover:bg-[#f0f9f0] dark:border-[#46B749] dark:text-[#46B749] dark:hover:bg-[#0a2e14]"
                                            onClick={fetchHierarchy}
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 overflow-x-auto">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="text-center">
                                            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#1B6131] dark:text-[#46B749]" />
                                            <p className="mt-2">Loading organization hierarchy...</p>
                                        </div>
                                    </div>
                                ) : hierarchy.length > 0 ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-md p-4">
                                        {hierarchy.map(node => renderTreeNode(node))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="text-center">
                                            <p>No organization units found</p>
                                            <Button 
                                                className="mt-4 bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                                onClick={() => window.location.href = '/performance-management/organization-units/add'}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create First Organization Unit
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default OrganizationHierarchyPage;