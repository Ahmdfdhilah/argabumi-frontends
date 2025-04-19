import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Filtering from '@/components/Filtering';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@workspace/ui/components/dialog';
import { DialogFooter, DialogHeader } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import Breadcrumb from '@/components/Breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { BarChart2Icon } from 'lucide-react';
import Footer from '@/components/Footer';
import { Submission, submissionService } from '@/services/submissionService';
import { Period, periodService } from '@/services/periodService';
import organizationUnitService, { OrganizationUnitResponse } from '@/services/organizationUnitService';
import { useAppSelector } from '@/redux/hooks';

const MPMTargetList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const currentRole = user?.roles?.[0]?.role_type ?? '';
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
  const [_, setPeriods] = useState<Period[]>([]);
  const [selectedMpmTarget, setSelectedMpmTarget] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtering States
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  // Fetch periods
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const periodsData = await periodService.getPeriods(0, 100);
        setPeriods(periodsData);
        
        // Set default period to the latest active one if available
        const activePeriod = periodsData.find(p => p.period_status === 'ACTIVE');
        if (activePeriod) {
          setSelectedPeriod(activePeriod.period_id.toString());
        } else if (periodsData.length > 0) {
          setSelectedPeriod(periodsData[0].period_id.toString());
        }
      } catch (error) {
        console.error('Error fetching periods:', error);
      }
    };
    fetchPeriods();
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await organizationUnitService.getOrganizationUnits(0, 100);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch MPM targets
  useEffect(() => {
    const fetchMPMTargets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate pagination parameters
        const skip = (currentPage - 1) * itemsPerPage;
        
        // Prepare filter parameters
        const params = {
          skip,
          limit: itemsPerPage,
          submission_type: 'Target',
          status: selectedStatus || undefined,
          period_id: selectedPeriod ? parseInt(selectedPeriod) : undefined,
          org_unit_id: selectedDepartment ? parseInt(selectedDepartment) : undefined,
        };
        
        // Filter by user's department if they're a manager or senior manager
        if ((currentRole === 'manager_dept' || currentRole === 'sm_dept') && currentUserOrgUnitId) {
          params.org_unit_id = currentUserOrgUnitId;
        }
        
        const submissions = await submissionService.getSubmissions(params);
        setMpmTargets(submissions);
        
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
  }, [currentPage, itemsPerPage, selectedPeriod, selectedStatus, selectedDepartment, currentRole, currentUserOrgUnitId]);

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

  // Handlers
  const handleSubmitMpmTarget = async () => {
    if (selectedMpmTarget) {
      try {
        await submissionService.updateSubmissionStatus(
          selectedMpmTarget.submission_id, 
          { 
            submission_status: 'SUBMITTED',
            submission_comments: 'Submitted for review' 
          }
        );
        
        // Update the local state
        const updatedTargets = mpmTargets.map(target =>
          target.submission_id === selectedMpmTarget.submission_id
            ? { ...target, submission_status: 'SUBMITTED' }
            : target
        );
        setMpmTargets(updatedTargets);
        setIsSubmitModalOpen(false);
      } catch (error) {
        console.error('Error submitting target:', error);
      }
    }
  };

  const handleReviewMpmTarget = async (action: string) => {
    if (selectedMpmTarget) {
      try {
        const status = action === 'Approved by Senior Manager' ? 'APPROVED' : 'REJECTED';
        
        await submissionService.updateSubmissionStatus(
          selectedMpmTarget.submission_id, 
          { 
            submission_status: status,
            submission_comments: reviewComment 
          }
        );
        
        // Update the local state
        const updatedTargets = mpmTargets.map(target =>
          target.submission_id === selectedMpmTarget.submission_id
            ? { ...target, submission_status: status }
            : target
        );
        setMpmTargets(updatedTargets);
        setIsReviewModalOpen(false);
        setReviewComment('');
      } catch (error) {
        console.error('Error reviewing target:', error);
      }
    }
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

  // Navigate to individual MPM Target details
  const handleRowClick = (target: Submission) => {
    navigate(`/performance-management/mpm/target/${target.submission_id}`);
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

        <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
          <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
            <div className="space-y-6 w-full">
              <Breadcrumb
                items={[]}
                currentPage="MPM Targets List"
                showHomeIcon={true}
                subtitle={`Target MPM Value ${currentRole === 'admin' ? 'Company' : user?.org_unit_name || ''}`}
              />

              <Filtering
                handlePeriodChange={(value) => setSelectedPeriod(value)}
                selectedPeriod={selectedPeriod}
                // periods={periods}
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
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department filter for admin only */}
                {currentRole === 'admin' && (
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
                        <SelectItem value="">All Departments</SelectItem>
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
                              <td className="p-4">{target.employee_name || 'System'}</td>
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
                                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking action buttons
                              >
                                {currentRole === 'manager_dept' && target.submission_status === 'DRAFT' && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMpmTarget(target);
                                      setIsSubmitModalOpen(true);
                                    }}
                                  >
                                    Submit
                                  </Button>
                                )}
                                {currentRole === 'sm_dept' && target.submission_status === 'SUBMITTED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMpmTarget(target);
                                      setIsReviewModalOpen(true);
                                    }}
                                  >
                                    Review
                                  </Button>
                                )}
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

      {/* Submit Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="max-w-md w-[95%] lg:max-w-lg rounded-lg overflow-y-scroll max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Submit MPM Target</DialogTitle>
            <DialogDescription>
              Submit your yearly performance management targets for review
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='space-y-4'>
            <div className="flex flex-col lg:flex-row gap-4">
              <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitMpmTarget}>
                Confirm Submission
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md w-[95%] lg:max-w-lg rounded-lg overflow-y-scroll max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Review MPM Target</DialogTitle>
            <DialogDescription>
              Review and take action on the submitted performance management targets
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="review-comments">Review Comments</Label>
              <Input
                id="review-comments"
                placeholder="Enter your review comments"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className='space-y-4'>
            <div className="flex flex-col lg:flex-row gap-4">
              <Button
                variant="destructive"
                onClick={() => handleReviewMpmTarget('Rejected by Senior Manager')}
              >
                Reject
              </Button>
              <Button onClick={() => handleReviewMpmTarget('Approved by Senior Manager')}>
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MPMTargetList;