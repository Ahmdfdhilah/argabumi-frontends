import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
    User,
    Search,
    BarChart2Icon
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import Pagination from '@/components/Pagination';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';

// Types
type Unit = 'IT' | 'Marketing' | 'Sales' | 'Operations' | 'Customer Service' | 'Finance';

interface Employee {
    id: string;
    name: string;
    employeeNumber: string;
    department: string;
    position: string;
    unit: Unit;
    pendingPlans: number;
    inProgressPlans: number;
    completedPlans: number;
    totalPlans: number;
}

const IPMPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole] = useState('admin'); // employee, manager, sm_dept
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filterUnit, setFilterUnit] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Employee (Regular Employee)
    const employeeData: Employee = {
        id: '2',
        name: 'Jane Smith',
        employeeNumber: 'EMP002',
        department: 'Customer Experience',
        position: 'Employee',
        unit: 'Customer Service',
        pendingPlans: 1,
        inProgressPlans: 2,
        completedPlans: 0,
        totalPlans: 3
    };

    // Manager
    const managerData: Employee = {
        id: '3',
        name: 'John Anderson',
        employeeNumber: 'EMP003',
        department: 'Customer Experience',
        position: 'Manager',
        unit: 'Customer Service',
        pendingPlans: 0,
        inProgressPlans: 1,
        completedPlans: 2,
        totalPlans: 3
    };

    // Senior Manager
    const seniorManagerData: Employee = {
        id: '4',
        name: 'Sarah Johnson',
        employeeNumber: 'EMP004',
        department: 'Customer Experience',
        position: 'Senior Manager',
        unit: 'Customer Service',
        pendingPlans: 1,
        inProgressPlans: 0,
        completedPlans: 1,
        totalPlans: 2
    };

    // Admin
    const adminData: Employee = {
        id: '12',
        name: 'Admin User',
        employeeNumber: 'ADM001',
        department: 'IT',
        position: 'Admin',
        unit: 'IT',
        pendingPlans: 0,
        inProgressPlans: 0,
        completedPlans: 0,
        totalPlans: 0
    };

    const getCurrentUser = (): Employee => {
        switch (currentRole) {
            case 'admin':
                return adminData;
            case 'manager':
                return managerData;
            case 'sm_dept':
                return seniorManagerData;
            default:
                return employeeData;
        }
    };

    const currentUser = getCurrentUser();

    // Check if current user can view an employee's data based on permission matrix
    const canViewEmployee = (employee: Employee): boolean => {
        const entryOwnerRole = employee.position.toLowerCase().includes('manager')
            ? 'manager'
            : employee.position.toLowerCase().includes('senior manager')
                ? 'sm_dept'
                : 'employee';

        const viewerRole = currentRole;

        // Admin can view everything
        if (viewerRole === 'admin') return true;

        // Employee viewing their own data
        if (viewerRole === 'employee' && employee.id === currentUser.id) return true;

        // Manager viewing employees in same unit
        if (viewerRole === 'manager' && entryOwnerRole === 'employee' && employee.unit === currentUser.unit) return true;

        // Manager viewing their own data
        if (viewerRole === 'manager' && entryOwnerRole === 'manager' && employee.id === currentUser.id) return true;

        // SM Dept viewing employees in same department
        if (viewerRole === 'sm_dept' &&
            (entryOwnerRole === 'employee' || entryOwnerRole === 'manager') &&
            employee.department === currentUser.department) return true;

        // SM Dept viewing their own data
        if (viewerRole === 'sm_dept' && entryOwnerRole === 'sm_dept' && employee.id === currentUser.id) return true;

        return false;
    };

    // Mock data for employees with action plan counts
    const [employees, _setEmployees] = useState<Employee[]>([
        employeeData,
        managerData,
        seniorManagerData,
    ]);

    // Filter employees based on selected filters and permissions
    const getFilteredEmployees = () => {
        let filteredList = employees.filter(emp => canViewEmployee(emp));

        // Additional filters - apply only if a specific unit (not 'all') is selected
        if (filterUnit && filterUnit !== 'all') {
            filteredList = filteredList.filter(emp => emp.unit === filterUnit);
        }

        // Search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredList = filteredList.filter(emp =>
                emp.name.toLowerCase().includes(term) ||
                emp.employeeNumber.toLowerCase().includes(term) ||
                emp.position.toLowerCase().includes(term) ||
                emp.unit.toLowerCase().includes(term) ||
                emp.department.toLowerCase().includes(term)
            );
        }

        return filteredList;
    };

    const filteredEmployees = getFilteredEmployees();

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterUnit, searchTerm, currentRole, itemsPerPage]);

    // Get current employees for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    // Handle employee selection/click
    const handleEmployeeSelect = (employeeId: string) => {
        navigate(`/performance-management/ipm/${employeeId}/details`)
    };

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat overflow-x-hidden">
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
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <div className="space-y-6 w-full">
                            <Breadcrumb
                                items={[]}
                                currentPage="Individual Performance Management"
                                showHomeIcon={true}
                            />

                            <Filtering>
                                {currentRole !== 'employee' && (
                                    <>
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                                <span>Search</span>
                                            </label>
                                            <Input
                                                placeholder="Search employees..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                <User className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                                <span>Unit</span>
                                            </label>
                                            <Select
                                                value={filterUnit}
                                                onValueChange={setFilterUnit}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Filter by Unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Units</SelectItem>
                                                    <SelectItem value="IT">IT</SelectItem>
                                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                                    <SelectItem value="Sales">Sales</SelectItem>
                                                    <SelectItem value="Operations">Operations</SelectItem>
                                                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                                                    <SelectItem value="Finance">Finance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                                <span>Team</span>
                                            </label>
                                            <Select>
                                                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                                    <SelectValue placeholder="All Teams" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Teams</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                                <span>Status</span>
                                            </label>
                                            <Select>
                                                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                                    <SelectValue placeholder="All Statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Statuses</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </Filtering>

                            {/* Employee List Card */}
                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md w-full">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                                    <CardTitle className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                        {currentRole === 'employee' ? 'My Performance Plans' : 'Employee Performance Plans'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="w-full mt-4">
                                    {/* Employee List */}
                                    <div className="space-y-4 w-full">
                                        {currentEmployees.length > 0 ? (
                                            currentEmployees.map((employee) => (
                                                <div
                                                    key={employee.id}
                                                    className="border rounded-lg p-3 sm:p-4 hover:bg-[#f0f9f0] dark:hover:bg-[#0a2e14]/30 cursor-pointer transition-colors w-full"
                                                    onClick={() => handleEmployeeSelect(employee.id)}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 w-full">
                                                        <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#1B6131] text-white flex items-center justify-center flex-shrink-0">
                                                                <User className="h-4 w-4 sm:h-6 sm:w-6" />
                                                            </div>
                                                            <div className="flex-grow overflow-hidden">
                                                                <h3 className="font-medium text-sm sm:text-base truncate">{employee.name}</h3>
                                                                <p className="text-xs sm:text-sm text-gray-500 truncate">{employee.employeeNumber} - {employee.position}</p>
                                                                <p className="text-xs text-gray-500 truncate">{employee.unit} | {employee.department}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap sm:flex-col lg:flex-row gap-1 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-start sm:justify-center">
                                                            <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
                                                                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                                                <span className="text-xs font-medium">Pending: {employee.pendingPlans}</span>
                                                            </div>
                                                            <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
                                                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                                <span className="text-xs font-medium">In Progress: {employee.inProgressPlans}</span>
                                                            </div>
                                                            <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
                                                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                                <span className="text-xs font-medium">Completed: {employee.completedPlans}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No employees found matching the selected filters.
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredEmployees.length}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default IPMPage;