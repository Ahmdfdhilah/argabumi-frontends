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
    Building2,
    Edit,
    Plus,
    Search,
    Trash2,
    PlusCircle,
    Info,
    LayoutGrid
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';
import organizationUnitService, { OrganizationUnitResponse } from '@/services/organizationUnitService';
import { useNavigate } from 'react-router-dom';
const OrganizationUnitsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [organizationUnits, setOrganizationUnits] = useState<OrganizationUnitResponse[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<OrganizationUnitResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch organization units
    useEffect(() => {
        const fetchOrganizationUnits = async () => {
            try {
                setIsLoading(true);
                const data = await organizationUnitService.getOrganizationUnits(0, 100);
                setOrganizationUnits(data);
                setFilteredUnits(data);
            } catch (error) {
                console.error('Failed to fetch organization units:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizationUnits();
    }, []);

    // Apply search filter
    useEffect(() => {
        let result = [...organizationUnits];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(unit =>
                unit.org_unit_name.toLowerCase().includes(term) ||
                unit.org_unit_code.toLowerCase().includes(term) ||
                unit.org_unit_type.toLowerCase().includes(term)
            );
        }

        setFilteredUnits(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, organizationUnits]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUnits.slice(indexOfFirstItem, indexOfLastItem);
    const totalItems = filteredUnits.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    const handleDeleteUnit = async (orgUnitId: number) => {
        if (window.confirm('Are you sure you want to delete this organization unit?')) {
            try {
                await organizationUnitService.deleteOrganizationUnit(orgUnitId);
                // Refresh data after deletion
                const updatedUnits = await organizationUnitService.getOrganizationUnits(0, 100);
                setOrganizationUnits(updatedUnits);
                setFilteredUnits(updatedUnits);
            } catch (error) {
                console.error('Failed to delete organization unit:', error);
            }
        }
    };

    const handleCreateUnit = () => {
        navigate('/performance-management/organization-units/add');
    }

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

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        <Breadcrumb
                            items={[]}
                            currentPage="Organization Units"
                            showHomeIcon={true}
                        />

                        {/* Combined Filter and Search Section */}
                        <Filtering>
                            <div className="space-y-3 md:col-span-2">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                    <span>Search</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by unit name, code, or type..."
                                        className="pl-9 bg-white dark:bg-gray-800"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Filtering>

                        {/* Organization Units Table */}
                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md mt-8">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="text-gray-700 dark:text-gray-200 flex p-0">
                                        Organization Units
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button 
                                            onClick={handleCreateUnit}
                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Organization Unit
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 pb-8">
                                <div className="border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#1B6131] text-white">
                                            <tr>
                                                <th className="p-4 text-left font-medium">Code</th>
                                                <th className="p-4 text-left font-medium">Name</th>
                                                <th className="p-4 text-left font-medium">Type</th>
                                                <th className="p-4 text-left font-medium">Level</th>
                                                <th className="p-4 text-left font-medium">Path</th>
                                                <th className="p-4 text-left font-medium">Status</th>
                                                <th className="p-4 text-left font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={7} className="p-8 text-center">
                                                        Loading organization units...
                                                    </td>
                                                </tr>
                                            ) : currentItems.length > 0 ? (
                                                currentItems.map((unit) => (
                                                    <tr key={unit.org_unit_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="p-4">
                                                            <span className="inline-flex items-center text-[#1B6131] dark:text-white">
                                                                {unit.org_unit_code}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Building2 className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{unit.org_unit_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span>{unit.org_unit_type}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span>Level {unit.org_unit_level}</span>
                                                        </td>
                                                        <td className="p-4 max-w-xs truncate">
                                                            <span title={unit.org_unit_path}>{unit.org_unit_path}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                unit.is_active 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}>
                                                                {unit.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex space-x-2">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                                            <span className="sr-only">Open menu</span>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => window.location.href = `/performance-management/organization-units/${unit.org_unit_id}/details`}>
                                                                            <Info className="h-4 w-4 mr-2" />
                                                                            View Details
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => window.location.href = `/performance-management/organization-units/${unit.org_unit_id}/edit`}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit Unit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => window.location.href = `/performance-management/organization-units/add?parent=${unit.org_unit_id}`}>
                                                                            <PlusCircle className="h-4 w-4 mr-2" />
                                                                            Add Child Unit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUnit(unit.org_unit_id)}>
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete Unit
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="p-8 text-center">
                                                        No organization units found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    itemsPerPage={itemsPerPage}
                                    totalItems={totalItems}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            </CardContent>
                        </Card>

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
                                            onClick={() => window.location.href = '/performance-management/organization-units/hierarchy'}
                                        >
                                            <LayoutGrid className="h-4 w-4 mr-2" />
                                            View Full Hierarchy
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="py-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    View the complete organizational structure to better understand the relationships between different units.
                                </p>
                            </CardContent>
                        </Card>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default OrganizationUnitsPage;