import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Filtering from '@/components/Filtering';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import Breadcrumb from '@/components/Breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { BarChart2Icon } from 'lucide-react';
import { Submission, submissionService } from '@/services/submissionService';
import { Period, periodService } from '@/services/periodService';
import organizationUnitService, { OrganizationUnitResponse, OrganizationUnitTreeNode } from '@/services/organizationUnitService';
import { useAppSelector } from '@/redux/hooks';

const MPMActualList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const currentRole = user?.roles?.[0]?.role_code ?? '';
  const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;
  const userOrgUnitName = user?.org_unit_name || '';

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
  const [mpmActuals, setMpmActuals] = useState<Submission[]>([]);
  const [departments, setDepartments] = useState<OrganizationUnitResponse[]>([]);
  const [accessibleOrgUnits, setAccessibleOrgUnits] = useState<number[]>([]);
  const [_, setPeriods] = useState<Period | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtering States
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

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

  // Fetch MPM actuals
  useEffect(() => {
    const fetchMPMActuals = async () => {
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
          } else if (accessibleOrgUnits.length > 0) {
            // If no specific department is selected, show all accessible departments
            // Note: API might not support array of org_unit_ids, so we'll filter client-side
          }
        }

        // Fetch submissions based on filters
        const submissions = await submissionService.getSubmissions(params);

        // If non-admin user viewing all of their accessible departments
        if (currentRole !== 'admin' && selectedDepartment === 'all' && accessibleOrgUnits.length > 0) {
          // Filter submissions client-side to include only those from accessible org units
          const filteredSubmissions = submissions.filter(submission =>
            submission.org_unit_id && accessibleOrgUnits.includes(submission.org_unit_id)
          );
          setMpmActuals(filteredSubmissions);
        } else {
          setMpmActuals(submissions);
        }

        // For now, let's assume the API doesn't return total count, so we'll just use current page
        setTotalItems(submissions.length > 0 ? (currentPage * itemsPerPage) + 1 : 0);
      } catch (error) {
        console.error('Error fetching MPM actuals:', error);
        setError('Failed to fetch actuals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMPMActuals();
  }, [
    currentPage,
    itemsPerPage,
    selectedPeriod,
    selectedStatus,
    selectedDepartment,
    selectedMonth,
    currentRole,
    accessibleOrgUnits
  ]);


  // Mapping submission status to display status
  const mapSubmissionStatus = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'SUBMITTED': return 'Submitted';
      case 'APPROVED': return 'Approved by Senior Manager';
      case 'REJECTED': return 'Rejected by Senior Manager';
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
      case 'Approved by Senior Manager':
        return 'bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-200';
      case 'Rejected by Senior Manager':
        return 'bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Navigate to individual MPM Actual details
  const handleRowClick = (actual: Submission) => {
    navigate(`/performance-management/mpm/actual/${actual.submission_id}?month=${actual.submission_month}`);
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
                currentPage="MPM Actuals List"
                showHomeIcon={true}
                subtitle={`Actual MPM Value ${currentRole === 'admin' ? 'Company' : userOrgUnitName}`}
              />

              {/* Enhanced Filter Section */}
              <Filtering
                handlePeriodChange={(value) => setSelectedPeriod(value)}
                selectedPeriod={selectedPeriod}
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
                {(currentRole === 'admin' || accessibleOrgUnits.length > 1) && (
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                      <span>Department</span>
                    </label>
                    <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
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
              </Filtering>

              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md pb-4">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      MPM Actuals Table
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
                          {['Month', 'Period', 'Department', 'Submitted By', 'Submitted At', 'Status', 'Actions'].map(header => (
                            <th key={header} className="p-4 text-left">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mpmActuals.length > 0 ? (
                          mpmActuals.map(actual => (
                            <tr
                              key={actual.submission_id}
                              className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                              onClick={() => handleRowClick(actual)}
                            >
                              <td className="p-4">{getMonthName(actual.submission_month)}</td>
                              <td className="p-4">{actual.period_name}</td>
                              <td className="p-4">{actual.org_unit_name}</td>
                              <td className="p-4">{actual.updated_by || actual.created_by}</td>
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

export default MPMActualList;