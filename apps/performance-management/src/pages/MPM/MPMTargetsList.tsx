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
import { BarChart2Icon } from 'lucide-react';
import Footer from '@/components/Footer';
import { Submission, submissionService } from '@/services/submissionService';
import { Period, periodService } from '@/services/periodService';
import organizationUnitService, { OrganizationUnitResponse, OrganizationUnitTreeNode } from '@/services/organizationUnitService';
import { useAppSelector } from '@/redux/hooks';

const MPMTargetList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const currentRole = user?.roles?.[0]?.role_code ?? '';
  const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;

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
  const [mpmTargets, setMpmTargets] = useState<Submission[]>([]);
  const [departments, setDepartments] = useState<OrganizationUnitResponse[]>([]);
  const [accessibleOrgUnits, setAccessibleOrgUnits] = useState<number[]>([]);
  const [_, setPeriods] = useState<Period | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtering States
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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

  // Fetch MPM targets
  useEffect(() => {
    const fetchMPMTargets = async () => {
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
            // Note: API might not support array of org_unit_ids, so we might need multiple requests
            // For now, we'll use a different approach - fetch all and filter client-side
            // This is a limitation of the current API design
          }
        }

        // Fetch submissions based on filters
        const submissions = await submissionService.getSubmissions(params);

        const filteredUnitSubmissions = submissions.filter(submission => submission.org_unit_id !== null
        );

        // If non-admin user viewing all of their accessible departments
        if (currentRole !== 'admin' && selectedDepartment === 'all' && accessibleOrgUnits.length > 0) {
          // Filter submissions client-side to include only those from accessible org units
          const filteredSubmissions = filteredUnitSubmissions.filter(submission =>
            submission.org_unit_id && accessibleOrgUnits.includes(submission.org_unit_id)
          );
          setMpmTargets(filteredSubmissions);
        } else {
          setMpmTargets(filteredUnitSubmissions);
        }

        // For now, let's assume the API doesn't return total count, so we'll just use current page
        // In a real implementation, you'd get the total count from the API response
        setTotalItems(submissions.length > 0 ? (currentPage * itemsPerPage) + 1 : 0);
      } catch (error) {
        console.error('Error fetching MPM targets:', error);
        setError('Failed to fetch targets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMPMTargets();
  }, [
    currentPage,
    itemsPerPage,
    selectedPeriod,
    selectedStatus,
    selectedDepartment,
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

  // Filtering and Pagination Logic
  const filteredMpmTargets = useMemo(() => {
    return isLoading ? [] : mpmTargets;
  }, [mpmTargets, isLoading]);

  const paginatedMpmTargets = useMemo(() => {
    return filteredMpmTargets;
  }, [filteredMpmTargets]);

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

  // Navigate to individual MPM Target details
  const handleRowClick = (target: Submission) => {
    navigate(`/performance-management/mpm/target/${target.submission_id}`);
  };

  // Get user org unit name for display in breadcrumb
  const userOrgUnitName = user?.org_unit_name || '';

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
                currentPage="MPM Targets List"
                showHomeIcon={true}
                subtitle={`Target MPM ${currentRole === 'admin' ? 'Company' : userOrgUnitName}`}
              />

              <Filtering
              >
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

                {/* Department filter - show for both admin and non-admin, but with different options */}
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
              </Filtering>

              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md pb-4">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      MPM Targets Table
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
                          {['Period', 'Department', 'Submitted By', 'Submitted At', 'Status', 'Actions'].map(header => (
                            <th key={header} className="p-4 text-left">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedMpmTargets.length > 0 ? (
                          paginatedMpmTargets.map(target => (
                            <tr
                              key={target.submission_id}
                              className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                              onClick={() => handleRowClick(target)}
                            >
                              <td className="p-4">{target.period_name}</td>
                              <td className="p-4">{target.org_unit_name}</td>
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

export default MPMTargetList;