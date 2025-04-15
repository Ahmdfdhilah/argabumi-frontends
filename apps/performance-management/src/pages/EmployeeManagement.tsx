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
    Users2,
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
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
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';

// Dummy data types based on your database schema
type Employee = {
    employee_id: number;
    employee_number: string;
    employee_name: string;
    employee_department_id: number;
    employee_team_id: number;
    employee_email: string;
    employee_phone: string;
    employee_is_active: boolean;
    employee_created_at: string;
    employee_updated_at: string;
    department_name?: string;
    team_name?: string;
    is_manager?: boolean;
};

type Department = {
    department_id: number;
    department_name: string;
};

type Team = {
    team_id: number;
    team_name: string;
};

const EmployeeManagementPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        department: '',
        team: '',
        status: 'all',
        isManager: 'all'
    });

    // Generate dummy data
    useEffect(() => {
        // Dummy departments
        const dummyDepartments: Department[] = [
            { department_id: 1, department_name: 'Information Technology' },
            { department_id: 2, department_name: 'Human Resources' },
            { department_id: 3, department_name: 'Finance' },
            { department_id: 4, department_name: 'Marketing' },
            { department_id: 5, department_name: 'Operations' },
        ];

        // Dummy teams
        const dummyTeams: Team[] = [
            { team_id: 1, team_name: 'Frontend Development' },
            { team_id: 2, team_name: 'Backend Development' },
            { team_id: 3, team_name: 'Recruitment' },
            { team_id: 4, team_name: 'Payroll' },
            { team_id: 5, team_name: 'Digital Marketing' },
        ];

        // Dummy employees
        const dummyEmployees: Employee[] = Array.from({ length: 50 }, (_, i) => ({
            employee_id: i + 1,
            employee_number: `EMP${String(i + 1).padStart(4, '0')}`,
            employee_name: `Employee ${i + 1}`,
            employee_department_id: dummyDepartments[Math.floor(Math.random() * dummyDepartments.length)].department_id,
            employee_team_id: dummyTeams[Math.floor(Math.random() * dummyTeams.length)].team_id,
            employee_email: `employee${i + 1}@company.com`,
            employee_phone: `+62 812-${String(Math.floor(1000 + Math.random() * 9000))}-${String(Math.floor(1000 + Math.random() * 9000))}`,
            employee_is_active: Math.random() > 0.2,
            employee_created_at: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)).toISOString(),
            employee_updated_at: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)).toISOString(),
            is_manager: Math.random() > 0.7,
        }));

        // Add department and team names to employees
        const employeesWithDetails = dummyEmployees.map(emp => ({
            ...emp,
            department_name: dummyDepartments.find(d => d.department_id === emp.employee_department_id)?.department_name,
            team_name: dummyTeams.find(t => t.team_id === emp.employee_team_id)?.team_name
        }));

        setDepartments(dummyDepartments);
        setTeams(dummyTeams);
        setEmployees(employeesWithDetails);
        setFilteredEmployees(employeesWithDetails);
    }, []);

    // Apply filters and search
    useEffect(() => {
        let result = [...employees];

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(emp =>
                emp.employee_name.toLowerCase().includes(term) ||
                emp.employee_number.toLowerCase().includes(term) ||
                emp.employee_email.toLowerCase().includes(term)
            );
        }

        // Apply department filter
        if (filters.department) {
            result = result.filter(emp =>
                emp.employee_department_id === parseInt(filters.department)
            );
        }

        // Apply team filter
        if (filters.team) {
            result = result.filter(emp =>
                emp.employee_team_id === parseInt(filters.team)
            );
        }

        // Apply status filter
        if (filters.status !== 'all') {
            const activeStatus = filters.status === 'active';
            result = result.filter(emp => emp.employee_is_active === activeStatus);
        }

        // Apply manager filter
        if (filters.isManager !== 'all') {
            const isManager = filters.isManager === 'yes';
            result = result.filter(emp => emp.is_manager === isManager);
        }

        setFilteredEmployees(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, filters, employees]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
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
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>     <Breadcrumb
                        items={[]}
                        currentPage="Employee Management"
                        showHomeIcon={true}
                    />

                        {/* Search and Filter Section - using the FilterSection component */}
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
                                        <span>Department</span>
                                    </label>
                                    <select
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md"
                                        value={filters.department}
                                        onChange={(e) => handleFilterChange('department', e.target.value)}
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept.department_id} value={String(dept.department_id)}>
                                                {dept.department_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <span>Team</span>
                                    </label>
                                    <select
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md"
                                        value={filters.team}
                                        onChange={(e) => handleFilterChange('team', e.target.value)}
                                    >
                                        <option value="">All Teams</option>
                                        {teams.map(team => (
                                            <option key={team.team_id} value={String(team.team_id)}>
                                                {team.team_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
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

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <span>Role</span>
                                    </label>
                                    <select
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md"
                                        value={filters.isManager}
                                        onChange={(e) => handleFilterChange('isManager', e.target.value)}
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="yes">Managers</option>
                                        <option value="no">Non-Managers</option>
                                    </select>
                                </div>
                            </Filtering>
                        </div>

                        {/* Employee Table */}
                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                        <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="text-gray-700 dark:text-gray-200  flex p-0">
                                        Employee List
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button

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
                                                <TableHead>Department</TableHead>
                                                <TableHead>Team</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems.length > 0 ? (
                                                currentItems.map((employee) => (
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
                                                                <span>{employee.employee_email}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Building2 className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{employee.department_name}</span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Users2 className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{employee.team_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={employee.employee_is_active ? 'default' : 'secondary'}
                                                                className={employee.employee_is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                                                            >
                                                                {employee.employee_is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.is_manager ? 'Manager' : 'Employee'}
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
                                                                    <DropdownMenuItem>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        {employee.employee_is_active ? (
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
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        No employees found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Updated Pagination Component */}
                                {filteredEmployees.length > 0 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredEmployees.length}
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
        </div>
    );
};

export default EmployeeManagementPage;