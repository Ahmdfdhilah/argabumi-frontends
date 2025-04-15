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
    Users,
    Edit,
    Plus,
    Search,
    Trash2,
    Building2,
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
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';

// Dummy data types based on your database schema
type Team = {
    team_id: number;
    team_name: string;
    team_department_id: number;
    team_description: string;
    team_created_at: string;
    team_updated_at: string;
    department_name?: string;
    member_count?: number;
};

type Department = {
    department_id: number;
    department_name: string;
};

const TeamManagementPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');
    const [teams, setTeams] = useState<Team[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedDepartment, setSelectedDepartment] = useState('all');

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
            {
                team_id: 1,
                team_name: 'Frontend Development',
                team_department_id: 1,
                team_description: 'Responsible for user interface development',
                team_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
                team_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
                member_count: 8
            },
            {
                team_id: 2,
                team_name: 'Backend Development',
                team_department_id: 1,
                team_description: 'Handles server-side logic and database operations',
                team_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString(),
                team_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
                member_count: 6
            },
            {
                team_id: 3,
                team_name: 'Recruitment',
                team_department_id: 2,
                team_description: 'Responsible for hiring new talent',
                team_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
                team_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
                member_count: 4
            },
            {
                team_id: 4,
                team_name: 'Payroll',
                team_department_id: 3,
                team_description: 'Manages employee compensation and benefits',
                team_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(),
                team_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
                member_count: 3
            },
            {
                team_id: 5,
                team_name: 'Digital Marketing',
                team_department_id: 4,
                team_description: 'Handles online marketing campaigns',
                team_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
                team_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                member_count: 5
            },
            {
                team_id: 6,
                team_name: 'DevOps',
                team_department_id: 1,
                team_description: 'Manages deployment and infrastructure',
                team_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
                team_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                member_count: 4
            },
            {
                team_id: 7,
                team_name: 'Customer Support',
                team_department_id: 5,
                team_description: 'Provides assistance to customers',
                team_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
                team_updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
                member_count: 7
            },
        ];

        // Add department names to teams
        const teamsWithDetails = dummyTeams.map(team => ({
            ...team,
            department_name: dummyDepartments.find(d => d.department_id === team.team_department_id)?.department_name
        }));

        setDepartments(dummyDepartments);
        setTeams(teamsWithDetails);
        setFilteredTeams(teamsWithDetails);
    }, []);

    // Apply filters and search
    useEffect(() => {
        let result = [...teams];

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(team =>
                team.team_name.toLowerCase().includes(term) ||
                team.department_name?.toLowerCase().includes(term) ||
                team.team_description.toLowerCase().includes(term)
            );
        }

        // Apply department filter
        if (selectedDepartment !== 'all') {
            result = result.filter(team =>
                team.team_department_id === parseInt(selectedDepartment)
            );
        }
        setFilteredTeams(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, selectedDepartment, teams]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTeams.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
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
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <Breadcrumb
                            items={[]}
                            currentPage="Team Management"
                            showHomeIcon={true}
                        />

                        {/* Search and Filter Section */}
                        <div className="mb-6">
                            <Filtering
                            >
                                <div className="space-y-3 md:col-span-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search</span>
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by team name, department, or description..."
                                            className="pl-9 bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {/* Custom filter options for department */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Users className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Department</span>
                                    </label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => handleDepartmentChange(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept.department_id} value={String(dept.department_id)}>
                                                {dept.department_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </Filtering>
                        </div>

                        {/* Team Table */}
                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="text-gray-700 dark:text-gray-200  flex p-0">
                                        Team List
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button

                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Team
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 pb-8">
                                <div className="rounded-md border border-gray-200 dark:border-gray-700">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Team Name</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Members</TableHead>
                                                <TableHead>Created At</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems.length > 0 ? (
                                                currentItems.map((team) => (
                                                    <TableRow key={team.team_id}>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Users className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{team.team_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Building2 className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                <span>{team.department_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate">{team.team_description}</TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center">
                                                                {team.member_count} members
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(team.team_created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex space-x-2">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-[#1B6131] dark:text-[#46B749]"
                                                                        >
                                                                            <Edit className="h-4 w-4 mr-1" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem>
                                                                            <Users className="h-4 w-4 mr-2" />
                                                                            View Members
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit Team
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600">
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete Team
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        No teams found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Updated Pagination Component */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    itemsPerPage={itemsPerPage}
                                    totalItems={filteredTeams.length}
                                    onPageChange={setCurrentPage}
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

export default TeamManagementPage;