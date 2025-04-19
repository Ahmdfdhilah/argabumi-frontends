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
    User,
    Mail,
    Edit,
    Plus,
    Search,
    UserX,
    UserCheck,
    Building2,
    Briefcase,
    Trash2,
    Eye,
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
import employeeService, { Employee } from '@/services/employeeService';
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

// Types for filtering
interface OrgUnit {
    org_unit_id: number;
    org_unit_name: string;
}

const EmployeeManagementPage = () => {
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
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    
    // Filters State
    const [filters, setFilters] = useState({
        orgUnit: '',
        status: 'all',
        supervisorId: '',
    });
    
    // Delete confirmation dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

    // Fetch employees data
    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                const skip = (currentPage - 1) * itemsPerPage;
                const data = await employeeService.getEmployees(skip, itemsPerPage);
                setEmployees(data);
                setFilteredEmployees(data);
                // In a real API, you would get the total count from the response
                // For now, we'll estimate it
                setTotalItems(data.length + skip);
                
                // Fetch org units for filtering (in a real app, you'd have a separate service)
                // This is a mock - you should replace with actual API call
                const uniqueOrgUnits = Array.from(
                    new Set(data.map(emp => emp.employee_org_unit_id))
                ).filter(id => id !== null && id !== undefined);
                
                const orgUnitsList = uniqueOrgUnits.map(id => {
                    const emp = data.find(e => e.employee_org_unit_id === id);
                    return {
                        org_unit_id: id as number,
                        org_unit_name: emp?.org_unit_name || `Department ${id}`
                    };
                });
                
                setOrgUnits(orgUnitsList);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
               
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployees();
    }, [currentPage, itemsPerPage]);

    // Handle search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredEmployees(employees);
            return;
        }
        
        const searchEmployees = async () => {
            try {
                const results = await employeeService.searchEmployees(searchTerm, 20);
                setFilteredEmployees(results);
            } catch (error) {
                console.error("Error searching employees:", error);
            }
        };
        
        const debounce = setTimeout(() => {
            searchEmployees();
        }, 500);
        
        return () => clearTimeout(debounce);
    }, [searchTerm, employees]);

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
        let result = [...employees];
        
        // Apply org unit filter
        if (filters.orgUnit) {
            result = result.filter(emp => 
                emp.employee_org_unit_id === parseInt(filters.orgUnit)
            );
        }
        
        // Apply status filter
        if (filters.status !== 'all') {
            const activeStatus = filters.status === 'active';
            result = result.filter(emp => emp.is_active === activeStatus);
        }
        
        // Apply supervisor filter
        if (filters.supervisorId) {
            result = result.filter(emp => 
                emp.employee_supervisor_id === parseInt(filters.supervisorId)
            );
        }
        
        setFilteredEmployees(result);
    }, [filters, employees]);

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };
    
    // Navigate to create new employee page
    const handleCreateEmployee = () => {
        navigate('/performance-management/employees/add');
    };
    
    // Navigate to employee details page
    const handleViewEmployee = (employeeId: number) => {
        navigate(`/performance-management/employees/${employeeId}/details`);
    };
    
    // Navigate to edit employee page
    const handleEditEmployee = (employeeId: number) => {
        navigate(`/performance-management/employees/${employeeId}/edit`);
    };
    
    // Handle employee status toggle
    const handleToggleStatus = async (employeeId: number, currentStatus: boolean) => {
        try {
            await employeeService.updateEmployee(employeeId, {
                is_active: !currentStatus
            });
            
            // Update local state
            setEmployees(prevEmployees => 
                prevEmployees.map(emp => 
                    emp.employee_id === employeeId 
                        ? { ...emp, is_active: !currentStatus } 
                        : emp
                )
            );
            
            toast({
                title: "Success",
                description: `Employee ${currentStatus ? 'deactivated' : 'activated'} successfully`,
            });
        } catch (error) {
            console.error("Failed to update employee status:", error);
        }
    };
    
    // Handle employee delete
    const handleDeleteClick = (employeeId: number) => {
        setEmployeeToDelete(employeeId);
        setIsDeleteDialogOpen(true);
    };
    
    const confirmDelete = async () => {
        if (!employeeToDelete) return;
        
        try {
            await employeeService.deleteEmployee(employeeToDelete);
            
            // Remove from local state
            setEmployees(prev => prev.filter(emp => emp.employee_id !== employeeToDelete));
            setFilteredEmployees(prev => prev.filter(emp => emp.employee_id !== employeeToDelete));
            
            toast({
                title: "Success",
                description: "Employee deleted successfully",
            });
        } catch (error) {
            console.error("Failed to delete employee:", error);
        } finally {
            setIsDeleteDialogOpen(false);
            setEmployeeToDelete(null);
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
                        {/* <Breadcrumb
                            items={[{label: 'Dashboard', href: '/'}]}
                            currentPage="Employee Management"
                            showHomeIcon={true}
                        /> */}

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
                                            placeholder="Search by name, employee number, or email..."
                                            className="pl-9 bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Building2 className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Organization Unit</span>
                                    </label>
                                    <select
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md"
                                        value={filters.orgUnit}
                                        onChange={(e) => handleFilterChange('orgUnit', e.target.value)}
                                    >
                                        <option value="">All Organization Units</option>
                                        {orgUnits.map(unit => (
                                            <option key={unit.org_unit_id} value={unit.org_unit_id}>
                                                {unit.org_unit_name}
                                            </option>
                                        ))}
                                    </select>
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

                        {/* Employee Table */}
                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="text-gray-700 dark:text-gray-200 flex p-0">
                                        Employee List
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            onClick={handleCreateEmployee}
                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Employee
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 pb-8">
                                <div className="rounded-md border border-gray-200 dark:border-gray-700">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Employee ID</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Organization</TableHead>
                                                <TableHead>Position</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">
                                                        <div className="flex justify-center items-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#46B749]"></div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredEmployees.length > 0 ? (
                                                filteredEmployees.map((employee) => (
                                                    <TableRow key={employee.employee_id}>
                                                        <TableCell>{employee.employee_number}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <User className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{employee.employee_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{employee.employee_email || '-'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Building2 className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{employee.org_unit_name || '-'}</span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Briefcase className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{employee.employee_position || '-'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={employee.is_active ? 'default' : 'secondary'}
                                                                className={employee.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                                                            >
                                                                {employee.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Open menu</span>
                                                                        <Edit className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleViewEmployee(employee.employee_id)}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleEditEmployee(employee.employee_id)}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleStatus(employee.employee_id, employee.is_active)}>
                                                                        {employee.is_active ? (
                                                                            <>
                                                                                <UserX className="h-4 w-4 mr-2" />
                                                                                Deactivate
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                                Activate
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDeleteClick(employee.employee_id)}
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
                                                    <TableCell colSpan={7} className="h-24 text-center">
                                                        No employees found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination Component */}
                                {filteredEmployees.length > 0 && (
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
                            Are you sure you want to delete this employee? This action cannot be undone.
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

export default EmployeeManagementPage;