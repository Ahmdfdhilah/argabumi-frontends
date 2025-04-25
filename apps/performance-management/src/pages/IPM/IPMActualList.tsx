import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Filtering from '@/components/Filtering';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import Breadcrumb from '@/components/Breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { BarChart2Icon, UserIcon, SearchIcon } from 'lucide-react';
import { Submission, submissionService } from '@/services/submissionService';
import { Period, periodService } from '@/services/periodService';
import { Employee, employeeService } from '@/services/employeeService';
import organizationUnitService, { OrganizationUnitResponse, OrganizationUnitTreeNode } from '@/services/organizationUnitService';
import { useAppSelector } from '@/redux/hooks';

const IPMActualList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state: any) => state.auth);

    const currentRole = user?.roles?.[0]?.role_code ?? '';
    const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;
    const userOrgUnitName = user?.org_unit_name || '';
    const currentUserId = user?.employee_id ?? null;

    // State Management
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Data states
    const [ipmActuals, setIpmActuals] = useState<Submission[]>([]);
    const [departments, setDepartments] = useState<OrganizationUnitResponse[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [accessibleOrgUnits, setAccessibleOrgUnits] = useState<number[]>([]);
    const [_, setPeriods] = useState<Period | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filtering States
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Helper function to collect all child org unit IDs from the hierarchy
    const collectChildOrgUnitIds = (node: OrganizationUnitTreeNode): number[] => {
        let ids = [node.org_unit_id];
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                ids = [...ids, ...collectChildOrgUnitIds(child)];
            });
        }
        return ids;
    };

    // Find a specific node in the org unit tree
    const findOrgUnitInTree = (
        tree: OrganizationUnitTreeNode[],
        orgUnitId: number
    ): OrganizationUnitTreeNode | null => {
        for (const node of tree) {
            if (node.org_unit_id === orgUnitId) {
                return node;
            }
            if (node.children && node.children.length > 0) {
                const found = findOrgUnitInTree(node.children, orgUnitId);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    // Fetch the organization hierarchy and determine accessible org units
    useEffect(() => {
        const fetchOrgHierarchy = async () => {
            try {
                // Only fetch hierarchy if not admin and user has an org unit
                if (currentRole !== 'admin' && currentUserOrgUnitId) {
                    const hierarchyResponse = await organizationUnitService.getOrganizationHierarchy();

                    // Find the user's org unit in the hierarchy
                    const userOrgUnit = findOrgUnitInTree(hierarchyResponse.tree, currentUserOrgUnitId);

                    if (userOrgUnit) {
                        // Collect user's org unit ID and all child org unit IDs
                        const accessibleIds = collectChildOrgUnitIds(userOrgUnit);
                        setAccessibleOrgUnits(accessibleIds);
                    } else {
                        // If user's org unit not found in hierarchy, just use their own
                        setAccessibleOrgUnits([currentUserOrgUnitId]);
                    }
                }
            } catch (error) {
                console.error('Error fetching organization hierarchy:', error);
                // If error, default to just the user's org unit
                if (currentUserOrgUnitId) {
                    setAccessibleOrgUnits([currentUserOrgUnitId]);
                }
            }
        };

        fetchOrgHierarchy();
    }, [currentRole, currentUserOrgUnitId]);

    // Fetch periods
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const activePeriod = await periodService.getActivePeriod();
                setPeriods(activePeriod);

                if (activePeriod) {
                    setSelectedPeriod(activePeriod.period_id.toString());
                }
            } catch (error) {
                console.error('Error fetching periods:', error);
            }
        };
        fetchPeriods();
    }, []);

    // Fetch departments based on accessibility
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                if (currentRole === 'admin') {
                    // Admin can see all departments
                    const departmentsData = await organizationUnitService.getOrganizationUnits(0, 100);
                    setDepartments(departmentsData);
                } else if (accessibleOrgUnits.length > 0) {
                    // For non-admin, fetch all departments but will filter them in the UI
                    const departmentsData = await organizationUnitService.getOrganizationUnits(0, 100);
                    // Filter to only show departments that the user has access to
                    const filteredDepartments = departmentsData.filter(dept =>
                        accessibleOrgUnits.includes(dept.org_unit_id)
                    );
                    setDepartments(filteredDepartments);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchDepartments();
    }, [currentRole, accessibleOrgUnits]);

    // Fetch employees when department changes
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                if (selectedDepartment !== 'all') {
                    const employeesData = await employeeService.getEmployeesByOrganizationUnit(
                        parseInt(selectedDepartment),
                        0,
                        100
                    );
                    setEmployees(employeesData);
                } else if (currentRole !== 'admin' && currentUserOrgUnitId) {
                    // Fetch employees for the user's department if no specific department is selected
                    const employeesData = await employeeService.getEmployeesByOrganizationUnit(
                        currentUserOrgUnitId,
                        0,
                        100
                    );
                    setEmployees(employeesData);
                } else if (currentRole === 'admin') {
                    // Admin can see all employees, but we limit to a reasonable number
                    const employeesData = await employeeService.getEmployees(0, 100);
                    setEmployees(employeesData);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, [selectedDepartment, currentRole, currentUserOrgUnitId]);

    // Search employees by name
    const handleSearchEmployees = async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            const searchResults = await employeeService.searchEmployees(searchTerm);
            setEmployees(searchResults);
        } catch (error) {
            console.error('Error searching employees:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Reset employee search
    const handleResetSearch = async () => {
        setSearchTerm('');
        // Refetch employees based on selected department
        if (selectedDepartment !== 'all') {
            const employeesData = await employeeService.getEmployeesByOrganizationUnit(
                parseInt(selectedDepartment),
                0,
                100
            );
            setEmployees(employeesData);
        } else if (currentRole !== 'admin' && currentUserOrgUnitId) {
            const employeesData = await employeeService.getEmployeesByOrganizationUnit(
                currentUserOrgUnitId,
                0,
                100
            );
            setEmployees(employeesData);
        } else {
            const employeesData = await employeeService.getEmployees(0, 100);
            setEmployees(employeesData);
        }
    };

    // Fetch IPM actuals
    useEffect(() => {
        const fetchIPMActuals = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Calculate pagination parameters
                const skip = (currentPage - 1) * itemsPerPage;

                // Prepare filter parameters
                const params: any = {
                    skip,
                    limit: itemsPerPage,
                    submission_type: 'Actual',
                    status: selectedStatus !== 'all' ? selectedStatus : undefined,
                    period_id: selectedPeriod ? parseInt(selectedPeriod) : undefined,
                    month: selectedMonth !== 'all' ? parseInt(selectedMonth) : undefined
                };

                // IPM specific: Include employee_id filter if selected
                if (selectedEmployee !== 'all') {
                    params.employee_id = parseInt(selectedEmployee);
                } else if (currentRole === 'employee') {
                    // If user is regular employee, they can only see their own IPM
                    params.employee_id = currentUserId;
                }

                // Handle org_unit_id filtering based on role and selected department
                if (currentRole === 'admin') {
                    // Admin can filter by any department
                    if (selectedDepartment !== 'all') {
                        params.org_unit_id = parseInt(selectedDepartment);
                    }
                } else {
                    // Non-admin users can only filter among their accessible departments
                    if (selectedDepartment !== 'all') {
                        // Check if the selected department is in the accessible list
                        if (accessibleOrgUnits.includes(parseInt(selectedDepartment))) {
                            params.org_unit_id = parseInt(selectedDepartment);
                        } else {
                            // If somehow an inaccessible department was selected, reset to all accessible
                            setSelectedDepartment('all');
                        }
                    } else if (accessibleOrgUnits.length > 0 && currentRole !== 'employee') {
                        // If no specific department is selected and user is not a regular employee,
                        // show all accessible departments
                        // Note: API might not support array of org_unit_ids, so we'll filter client-side
                    }
                }

                // Fetch submissions based on filters
                const submissions = await submissionService.getSubmissions(params);
                const filteredEmployees = submissions.filter(submission =>
                    submission.employee_id !== undefined && submission.employee_id !== null
                );

                // Filter submissions based on role and accessibility
                if (currentRole === 'admin' || (currentRole === 'employee' && currentUserId)) {
                    // Admin sees everything based on filters, employee sees only their own
                    console.log(filteredEmployees);
                    setIpmActuals(filteredEmployees);
                } else if (currentRole !== 'employee' && selectedDepartment === 'all' && accessibleOrgUnits.length > 0) {
                    // Managers/supervisors viewing all of their accessible departments
                    const filteredSubmissions = filteredEmployees.filter(submission =>
                        submission.org_unit_id && accessibleOrgUnits.includes(submission.org_unit_id)
                    );
                    console.log(filteredSubmissions);
                    setIpmActuals(filteredSubmissions);
                } else {
                    setIpmActuals(filteredEmployees);
                }

                // For now, let's assume the API doesn't return total count, so we'll just use current page
                setTotalItems(submissions.length > 0 ? (currentPage * itemsPerPage) + 1 : 0);
            } catch (error) {
                console.error('Error fetching IPM actuals:', error);
                setError('Failed to fetch actuals. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchIPMActuals();
    }, [
        currentPage,
        itemsPerPage,
        selectedPeriod,
        selectedStatus,
        selectedDepartment,
        selectedMonth,
        selectedEmployee,
        currentRole,
        currentUserId,
        accessibleOrgUnits
    ]);

    // Mapping submission status to display status
    const mapSubmissionStatus = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'Draft';
            case 'SUBMITTED': return 'Submitted';
            case 'APPROVED': return 'Approved';
            case 'REJECTED': return 'Rejected';
            case 'PENDING': return 'Pending';
            default: return status;
        }
    };

    // Get month name from submission_month (1-12)
    const getMonthName = (monthNum?: number) => {
        if (!monthNum) return 'N/A';

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return months[monthNum - 1] || 'N/A';
    };

    const getStatusColor = (status: string) => {
        const displayStatus = mapSubmissionStatus(status);
        switch (displayStatus) {
            case 'Pending':
                return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
            case 'Submitted':
                return 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
            case 'Draft':
                return 'bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200';
            case 'Approved':
                return 'bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-200';
            case 'Rejected':
                return 'bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200';
            case 'Validated':
                return 'bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    // Navigate to individual IPM Actual details
    const handleRowClick = (actual: Submission) => {
        navigate(`/performance-management/ipm/actual/${actual.submission_id}?month=${actual.submission_month}`);
    };

    return (
        <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900 relative">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />

            <div className="flex flex-col md:flex-row">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        <div className="space-y-6 w-full">
                            <Breadcrumb
                                items={[]}
                                currentPage="IPM Actuals List"
                                showHomeIcon={true}
                                subtitle={`Individual Performance Management Actuals ${currentRole === 'admin' ? 'Company' : userOrgUnitName}`}
                            />

                            {/* Enhanced Filter Section */}
                            <Filtering
                            >
                                {/* Month filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Month</span>
                                    </label>
                                    <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                            <SelectValue placeholder="All Months" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Months</SelectItem>
                                            <SelectItem value="1">January</SelectItem>
                                            <SelectItem value="2">February</SelectItem>
                                            <SelectItem value="3">March</SelectItem>
                                            <SelectItem value="4">April</SelectItem>
                                            <SelectItem value="5">May</SelectItem>
                                            <SelectItem value="6">June</SelectItem>
                                            <SelectItem value="7">July</SelectItem>
                                            <SelectItem value="8">August</SelectItem>
                                            <SelectItem value="9">September</SelectItem>
                                            <SelectItem value="10">October</SelectItem>
                                            <SelectItem value="11">November</SelectItem>
                                            <SelectItem value="12">December</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Status</span>
                                    </label>
                                    <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                            <SelectItem value="REJECTED">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Department filter */}
                                {(currentRole === 'admin' || (currentRole !== 'employee' && accessibleOrgUnits.length > 1)) && (
                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                            <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                            <span>Department</span>
                                        </label>
                                        <Select onValueChange={(value) => {
                                            setSelectedDepartment(value);
                                            setSelectedEmployee('all'); // Reset employee selection when department changes
                                        }} value={selectedDepartment}>
                                            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                                <SelectValue placeholder="All Departments" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Departments</SelectItem>
                                                {departments.map(dept => (
                                                    <SelectItem key={dept.org_unit_id} value={dept.org_unit_id.toString()}>
                                                        {dept.org_unit_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Employee filter - Only show if user is not a regular employee */}
                                {currentRole !== 'employee' && (
                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                            <UserIcon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                            <span>Employee</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="flex-grow">
                                                <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                                                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                                        <SelectValue placeholder="All Employees" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Employees</SelectItem>
                                                        {employees.map(employee => (
                                                            <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                                                                {employee.employee_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                placeholder="Search employee by name"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="flex-grow"
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleSearchEmployees}
                                                disabled={isSearching}
                                            >
                                                <SearchIcon className="h-4 w-4" />
                                            </Button>
                                            {searchTerm && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleResetSearch}
                                                >
                                                    Reset
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Filtering>

                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md pb-4">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                            IPM Actuals Table
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className='m-0 p-0 overflow-x-auto pb-4'>
                                    {isLoading ? (
                                        <div className="p-8 text-center text-gray-500">Loading actuals...</div>
                                    ) : error ? (
                                        <div className="p-8 text-center text-red-500">{error}</div>
                                    ) : (
                                        <table className="w-full border-collapse min-w-[800px]">
                                            <thead className="bg-[#1B6131] text-white">
                                                <tr>
                                                    {['Month', 'Period', 'Employee', 'Department', 'Submitted At', 'Status', 'Actions'].map(header => (
                                                        <th key={header} className="p-4 text-left">{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ipmActuals.length > 0 ? (
                                                    ipmActuals.map(actual => (
                                                        <tr
                                                            key={actual.submission_id}
                                                            className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                                                            onClick={() => handleRowClick(actual)}
                                                        >
                                                            <td className="p-4">{getMonthName(actual.submission_month)}</td>
                                                            <td className="p-4">{actual.period_name}</td>
                                                            <td className="p-4">{actual.employee_name || 'N/A'}</td>
                                                            <td className="p-4">{actual.org_unit_name}</td>
                                                            <td className="p-4">
                                                                {new Date(actual.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(actual.submission_status)}`}>
                                                                    {mapSubmissionStatus(actual.submission_status)}
                                                                </span>
                                                            </td>
                                                            <td
                                                                className="p-4 space-x-2 whitespace-nowrap"
                                                                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking action buttons
                                                            >

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleRowClick(actual)}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="p-4 text-center text-gray-500">
                                                            No actuals found matching your criteria
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={Math.ceil(totalItems / itemsPerPage)}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={totalItems}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={(value) => {
                                            setItemsPerPage(Number(value));
                                            setCurrentPage(1);
                                        }}
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

export default IPMActualList;