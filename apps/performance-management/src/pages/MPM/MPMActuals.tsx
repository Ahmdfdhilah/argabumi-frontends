
import { useState, useMemo, useEffect } from 'react';
import {  useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

import { Button } from '@workspace/ui/components/button';
import Sidebar from '@/components/Sidebar';
import { Edit, Send, Users, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import React from 'react';
import Footer from '@/components/Footer';
import { useToast } from '@workspace/ui/components/sonner';
import { kpiPerspectiveService, KPIPerspective } from '@/services/kpiPerspectiveService';

import { submissionService, SubmissionStatusUpdate } from '@/services/submissionService';
import { approvalService, ApprovalStatusUpdate } from '@/services/approvalService';
import { useAppSelector } from '@/redux/hooks';
import { SubmitDialog } from '@/components/MPM/SubmitDialog';
import { ApproveDialog } from '@/components/MPM/ApproveDialog';
import { RejectDialog } from '@/components/MPM/RejectDialog';
import { getMonthName } from '@/utils/month';
import { useMPMActuals, KPIEntryWithActuals } from '@/hooks/useMPMActuals';
import EditActualDialog from '@/components/MPM/EditActualDialog';

const MPMActuals = () => {
  const { toast } = useToast();
  const { submissionId } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month');

  // Get current user data from Redux store
  const { user } = useAppSelector((state: any) => state.auth);
  const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;
  const currentEmployeeId = user?.employee_data?.employee_id ?? null;

  // Use our custom hook to fetch actuals data
  const { loading, error, entriesWithActuals, submissionStatus, refreshData } = useMPMActuals();

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedActual, setSelectedActual] = useState<KPIEntryWithActuals | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [submissionComments, setSubmissionComments] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('');

  // Authorization states
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isApprover, setIsApprover] = useState<boolean>(false);
  const [approvalId, setApprovalId] = useState<number | null>(null);

  // UI states
  const [perspectives, setPerspectives] = useState<KPIPerspective[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtering states
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('Monthly');

  // Check if user is authorized to submit actuals or is an approver
  useEffect(() => {
    const checkAuthorization = async () => {
      if (submissionId && currentUserOrgUnitId && currentEmployeeId) {
        try {
          // Fetch submission details
          const submissionData = await submissionService.getSubmission(parseInt(submissionId));

          // Check if submission org unit matches user's org unit
          const isUserAuthorized = submissionData.org_unit_id === currentUserOrgUnitId;

          setIsAuthorized(isUserAuthorized);

          // Check if user is an approver for this submission
          const approvalData = await approvalService.getApprovalsBySubmission(parseInt(submissionId));

          // Find if current user is an approver with pending approval
          const userApproval = approvalData.find(
            approval => approval.approver_id === currentEmployeeId &&
              approval.approval_status === 'Pending'
          );

          if (userApproval) {
            setIsApprover(true);
            setApprovalId(userApproval.approval_id);
          } else {
            setIsApprover(false);
          }
        } catch (error) {
          console.error('Error checking authorization:', error);
          setIsAuthorized(false);
          setIsApprover(false);
        }
      }
    };

    checkAuthorization();
  }, [submissionId, currentUserOrgUnitId, currentEmployeeId]);

  // Fetch perspectives on component mount
  useEffect(() => {
    const fetchPerspectives = async () => {
      try {
        const data = await kpiPerspectiveService.getPerspectives();
        setPerspectives(data);
      } catch (error) {
        console.error('Error fetching perspectives:', error);
      }
    };

    fetchPerspectives();
  }, []);

  // Group entries by perspective
  const groupedEntries = useMemo(() => {
    if (!entriesWithActuals || entriesWithActuals.length === 0) return {};

    return entriesWithActuals.reduce((acc, entry) => {
      const perspective = entry.kpiDefinition?.kpi_perspective_id || 'Unknown';
      if (!acc[perspective]) {
        acc[perspective] = [];
      }
      acc[perspective].push(entry);
      return acc;
    }, {} as Record<string, KPIEntryWithActuals[]>);
  }, [entriesWithActuals]);

  // Get perspective name
  const getPerspectiveName = (id: string | number): string => {
    const perspective = perspectives.find(p => p.perspective_id.toString() === id.toString());
    return perspective ? perspective.perspective_name : 'Uncategorized';
  };

  // Filter entries based on selected filters
  const filteredEntries = useMemo(() => {
    const result = { ...groupedEntries };

    if (selectedPerspective && selectedPerspective !== 'all') {
      Object.keys(result).forEach(perspectiveId => {
        if (getPerspectiveName(perspectiveId) !== selectedPerspective) {
          delete result[perspectiveId];
        }
      });
    }

    // Filter by date range
    if (startDate || endDate) {
      Object.keys(result).forEach(perspectiveId => {
        result[perspectiveId] = result[perspectiveId].filter(entry => {
          const entryMonth = entry.actual_month;
          const entryDate = new Date(2024, entryMonth - 1, 1); // Using 2024 as base year for comparison

          if (startDate) {
            const filterStart = new Date(startDate);
            if (entryDate < filterStart) return false;
          }

          if (endDate) {
            const filterEnd = new Date(endDate);
            if (entryDate > filterEnd) return false;
          }

          return true;
        });

        // Remove perspective if all entries filtered out
        if (result[perspectiveId].length === 0) {
          delete result[perspectiveId];
        }
      });
    }

    return result;
  }, [groupedEntries, selectedPerspective, startDate, endDate, perspectives]);

  // Calculate pagination
  const totalItems = useMemo(() => {
    return Object.values(filteredEntries).reduce((sum, entries) => sum + entries.length, 0);
  }, [filteredEntries]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    let currentIdx = 0;
    const result: Record<string, KPIEntryWithActuals[]> = {};

    for (const [perspectiveId, entries] of Object.entries(filteredEntries)) {
      if (currentIdx < endIndex && currentIdx + entries.length > startIndex) {
        const perspectiveStartIdx = Math.max(0, startIndex - currentIdx);
        const perspectiveEndIdx = Math.min(entries.length, endIndex - currentIdx);
        result[perspectiveId] = entries.slice(perspectiveStartIdx, perspectiveEndIdx);
      }

      currentIdx += entries.length;
    }

    return result;
  }, [filteredEntries, currentPage, itemsPerPage]);

  // Submit function - now simplified to just update submission status
  const handleSubmitActuals = async () => {
    if (!submissionId || !isAuthorized) return;

    setIsSubmitting(true);
    try {
      const statusUpdate: SubmissionStatusUpdate = {
        submission_status: 'Submitted',
        submission_comments: submissionComments
      };

      await submissionService.updateSubmissionStatus(Number(submissionId), statusUpdate);

      toast({
        title: "Success",
        description: "Actuals submitted successfully",
      });

      setIsSubmitDialogOpen(false);
      // Refresh data after submission
      refreshData();
    } catch (error) {
      console.error('Error submitting actuals:', error);
      toast({
        title: "Error",
        description: "Failed to submit actuals",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve function
  const handleApprove = async () => {
    if (!approvalId) return;

    setIsProcessingApproval(true);
    try {
      const statusUpdate: ApprovalStatusUpdate = {
        approval_status: 'Approved',
        approval_notes: approvalNotes
      };

      await approvalService.updateApprovalStatus(approvalId, statusUpdate);

      toast({
        title: "Success",
        description: "Actuals approved successfully",
      });

      setIsApproveDialogOpen(false);
      setApprovalNotes('');
      setIsApprover(false);

      // Refresh data after approval
      refreshData();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve actuals",
        variant: "destructive",
      });
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Reject function
  const handleReject = async () => {
    if (!approvalId) return;

    setIsProcessingApproval(true);
    try {
      const statusUpdate: ApprovalStatusUpdate = {
        approval_status: 'Rejected',
        approval_notes: approvalNotes
      };

      await approvalService.updateApprovalStatus(approvalId, statusUpdate);

      toast({
        title: "Success",
        description: "Actuals rejected successfully",
      });

      setIsRejectDialogOpen(false);
      setApprovalNotes('');
      setIsApprover(false);

      // Refresh data after rejection
      refreshData();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject actuals",
        variant: "destructive",
      });
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Handle edit actual
  const handleEditClick = (entry: KPIEntryWithActuals) => {
    setSelectedActual(entry);
    setIsEditDialogOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Filter handlers
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  const handlePerspectiveChange = (value: string) => {
    setSelectedPerspective(value);
  };

  // Check if user can submit actuals
  const canSubmitActuals = isAuthorized && submissionStatus === 'Draft';

  // Check if submission can be approved
  const canApproveOrReject = isApprover && submissionStatus === 'Submitted';


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  const currentMonth = month ? getMonthName(parseInt(month)) : 'Monthly';

  return (
    <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900">
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

        <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full overflow-hidden`}>
          <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
            <div className="space-y-6 w-full">
              <Breadcrumb
                items={[{
                  label: 'MPM Actual List',
                  path: '/performance-management/mpm/actual'
                }]}
                currentPage={`MPM Actual - ${currentMonth}`}
                showHomeIcon={true}
                subtitle={`MPM Actuals Submission ID: ${submissionId} ${submissionStatus ? `(${submissionStatus})` : ''}`}
              />

              {/* Filter Section */}
              <Filtering
                startDate={startDate}
                endDate={endDate}
                handleStartDateChange={handleStartDateChange}
                handleEndDateChange={handleEndDateChange}
                handlePeriodChange={handlePeriodChange}
                selectedPeriod={selectedPeriod}
                handleTypeChange={handleTypeChange}
                selectedType={selectedType}
              >
                {/* Custom filter for perspective */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Users className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                    <span>Perspective</span>
                  </label>
                  <Select
                    onValueChange={handlePerspectiveChange}
                    value={selectedPerspective}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                      <SelectValue placeholder="Select Perspective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Perspectives</SelectItem>
                      {perspectives.map((perspective) => (
                        <SelectItem
                          key={perspective.perspective_id}
                          value={perspective.perspective_name}
                        >
                          {perspective.perspective_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Filtering>

              {/* Main Card */}
              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      KPI Actuals Table
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                      {/* Approval Buttons - Only show if user is an approver and submission is in submitted status */}
                      {canApproveOrReject && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center dark:hover:bg-red-900/20"
                            onClick={() => setIsRejectDialogOpen(true)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                            onClick={() => setIsApproveDialogOpen(true)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </>
                      )}

                      {/* Submit Button - Only show if user is authorized and submission is in draft status */}
                      {canSubmitActuals && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                          onClick={() => setIsSubmitDialogOpen(true)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Submit Actuals
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='m-0 p-0 pb-8'>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-[#1B6131] text-white">
                        <tr>
                          {isAuthorized && submissionStatus === 'Draft' && (
                            <th className="p-4 text-center whitespace-nowrap">Actions</th>
                          )}
                          <th className="p-4 text-center whitespace-nowrap">KPI</th>
                          <th className="p-4 text-center whitespace-nowrap">KPI Definition</th>
                          <th className="p-4 text-center whitespace-nowrap">Perspective</th>
                          <th className="p-4 text-center whitespace-nowrap">Month</th>
                          <th className="p-4 text-center whitespace-nowrap">Target</th>
                          <th className="p-4 text-center whitespace-nowrap">Actual</th>
                          <th className="p-4 text-center whitespace-nowrap">Achievement (%)</th>
                          <th className="p-4 text-center whitespace-nowrap">Problem Identification</th>
                          <th className="p-4 text-center whitespace-nowrap">Corrective Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(paginatedData).length > 0 ? (
                          Object.entries(paginatedData).map(([perspectiveId, entries]) => (
                            <React.Fragment key={perspectiveId}>
                              <tr className="bg-gray-50 dark:bg-gray-800">
                                <td colSpan={10} className="p-3 font-semibold">
                                  {getPerspectiveName(perspectiveId)}
                                </td>
                              </tr>
                              {entries.map((entry) => (
                                <tr
                                  key={`${entry.entry_id}-${entry.actual_month}`}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                  {isAuthorized && submissionStatus === 'Draft' && (
                                    <td className="p-4 whitespace-nowrap">
                                      <div className="flex justify-center space-x-2">

                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-[#46B749] hover:bg-[#E4EFCF] dark:hover:bg-[#1B6131]"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(entry);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>

                                      </div>
                                    </td>
                                  )}
                                  <td className="p-4 whitespace-nowrap text-center">
                                    {entry.kpi_name}
                                  </td>
                                  <td className="p-4 whitespace-normal max-w-xs text-center">
                                    {entry.kpiDefinition?.kpi_definition || 'N/A'}
                                  </td>
                                  <td className="p-4 whitespace-nowrap text-center">
                                    {getPerspectiveName(entry.kpiDefinition?.kpi_perspective_id || '')}
                                  </td>
                                  <td className="p-4 whitespace-nowrap text-center">
                                    {entry.month_name}
                                  </td>
                                  {/* Handle case when actuals array exists and has items */}
                                  {entry.actuals && entry.actuals.length > 0 ? (
                                    entry.actuals.map((actual) => (
                                      <React.Fragment key={actual.actual_id || `empty-${entry.entry_id}`}>
                                        <td className="p-4 whitespace-nowrap text-center">
                                          {actual.target_value || 0}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-center">
                                          {actual.actual_value || 0}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-center">
                                          {actual.achievement ? `${actual.achievement.toFixed(2)}%` : '0%'}
                                        </td>
                                        <td className="p-4 whitespace-normal max-w-xs text-center">
                                          {actual.problem_identification || 'N/A'}
                                        </td>
                                        <td className="p-4 whitespace-normal max-w-xs text-center">
                                          {actual.corrective_action || 'N/A'}
                                        </td>
                                      </React.Fragment>
                                    ))
                                  ) : (
                                    // Fallback untuk kasus di mana actuals array kosong atau undefined
                                    <React.Fragment>
                                      <td className="p-4 whitespace-nowrap text-center">0</td>
                                      <td className="p-4 whitespace-nowrap text-center">0</td>
                                      <td className="p-4 whitespace-nowrap text-center">0%</td>
                                      <td className="p-4 whitespace-normal max-w-xs text-center"></td>
                                      <td className="p-4 whitespace-normal max-w-xs text-center"></td>
                                    </React.Fragment>
                                  )}
                                </tr>
                              ))}
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={10} className="p-4 text-center">
                              No data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* Dialogs */}
      <EditActualDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        selectedActual={selectedActual}
        setSelectedActual={setSelectedActual}
        refreshData={refreshData}
      />
      <SubmitDialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        onSubmit={handleSubmitActuals}
        comments={submissionComments}
        setComments={setSubmissionComments}
        isSubmitting={isSubmitting}
      />

      <ApproveDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onApprove={handleApprove}
        notes={approvalNotes}
        setNotes={setApprovalNotes}
        isProcessing={isProcessingApproval}
      />

      <RejectDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onReject={handleReject}
        notes={approvalNotes}
        setNotes={setApprovalNotes}
        isProcessing={isProcessingApproval}
      />
    </div>
  );
};

export default MPMActuals;