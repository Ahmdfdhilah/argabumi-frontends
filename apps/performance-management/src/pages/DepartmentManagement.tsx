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
    User,
    Users,
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

// Dummy data types based on your database schema
type Department = {
    department_id: number;
    department_code: string;
    department_name: string;
    department_unit_type: string;
    department_description: string;
    department_manager_id: number;
    department_sm_manager_id: number;
    department_created_at: string;
    department_updated_at: string;
    manager_name?: string;
    sm_manager_name?: string;
    employee_count?: number;
    team_count?: number;
};

type Employee = {
    employee_id: number;
    employee_name: string;
};

const DepartmentManagementPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [_, setEmployees] = useState<Employee[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Generate dummy data
    useEffect(() => {
        // Dummy employees for managers
        const dummyEmployees: Employee[] = [
            { employee_id: 1, employee_name: 'John Doe' },
            { employee_id: 2, employee_name: 'Jane Smith' },
            { employee_id: 3, employee_name: 'Robert Johnson' },
            { employee_id: 4, employee_name: 'Emily Davis' },
            { employee_id: 5, employee_name: 'Michael Wilson' },
        ];

        // Dummy departments
        const dummyDepartments: Department[] = [
            {
                department_id: 1,
                department_code: 'IT-001',
                department_name: 'Information Technology',
                department_unit_type: 'Department',
                department_description: 'Handles all technology infrastructure and development',
                department_manager_id: 1,
                department_sm_manager_id: 2,
                department_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
                department_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
                employee_count: 25,
                team_count: 5
            },
            {
                department_id: 2,
                department_code: 'HR-001',
                department_name: 'Human Resources',
                department_unit_type: 'Department',
                department_description: 'Manages employee relations, recruitment, and benefits',
                department_manager_id: 3,
                department_sm_manager_id: 2,
                department_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString(),
                department_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
                employee_count: 12,
                team_count: 3
            },
            {
                department_id: 3,
                department_code: 'FIN-001',
                department_name: 'Finance',
                department_unit_type: 'Department',
                department_description: 'Handles company finances, accounting, and budgeting',
                department_manager_id: 4,
                department_sm_manager_id: 5,
                department_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
                department_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
                employee_count: 8,
                team_count: 2
            },
            {
                department_id: 4,
                department_code: 'MKT-001',
                department_name: 'Marketing',
                department_unit_type: 'Department',
                department_description: 'Responsible for brand management and marketing campaigns',
                department_manager_id: 5,
                department_sm_manager_id: 1,
                department_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(),
                department_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
                employee_count: 15,
                team_count: 4
            },
            {
                department_id: 5,
                department_code: 'OPS-001',
                department_name: 'Operations',
                department_unit_type: 'Division',
                department_description: 'Manages daily business operations and logistics',
                department_manager_id: 2,
                department_sm_manager_id: 3,
                department_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
                department_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                employee_count: 32,
                team_count: 7
            },
        ];

        // Add manager names to departments
        const departmentsWithDetails = dummyDepartments.map(dept => ({
            ...dept,
            manager_name: dummyEmployees.find(e => e.employee_id === dept.department_manager_id)?.employee_name,
            sm_manager_name: dummyEmployees.find(e => e.employee_id === dept.department_sm_manager_id)?.employee_name
        }));

        setEmployees(dummyEmployees);
        setDepartments(departmentsWithDetails);
        setFilteredDepartments(departmentsWithDetails);
    }, []);

    // Apply filters and search
    useEffect(() => {
        let result = [...departments];

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(dept =>
                dept.department_name.toLowerCase().includes(term) ||
                dept.department_code.toLowerCase().includes(term) ||
                dept.manager_name?.toLowerCase().includes(term) ||
                dept.sm_manager_name?.toLowerCase().includes(term)
            );
        }

        setFilteredDepartments(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, departments]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
    const totalItems = filteredDepartments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
                currentSystem='Performance Management System'
            />

            <div className="flex">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    role={currentRole}
                    system="performance-management"
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <Breadcrumb
                            items={[]}
                            currentPage="Department Management"
                            showHomeIcon={true}
                        />

                        {/* Combined Filter and Search Section */}
                        <Filtering
                        >
                            <div className="space-y-3 space-y-3 md:col-span-2">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                    <span>Search</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by department name, code, or manager..."
                                        className="pl-9 bg-white dark:bg-gray-800"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Filtering>

                        {/* Department Table */}
                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md mt-8">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="text-gray-700 dark:text-gray-200  flex p-0">
                                        Department List
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button

                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Department
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
                                                <th className="p-4 text-left font-medium">Department</th>
                                                <th className="p-4 text-left font-medium">Senior Manager</th>
                                                <th className="p-4 text-left font-medium">Manager</th>
                                                <th className="p-4 text-left font-medium">Employees</th>
                                                <th className="p-4 text-left font-medium">Teams</th>
                                                <th className="p-4 text-left font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentItems.length > 0 ? (
                                                currentItems.map((department) => (
                                                    <tr key={department.department_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="p-4">
                                                            <span className="inline-flex items-center text-[#1B6131] dark:text-white">
                                                                {department.department_code}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Building2 className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{department.department_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center space-x-2">
                                                                <User className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{department.manager_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Users className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{department.sm_manager_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="inline-flex items-center">
                                                                {department.employee_count} employees
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="inline-flex items-center">
                                                                {department.team_count} teams
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
                                                                        <DropdownMenuItem>
                                                                            <Users className="h-4 w-4 mr-2" />
                                                                            View Employees
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Building2 className="h-4 w-4 mr-2" />
                                                                            View Teams
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit Department
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600">
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete Department
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
                                                        No departments found
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
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default DepartmentManagementPage;