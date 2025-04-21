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
    ShieldCheck,
    Key,
    Edit,
    Plus,
    Search,
    UserCheck,
    Trash2,
    Eye,
    LockKeyhole,
    Lock,
    Settings,
} from 'lucide-react';
import Pagination from '@/components/Pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';
import { useToast } from "@workspace/ui/components/sonner";
import roleService, { Role } from '@/services/roleService';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@workspace/ui/components/alert-dialog";
import { useNavigate } from 'react-router-dom';

const RoleManagementPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    
    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Data State
    const [roles, setRoles] = useState<Role[]>([]);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    
    // Filters State
    const [filters, setFilters] = useState({
        status: 'all',
    });
    
    // Delete confirmation dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

    // Fetch roles data
    useEffect(() => {
        const fetchRoles = async () => {
            setIsLoading(true);
            try {
                const skip = (currentPage - 1) * itemsPerPage;
                const data = await roleService.getRoles(skip, itemsPerPage);
                setRoles(data);
                setFilteredRoles(data);
                // In a real API, you would get the total count from the response
                setTotalItems(data.length + skip);
            } catch (error) {
                console.error("Failed to fetch roles:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoles();
    }, [currentPage, itemsPerPage]);

    // Handle search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredRoles(roles);
            return;
        }
        
        const searchRoles = async () => {
            try {
                const results = await roleService.searchRoles(searchTerm, 20);
                setFilteredRoles(results);
            } catch (error) {
                console.error("Error searching roles:", error);
            }
        };
        
        const debounce = setTimeout(() => {
            searchRoles();
        }, 500);
        
        return () => clearTimeout(debounce);
    }, [searchTerm, roles]);

    // Handle filter changes
    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Reset to first page when filters change
        setCurrentPage(1);
    };

    // Apply filters
    useEffect(() => {
        let result = [...roles];
        
        // Apply status filter
        if (filters.status !== 'all') {
            const activeStatus = filters.status === 'active';
            result = result.filter(role => role.is_active === activeStatus);
        }
        
        setFilteredRoles(result);
    }, [filters, roles]);

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };
    
    // Navigate to create new role page
    const handleCreateRole = () => {
        navigate('/performance-management/roles/add');
    };
    
    // Navigate to role details page
    const handleViewRole = (roleId: number) => {
        navigate(`/performance-management/roles/${roleId}/details`);
    };
    
    // Navigate to edit role page
    const handleEditRole = (roleId: number) => {
        navigate(`/performance-management/roles/${roleId}/edit`);
    };
    
    // Navigate to role permissions page
    const handleManagePermissions = (roleId: number) => {
        navigate(`/performance-management/roles/${roleId}/permissions`);
    };
    
    // Handle role status toggle
    const handleToggleStatus = async (roleId: number, currentStatus: boolean) => {
        try {
            await roleService.updateRole(roleId, {
                is_active: !currentStatus
            });
            
            // Update local state
            setRoles(prevRoles => 
                prevRoles.map(role => 
                    role.role_id === roleId 
                        ? { ...role, is_active: !currentStatus } 
                        : role
                )
            );
            
            toast({
                title: "Success",
                description: `Role ${currentStatus ? 'deactivated' : 'activated'} successfully`,
            });
        } catch (error) {
            console.error("Failed to update role status:", error);
        }
    };
    
    // Handle role delete
    const handleDeleteClick = (roleId: number) => {
        setRoleToDelete(roleId);
        setIsDeleteDialogOpen(true);
    };
    
    const confirmDelete = async () => {
        if (!roleToDelete) return;
        
        try {
            await roleService.deleteRole(roleToDelete);
            
            // Remove from local state
            setRoles(prev => prev.filter(role => role.role_id !== roleToDelete));
            setFilteredRoles(prev => prev.filter(role => role.role_id !== roleToDelete));
            
            toast({
                title: "Success",
                description: "Role deleted successfully",
            });
        } catch (error) {
            console.error("Failed to delete role:", error);
        } finally {
            setIsDeleteDialogOpen(false);
            setRoleToDelete(null);
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
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
                        {/* Search and Filter Section */}
                        <div className="mb-6">
                            <Filtering>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search</span>
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by role name or code..."
                                            className="pl-9 bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <UserCheck className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Status</span>
                                    </label>
                                    <select
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </Filtering>
                        </div>

                        {/* Role Table */}
                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="text-gray-700 dark:text-gray-200 flex p-0">
                                        Role List
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            onClick={handleCreateRole}
                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Role
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 pb-8">
                                <div className="rounded-md border border-gray-200 dark:border-gray-700">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Role ID</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        <div className="flex justify-center items-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#46B749]"></div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredRoles.length > 0 ? (
                                                filteredRoles.map((role) => (
                                                    <TableRow key={role.role_id}>
                                                        <TableCell>{role.role_id}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <ShieldCheck className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{role.role_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Key className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{role.role_code}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="truncate max-w-xs">{role.role_description || '-'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={role.is_active ? 'default' : 'secondary'}
                                                                className={role.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                                                            >
                                                                {role.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Open menu</span>
                                                                        <Settings className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleViewRole(role.role_id)}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleEditRole(role.role_id)}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleManagePermissions(role.role_id)}>
                                                                        <LockKeyhole className="h-4 w-4 mr-2" />
                                                                        Manage Permissions
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleStatus(role.role_id, role.is_active)}>
                                                                        {role.is_active ? (
                                                                            <>
                                                                                <Lock className="h-4 w-4 mr-2" />
                                                                                Deactivate
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <ShieldCheck className="h-4 w-4 mr-2" />
                                                                                Activate
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDeleteClick(role.role_id)}
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        No roles found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination Component */}
                                {filteredRoles.length > 0 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={totalItems}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </main>
                    <Footer />
                </div>
            </div>
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this role? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RoleManagementPage;