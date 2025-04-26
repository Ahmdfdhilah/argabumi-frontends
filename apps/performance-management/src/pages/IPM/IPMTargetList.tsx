import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Filtering from '@/components/Filtering';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import Breadcrumb from '@/components/Breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { BarChart2Icon, UserIcon } from 'lucide-react';
import Footer from '@/components/Footer';
import { Submission, submissionService } from '@/services/submissionService';
import { Period, periodService } from '@/services/periodService';
import { Employee, employeeService } from '@/services/employeeService';
import { useAppSelector } from '@/redux/hooks';

const IPMTargetList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;
  const currentEmpId = user?.employee_data?.employee_id ?? null;

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
  const [ipmTargets, setIpmTargets] = useState<Submission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [accessibleEmployees, setAccessibleEmployees] = useState<number[]>([]);
  const [_, setPeriods] = useState<Period | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtering States
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Helper function to recursively fetch all subordinates
  const fetchAllSubordinatesRecursively = async (empId: number): Promise<Employee[]> => {
    try {
      const response = await employeeService.getEmployeeWithSubordinates(empId);
      let allSubordinates: Employee[] = response.subordinates || [];

      // For each direct subordinate, get their subordinates recursively
      for (const subordinate of response.subordinates || []) {
        if (subordinate.employee_id !== empId) { 
          console.log("masuk ke subordinate", subordinate.employee_id);
          // Prevent infinite loops
          const subSubordinates = await fetchAllSubordinatesRecursively(subordinate.employee_id);
          allSubordinates = [...allSubordinates, ...subSubordinates];
        }
      }

      // Remove duplicates (in case of organizational structure quirks)
      return Array.from(new Map(allSubordinates.map(sub =>
        [sub.employee_id, sub])).values());
    } catch (error) {
      console.error(`Error fetching subordinates for employee ${empId}:`, error);
      return [];
    }
  };

  // Check if user should have access to employee filtering
  const shouldShowEmployeeFilter = useMemo(() => {
    // Check if any of the user's roles allow access to employee filtering
    return user.roles.some((role: any) =>
      ['admin', 'division_head', 'director', 'department_head'].includes(role.role_code)
    );
  }, [user?.roles]);

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
        setError('Failed to load active period. Please try again later.');
      }
    };
    fetchPeriods();
  }, []);

  // Fetch accessible employees based on role
  useEffect(() => {
    const fetchAccessibleEmployees = async () => {
      try {
        setIsLoading(true);
        let employeesList: Employee[] = [];
        let accessibleIds: number[] = [];

        // Only fetch employees if the user should have access to the employee filter
        if (shouldShowEmployeeFilter) {
          console.log("masuk ke shouldShowEmployeeFilter", shouldShowEmployeeFilter);

          if (user?.roles.some((role: any) => role.role_code === 'admin')) {
            // Admin can see all employees
            employeesList = await employeeService.getEmployees(0, 100);
            accessibleIds = employeesList.map(emp => emp.employee_id);
          }

          else if (currentEmpId && (user?.roles.some((role: any) => role.role_code === 'director') || user?.roles.some((role: any) => role.role_code === 'department_head') || user?.roles.some((role: any) => role.role_code === 'division_head'))) {
            // Get all subordinates recursively for supervisors
            console.log("masuk ke recursive", currentEmpId);

            employeesList = await fetchAllSubordinatesRecursively(currentEmpId);

            // Add the supervisor themselves
            const currentEmployee = {
              employee_id: currentEmpId,
              employee_number: user?.employee_number || '',
              employee_name: user?.employee_name || '',
              is_active: true
            };

            employeesList.push(currentEmployee);
            accessibleIds = employeesList.map(emp => emp.employee_id);
          }
        } else if (currentEmpId) {
          // Regular employees can only see themselves - no need to fetch others
          const currentEmployee = {
            employee_id: currentEmpId,
            employee_number: user?.employee_number || '',
            employee_name: user?.employee_name || '',
            is_active: true
          };
          employeesList = [currentEmployee];
          accessibleIds = [currentEmpId];
        }

        console.log("currentUserId", currentEmpId);


        setEmployees(employeesList);
        setAccessibleEmployees(accessibleIds);

        // Default to current user if not admin/manager
        if (user?.roles.some((role: any) => role.role_code !== 'admin' && role.role_code !== 'director' && role.role_code !== 'department_head' && role.role_code !== 'division_head') && currentEmpId) {
          setSelectedEmployee(currentEmpId.toString());
        }
      } catch (error) {
        console.error('Error fetching accessible employees:', error);
        setError('Failed to load employee data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessibleEmployees();
  }, [currentUserOrgUnitId, currentEmpId, shouldShowEmployeeFilter, user]);

  // Fetch IPM targets
  useEffect(() => {
    const fetchIPMTargets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate pagination parameters
        const skip = (currentPage - 1) * itemsPerPage;

        // Prepare filter parameters
        const params: any = {
          skip,
          limit: itemsPerPage,
          submission_type: 'Target',
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          period_id: selectedPeriod ? parseInt(selectedPeriod) : undefined
        };

        // Handle employee filtering based on role
        if (shouldShowEmployeeFilter && selectedEmployee !== 'all') {
          // If specific employee is selected
          params.employee_id = parseInt(selectedEmployee);
        } else if (!shouldShowEmployeeFilter && currentEmpId) {
          // If regular employee, only show their own targets
          params.employee_id = currentEmpId;
        } else if (shouldShowEmployeeFilter && selectedEmployee === 'all' && accessibleEmployees.length > 0) {
          // For supervisors/managers viewing all accessible employees
          // We can potentially optimize this by adding a new API endpoint that accepts multiple employee IDs
          // For now, we'll handle filtering client-side
        }

        // Fetch submissions based on filters
        const submissions = await submissionService.getSubmissions(params);

        // Filter to only include submissions for accessible employees
        let filteredSubmissions = submissions.filter(submission =>
          submission.employee_id !== undefined && submission.employee_id !== null
        );

        // If accessing all employees but only certain ones are accessible
        if (shouldShowEmployeeFilter && selectedEmployee === 'all' && accessibleEmployees.length > 0) {
          filteredSubmissions = filteredSubmissions.filter(submission =>
            submission.employee_id && accessibleEmployees.includes(submission.employee_id)
          );
        }

        setIpmTargets(filteredSubmissions);

        // For now, approximate total count for pagination
        setTotalItems(filteredSubmissions.length > 0 ? Math.max(filteredSubmissions.length, currentPage * itemsPerPage) : 0);
      } catch (error) {
        console.error('Error fetching IPM targets:', error);
        setError('Failed to fetch targets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have necessary data
    if (selectedPeriod) {
      fetchIPMTargets();
    }
  }, [
    currentPage,
    itemsPerPage,
    selectedPeriod,
    selectedStatus,
    selectedEmployee,
    currentEmpId,
    accessibleEmployees,
    shouldShowEmployeeFilter
  ]);

  // Mapping submission status to display status
  const mapSubmissionStatus = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'SUBMITTED': return 'Submitted';
      case 'APPROVED': return 'Approved by Supervisor';
      case 'REJECTED': return 'Rejected by Supervisor';
      case 'PENDING': return 'Pending';
      default: return status;
    }
  };

  // Filtering and Pagination Logic
  const filteredIpmTargets = useMemo(() => {
    return isLoading ? [] : ipmTargets;
  }, [ipmTargets, isLoading]);

  const paginatedIpmTargets = useMemo(() => {
    return filteredIpmTargets;
  }, [filteredIpmTargets]);

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

  // Navigate to individual IPM Target details
  const handleRowClick = (target: Submission) => {
    navigate(`/performance-management/ipm/target/${target.submission_id}`);
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
                currentPage="IPM Targets List"
                showHomeIcon={true}
                subtitle="Individual Performance Management Targets"
              />

              <Filtering>
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
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee filter - only show for admin, manager, supervisor roles */}
                {shouldShowEmployeeFilter && (
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <UserIcon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                      <span>Employee</span>
                    </label>
                    <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                      <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                        <SelectValue placeholder="All Accessible Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Accessible Employees</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                            {emp.employee_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </Filtering>

              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md pb-4">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      IPM Targets Table
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='m-0 p-0 overflow-x-auto'>
                  {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading targets...</div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-500">{error}</div>
                  ) : (
                    <table className="w-full border-collapse min-w-[800px]">
                      <thead className="bg-[#1B6131] text-white">
                        <tr>
                          {['Period', 'Employee', 'Submitted By', 'Submitted At', 'Status', 'Actions'].map(header => (
                            <th key={header} className="p-4 text-left">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedIpmTargets.length > 0 ? (
                          paginatedIpmTargets.map(target => (
                            <tr
                              key={target.submission_id}
                              className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                              onClick={() => handleRowClick(target)}
                            >
                              <td className="p-4">{target.period_name}</td>
                              <td className="p-4">{target.employee_name}</td>
                              <td className="p-4">{target.updated_by || target.created_by}</td>
                              <td className="p-4">
                                {new Date(target.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(target.submission_status)}`}>
                                  {mapSubmissionStatus(target.submission_status)}
                                </span>
                              </td>
                              <td
                                className="p-4 space-x-2 whitespace-nowrap"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRowClick(target)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-gray-500">
                              No targets found matching your criteria
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

export default IPMTargetList;