import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Edit, Eye, Send, CheckCircle, XCircle, CheckSquare, RotateCcw } from 'lucide-react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';
import { useTargets } from '@/hooks/useTargets';
import React from 'react';
import Decimal from 'decimal.js';
import EditMonthlyTargetDialog from '@/components/MPM/EditMonthlyTargetDialog';

// Import services
import { kpiTargetService } from '@/services/kpiTargetsService';
import { kpiPerspectiveService, KPIPerspective } from '@/services/kpiPerspectiveService';
import { submissionService, SubmissionStatusUpdate } from '@/services/submissionService';
import { approvalService, ApprovalStatusUpdate } from '@/services/approvalService';
import { useToast } from '@workspace/ui/components/sonner';
import { allMonths, getMonthName } from '@/utils/month';
import { useAppSelector } from '@/redux/hooks';
import { SubmitDialog } from '@/components/MPM/SubmitDialog';
import { ApproveDialog } from '@/components/MPM/ApproveDialog';
import { RejectDialog } from '@/components/MPM/RejectDialog';
import { ValidateDialog } from '@/components/MPM/ValidateDialog';
import { ConfirmDialog } from '@/components/MPM/ConfirmDialog';

interface TargetsProps {
  submissionTypePic: string;
}
const Targets = ({ submissionTypePic: submissionType }: TargetsProps) => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get current user data from Redux store
  const { user } = useAppSelector((state: any) => state.auth);

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dialog states
  const [isEditMonthlyTargetOpen, setIsEditMonthlyTargetOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isValidateDialogOpen, setIsValidateDialogOpen] = useState(false);
  const [isAdminRejectDialogOpen, setIsAdminRejectDialogOpen] = useState(false);
  const [isRevertToDraftDialogOpen, setIsRevertToDraftDialogOpen] = useState(false);
  const [validationComments, setValidationComments] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [_, setSelectedEntryId] = useState<number | null>(null);
  const [submissionComments, setSubmissionComments] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isReverting, setIsReverting] = useState(false);

  // Filtering states
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Perspectives state
  const [perspectives, setPerspectives] = useState<KPIPerspective[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // Fetch data using our custom hook
  const {
    loading,
    error,
    submission,
    entriesWithTargets,
    refreshData,
    authStatus,
  } = useTargets();

  const handleRevertToDraft = async () => {
    if (!submissionId || !authStatus.canRevertToDraft) {
      console.log("Cannot revert - missing submissionId or permissions:", {
        submissionId,
        canRevertToDraft: authStatus.canRevertToDraft
      });
      return;
    }

    console.log("Starting revert to draft process...");
    setIsReverting(true);

    try {
      const statusUpdate: SubmissionStatusUpdate = {
        submission_status: 'Draft',
        submission_comments: 'Reverted to draft for editing after rejection'
      };

      await submissionService.updateSubmissionStatus(Number(submissionId), statusUpdate);

      toast({
        title: "Success",
        description: "Submission reverted to draft status successfully",
      });

      // Close the dialog AFTER successful operation
      setIsRevertToDraftDialogOpen(false);

      // Refresh data to get updated submission status
      await refreshData();

    } catch (error) {
      console.error('Error reverting to draft:', error);
      toast({
        title: "Error",
        description: "Failed to revert to draft status",
        variant: "destructive",
      });
    } finally {
      setIsReverting(false);
    }
  };

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

  // Handle edit target
  const handleEditMonthlyTarget = (entryId: number) => {
    const entry = entriesWithTargets.find(entry => entry.entry_id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      setSelectedEntryId(entryId);
      setIsEditMonthlyTargetOpen(true);
    }
  };

  // Handle save edited targets
  const handleSaveTargets = async (updatedEntry: any) => {
    try {
      // Map the updated entry to the format expected by the bulk update endpoint
      const bulkUpdateData = {
        targets: updatedEntry.targets.map((target: any) => ({
          target_id: target.target_id,
          target_value: target.target_value,
          target_notes: target.target_notes || null
        }))
      };

      // Call the service to update the targets
      await kpiTargetService.bulkUpdateTargets(bulkUpdateData);

      // Refresh data to show updated values
      refreshData();
      setIsEditMonthlyTargetOpen(false);

      toast({
        title: "Success",
        description: "Targets updated successfully",
      });
    } catch (error) {
      console.error('Error updating targets:', error);
      toast({
        title: "Error",
        description: "Failed to update targets",
        variant: "destructive",
      });
    }
  };


  const handlePerspectiveChange = (value: string) => {
    setSelectedPerspective(value);
  };

  // Submit function
  const handleSubmitTargets = async () => {
    if (!submissionId || !authStatus.canSubmit) return;

    setIsSubmitting(true);
    try {
      const statusUpdate: SubmissionStatusUpdate = {
        submission_status: 'Submitted',
        submission_comments: submissionComments
      };

      await submissionService.updateSubmissionStatus(Number(submissionId), statusUpdate);

      toast({
        title: "Success",
        description: "Targets submitted successfully",
      });

      setIsSubmitDialogOpen(false);
      // Refresh data to get updated submission status
      refreshData();
    } catch (error) {
      console.error('Error submitting targets:', error);
      toast({
        title: "Error",
        description: "Failed to submit targets",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve function
  const handleApprove = async () => {
    if (!submissionId || !authStatus.canApprove) return;

    setIsProcessingApproval(true);
    try {
      // First get the approval ID for the current user
      const approvalData = await approvalService.getApprovalsBySubmission(parseInt(submissionId));
      const userApproval = approvalData.find(
        approval => approval.approver_id === user?.employee_data?.employee_id &&
          approval.approval_status === 'Pending'
      );

      if (!userApproval?.approval_id) {
        throw new Error("No pending approval found for current user");
      }

      const statusUpdate: ApprovalStatusUpdate = {
        approval_status: 'Approved',
        approval_notes: approvalNotes
      };

      await approvalService.updateApprovalStatus(userApproval.approval_id, statusUpdate);

      setIsApproveDialogOpen(false);
      setApprovalNotes('');

      // Refresh data to get updated status
      refreshData();

      toast({
        title: "Success",
        description: "Targets approved successfully",
      });
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve targets",
        variant: "destructive",
      });
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Reject function
  const handleReject = async () => {
    if (!submissionId || !authStatus.canReject) return;

    setIsProcessingApproval(true);
    try {
      // First get the approval ID for the current user
      const approvalData = await approvalService.getApprovalsBySubmission(parseInt(submissionId));
      console.log("approvalData", approvalData);
      console.log("user", user);

      const userApproval = approvalData.find(
        approval => approval.approver_id === user?.employee_data?.employee_id &&
          approval.approval_status === 'Pending'
      );
      console.log("userApproval", userApproval);

      if (!userApproval?.approval_id) {
        throw new Error("No pending approval found for current user");
      }

      const statusUpdate: ApprovalStatusUpdate = {
        approval_status: 'Rejected',
        approval_notes: approvalNotes
      };

      await approvalService.updateApprovalStatus(userApproval.approval_id, statusUpdate);

      setIsRejectDialogOpen(false);
      setApprovalNotes('');

      // Refresh data to get updated status
      refreshData();

      toast({
        title: "Success",
        description: "Targets rejected successfully",
      });
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject targets",
        variant: "destructive",
      });
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleValidate = async () => {
    if (!submissionId || !authStatus.canValidate) return;

    setIsValidating(true);
    try {
      await submissionService.validateSubmission(parseInt(submissionId), validationComments);

      toast({
        title: "Success",
        description: "Targets validated successfully",
      });

      setIsValidateDialogOpen(false);
      setValidationComments('');

      // Refresh data to get updated status
      refreshData();
    } catch (error) {
      console.error('Error validating submission:', error);
      toast({
        title: "Error",
        description: "Failed to validate targets",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Add the admin reject handler function
  const handleAdminReject = async () => {
    if (!submissionId || !authStatus.canValidate) return;

    setIsValidating(true);
    try {
      const rejectData = {
        rejection_reason: validationComments
      };

      await submissionService.adminRejectSubmission(parseInt(submissionId), rejectData);

      toast({
        title: "Success",
        description: "Targets rejected successfully",
      });

      setIsAdminRejectDialogOpen(false);
      setValidationComments('');

      // Refresh data to get updated status
      refreshData();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject targets",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };


  // Group entries by perspective
  const groupedEntries = useMemo(() => {
    if (!entriesWithTargets || entriesWithTargets.length === 0) return {};

    return entriesWithTargets.reduce((acc, entry) => {
      const perspective = entry.kpiDefinition?.kpi_perspective_id || 'Unknown';
      if (!acc[perspective]) {
        acc[perspective] = [];
      }
      acc[perspective].push(entry);
      return acc;
    }, {} as Record<string, typeof entriesWithTargets>);
  }, [entriesWithTargets]);

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

    // Additional filtering logic for dates would go here

    return result;
  }, [groupedEntries, selectedPerspective, perspectives]);

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
    const result: Record<string, typeof entriesWithTargets> = {};

    for (const [perspectiveId, entries] of Object.entries(filteredEntries)) {
      // Check if any items in this perspective should be included in current page
      if (currentIdx < endIndex && currentIdx + entries.length > startIndex) {
        const perspectiveStartIdx = Math.max(0, startIndex - currentIdx);
        const perspectiveEndIdx = Math.min(entries.length, endIndex - currentIdx);
        result[perspectiveId] = entries.slice(perspectiveStartIdx, perspectiveEndIdx);
      }

      currentIdx += entries.length;
    }

    return result;
  }, [filteredEntries, currentPage, itemsPerPage]);

  // Helper function to get monthly targets for an entry
  const getMonthlyTargets = (entry: typeof entriesWithTargets[0], months: number[]): (string | number | Decimal)[] => {
    return months.map(month => {
      const target = entry.targets.find(t => t.target_month === month);
      return target?.target_value || '-';
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

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

        <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
          <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
            <div className="space-y-6 w-full">
              {/* Header Section */}
              <Breadcrumb
                items={[{
                  label: `${submissionType} Target List`,
                  path: `/performance-management/${submissionType.toLowerCase()}/target`
                }]}
                currentPage={`${submissionType} Targets`}
                showHomeIcon={true}
                subtitle={`${submissionType} Targets ID : ${submissionId} ${submission ? `(${submission.submission_status})` : ''}`}
              />

              {/* Filter Section */}
              <Filtering
              >
                {/* Filter for perspective from service data */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <span>Perspective</span>
                  </label>
                  <select
                    className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10 rounded-md"
                    value={selectedPerspective}
                    onChange={(e) => handlePerspectiveChange(e.target.value)}
                  >
                    <option value="all">All Perspectives</option>
                    {perspectives.map((perspective) => (
                      <option key={perspective.perspective_id} value={perspective.perspective_name}>
                        {perspective.perspective_name}
                      </option>
                    ))}
                  </select>
                </div>
              </Filtering>

              {/* Main Card */}
              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      KPI Targets Table
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                      {/* Revert to Draft Button - Only show for user who can submit and when status is Rejected */}
                      {authStatus.canRevertToDraft && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-amber-600 text-amber-600 hover:bg-amber-50 flex items-center justify-center dark:hover:bg-amber-900/20"
                          onClick={() => setIsRevertToDraftDialogOpen(true)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Revert to Draft
                        </Button>
                      )}

                      {/* Validation Buttons - Only show for admin if submission is Approved */}
                      {authStatus.canValidate && submission?.submission_status === 'Approved' && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center dark:hover:bg-red-900/20"
                            onClick={() => setIsAdminRejectDialogOpen(true)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                            onClick={() => setIsValidateDialogOpen(true)}
                          >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Validate
                          </Button>
                        </>
                      )}

                      {/* Approval Buttons - Only show if user can approve/reject */}
                      {authStatus.canApprove && (
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

                      {/* Submit Button - Only show if user can submit and status is Draft */}
                      {authStatus.canSubmit && submission?.submission_status === 'Draft' && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                          onClick={() => setIsSubmitDialogOpen(true)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Submit Targets
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
                          {submissionType === 'MPM' && (authStatus.canEdit || authStatus.canView) && (
                            <th className="p-4 text-center whitespace-nowrap">Action</th>
                          )}
                          <th className="p-4 text-center whitespace-nowrap">KPI</th>
                          <th className="p-4 text-center whitespace-nowrap">KPI Definition</th>
                          <th className="p-4 text-center whitespace-nowrap">Weight</th>
                          <th className="p-4 text-center whitespace-nowrap">UOM</th>
                          <th className="p-4 text-center whitespace-nowrap">Category</th>
                          <th className="p-4 text-center whitespace-nowrap">YTD Calculation</th>

                          {/* Render all 12 month headers using utility function */}
                          {allMonths.map((month) => (
                            <th
                              key={month}
                              className="p-4 text-center whitespace-nowrap"
                            >
                              {getMonthName(month)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(paginatedData).map(([perspectiveId, entries]) => (
                          <React.Fragment key={perspectiveId}>
                            <tr className="bg-[#E4EFCF] dark:bg-[#1B6131]/30">
                              <td colSpan={19} className="p-4 font-medium text-[#1B6131] dark:text-[#46B749]">
                                {getPerspectiveName(perspectiveId)}
                              </td>
                            </tr>
                            {entries.map((entry) => {
                              const monthlyTargets = getMonthlyTargets(entry, allMonths);

                              return (
                                <tr key={entry.entry_id} className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20">
                                  {submissionType === 'MPM' && (
                                    <td className="p-4 text-center flex gap-2 justify-center">
                                      {/* View button */}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:text-[#1B6131]"
                                        onClick={() =>
                                          navigate(`/performance-management/mpm/target/${submissionId}/kpi/${entry.kpi_id}/action-plans`)
                                        }
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>

                                      {/* Edit button */}
                                      {authStatus.canEdit && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="hover:text-[#1B6131]"
                                          onClick={() => handleEditMonthlyTarget(entry.entry_id)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </td>
                                  )}

                                  <td className="p-4">{entry.kpi_name}</td>
                                  <td className="p-4">{entry.kpiDefinition?.kpi_definition || '-'}</td>
                                  <td className="p-4 text-center">{entry.kpiDefinition?.kpi_weight?.toString() || '-'}%</td>
                                  <td className="p-4 text-center">{entry.kpiDefinition?.kpi_uom || '-'}</td>
                                  <td className="p-4 text-center">{entry.kpiDefinition?.kpi_category || '-'}</td>
                                  <td className="p-4 text-center">{entry.kpiDefinition?.kpi_calculation || '-'}</td>
                                  {/* Render all 12 monthly target values */}
                                  {monthlyTargets.map((target, idx) => (
                                    <td key={idx} className="p-4 text-center">{target?.toString() || '-'}</td>
                                  ))}
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Component */}
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
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {selectedEntry && (
        <EditMonthlyTargetDialog
          isOpen={isEditMonthlyTargetOpen}
          onClose={() => setIsEditMonthlyTargetOpen(false)}
          kpi={selectedEntry}
          onSave={handleSaveTargets}
        />
      )}

      <SubmitDialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        comments={submissionComments}
        setComments={setSubmissionComments}
        onSubmit={handleSubmitTargets}
        isSubmitting={isSubmitting}
      />

      <ApproveDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        notes={approvalNotes}
        setNotes={setApprovalNotes}
        onApprove={handleApprove}
        isProcessing={isProcessingApproval}
      />

      <ValidateDialog
        isOpen={isValidateDialogOpen}
        onClose={() => setIsValidateDialogOpen(false)}
        comments={validationComments}
        setComments={setValidationComments}
        onValidate={handleValidate}
        isProcessing={isValidating}
      />

      {/* Admin Reject Dialog - reusing the RejectDialog component with a different handler */}
      <RejectDialog
        isOpen={isAdminRejectDialogOpen}
        onClose={() => setIsAdminRejectDialogOpen(false)}
        notes={validationComments}
        setNotes={setValidationComments}
        onReject={handleAdminReject}
        isProcessing={isValidating}
        title="Admin Rejection"
        description="You are about to reject these previously approved targets as an admin. Please provide a reason."
      />

      <RejectDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        notes={approvalNotes}
        setNotes={setApprovalNotes}
        onReject={handleReject}
        isProcessing={isProcessingApproval}
        title="Reject Targets"
        description="You are about to reject these targets. Please provide a reason below."
      />

      {/* Revert to Draft Dialog */}
      <ConfirmDialog
        isOpen={isRevertToDraftDialogOpen}
        onClose={() => setIsRevertToDraftDialogOpen(false)}
        onConfirm={handleRevertToDraft}
        isProcessing={isReverting}
        title="Revert to Draft"
        description="Are you sure you want to revert this submission to draft status? This will allow you to make changes before submitting again."
      />

    </div>
  );
};

export default Targets;