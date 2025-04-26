import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
import { Edit, Send, Users, CheckCircle, XCircle, FileText, Upload, CheckSquare, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import React from 'react';
import Footer from '@/components/Footer';
import { kpiPerspectiveService, KPIPerspective } from '@/services/kpiPerspectiveService';
import { getMonthName } from '@/utils/month';
import { useActuals, KPIEntryWithActuals } from '@/hooks/useActuals';
import { UploadEvidenceDialogContainer } from '@/components/KPI/UploadEvidenceDialogContainer';
import { RevertToDraftDialogContainer } from '@/components/KPI/RevertToDraftDialogContainer';
import { ValidateDialogContainer } from '@/components/KPI/ValidateDialogContainer';
import { RejectDialogContainer } from '@/components/KPI/RejectDialogContainer';
import { ApproveDialogContainer } from '@/components/KPI/ApproveDialogContainer';
import { SubmitDialogContainer } from '@/components/KPI/SubmitDialogContainer';
import { EditActualDialogContainer } from '@/components/KPI/EditActualDialogContainer';
import ViewEvidenceDialog from '@/components/KPI/ViewEvidence';
import { useAppSelector } from '@/redux/hooks';

// Global perspective cache with expiration to prevent redundant API calls
const perspectiveCache = {
  data: null as KPIPerspective[] | null,
  lastFetched: 0
};

interface ActualsProps {
  submissionTypePic?: string;
}

const Actuals = ({ submissionTypePic: submissionType }: ActualsProps) => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month');

  // Get current user from Redux store
  const { user } = useAppSelector((state: any) => state.auth);

  // Use our custom hook to fetch actuals data (with built-in caching)
  const {
    loading,
    error,
    entriesWithActuals,
    submissionStatus,
    submissionEvidence,
    refreshData,
    authStatus,
  } = useActuals();

  // Layout states - only create once with default values
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dialog visibility states - minimized using a single state object to reduce re-renders
  const [dialogState, setDialogState] = useState({
    isEditDialogOpen: false,
    isSubmitDialogOpen: false,
    isApproveDialogOpen: false,
    isRejectDialogOpen: false,
    isValidateDialogOpen: false,
    isAdminRejectDialogOpen: false,
    isRevertToDraftDialogOpen: false,
    isSubmitEvidenceDialogOpen: false,
    isViewEvidenceDialogOpen: false,
  });

  // Track selected actual for editing - only set when needed
  const [selectedActual, setSelectedActual] = useState<KPIEntryWithActuals | null>(null);

  // UI states
  const [perspectives, setPerspectives] = useState<KPIPerspective[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtering states
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');

  // Use React's useCallback for event handlers to prevent unnecessary re-renders
  const openDialog = useCallback((dialogName: string) => {
    setDialogState(prev => ({ ...prev, [dialogName]: true }));
  }, []);

  const closeDialog = useCallback((dialogName: string) => {
    setDialogState(prev => ({ ...prev, [dialogName]: false }));
  }, []);

  // Fetch perspectives with caching mechanism
  const fetchPerspectives = useCallback(async () => {
    const now = Date.now();
    const cacheExpiration = 5 * 60 * 1000; // 5 minutes
    
    if (perspectiveCache.data && (now - perspectiveCache.lastFetched) < cacheExpiration) {
      setPerspectives(perspectiveCache.data);
      return;
    }
    
    try {
      const data = await kpiPerspectiveService.getPerspectives();
      
      // Update cache
      perspectiveCache.data = data;
      perspectiveCache.lastFetched = now;
      
      setPerspectives(data);
    } catch (error) {
      console.error('Error fetching perspectives:', error);
    }
  }, []);

  // Fetch perspectives only once on component mount
  useEffect(() => {
    fetchPerspectives();
  }, [fetchPerspectives]);

  // Get perspective name - memoized function to optimize lookups
  const getPerspectiveName = useCallback((id: string | number): string => {
    const perspective = perspectives.find(p => p.perspective_id.toString() === id.toString());
    return perspective ? perspective.perspective_name : 'Uncategorized';
  }, [perspectives]);

  // Group entries by perspective - memoized to avoid recalculation on every render
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

  // Filter entries based on selected filters - memoized
  const filteredEntries = useMemo(() => {
    // If no filter is applied, return all entries
    if (!selectedPerspective || selectedPerspective === 'all') {
      return groupedEntries;
    }

    // Otherwise, create a new filtered object
    return Object.entries(groupedEntries).reduce((filtered, [perspectiveId, entries]) => {
      if (getPerspectiveName(perspectiveId) === selectedPerspective) {
        filtered[perspectiveId] = entries;
      }
      return filtered;
    }, {} as Record<string, KPIEntryWithActuals[]>);
  }, [groupedEntries, selectedPerspective, getPerspectiveName]);

  // Calculate pagination metrics - memoized
  const paginationMetrics = useMemo(() => {
    const totalItems = Object.values(filteredEntries).reduce((sum, entries) => sum + entries.length, 0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return { totalItems, totalPages };
  }, [filteredEntries, itemsPerPage]);

  // Get paginated data - memoized
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

  // Handlers - wrapped in useCallback to maintain reference stability
  const handleEditClick = useCallback((entry: KPIEntryWithActuals) => {
    setSelectedActual(entry);
    setDialogState(prev => ({ ...prev, isEditDialogOpen: true }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const handlePerspectiveChange = useCallback((value: string) => {
    setSelectedPerspective(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Handle dialog submission callbacks
  const handleDialogClose = useCallback((dialogName: string, shouldRefresh = false) => {
    closeDialog(dialogName);
    
    if (shouldRefresh) {
      refreshData();
    }
  }, [closeDialog, refreshData]);

  // Loading, error, and permission states
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!authStatus.canView) {
    return <div className="flex justify-center items-center h-screen">You don't have permission to view this page.</div>;
  }

  const currentMonth = month ? getMonthName(parseInt(month)) : 'Monthly';
  const hasEvidence = submissionEvidence && submissionEvidence.length > 0;

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

              {/* Evidence Status */}
              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      {submissionType} Evidence Status
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                      {authStatus.canSubmitEvidence && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                          onClick={() => openDialog('isSubmitEvidenceDialogOpen')}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Evidence
                        </Button>
                      )}
                      {hasEvidence && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                          onClick={() => openDialog('isViewEvidenceDialogOpen')}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Evidence
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-sm">
                      {hasEvidence
                        ? `${submissionEvidence.length} file(s) uploaded`
                        : "No evidence uploaded yet"}
                    </p>
                    {hasEvidence && (
                      <ul className="mt-2 space-y-1">
                        {submissionEvidence.map((evidence, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                            {evidence.evidence_file_name || `Evidence ${index + 1}`}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!hasEvidence && submissionStatus === 'Draft' && (
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                        Evidence must be uploaded before submitting actual values.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Filter Section */}
              <Filtering>
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
                      {/* Approval Buttons - Only show if user can approve/reject */}
                      {authStatus.canApprove && submissionStatus === 'Submitted' && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50 flex items-center justify-center dark:hover:bg-green-900/20"
                            onClick={() => openDialog('isApproveDialogOpen')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center dark:hover:bg-red-900/20"
                            onClick={() => openDialog('isRejectDialogOpen')}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {/* Validate Button - Only show if user can validate */}
                      {authStatus.canValidate && submissionStatus === 'Approved' && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center dark:hover:bg-blue-900/20"
                            onClick={() => openDialog('isValidateDialogOpen')}
                          >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Validate
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center dark:hover:bg-red-900/20"
                            onClick={() => openDialog('isAdminRejectDialogOpen')}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {/* Revert to Draft Button - Only show if user can revert */}
                      {authStatus.canRevertToDraft && (submissionStatus === 'Rejected' || submissionStatus === 'Admin_Rejected') && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-amber-600 text-amber-600 hover:bg-amber-50 flex items-center justify-center dark:hover:bg-amber-900/20"
                          onClick={() => openDialog('isRevertToDraftDialogOpen')}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Revert to Draft
                        </Button>
                      )}

                      {/* Submit Button - Only show if user can submit and status is Draft */}
                      {authStatus.canSubmit && submissionStatus === 'Draft' && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center dark:hover:bg-blue-900/20"
                          onClick={() => openDialog('isSubmitDialogOpen')}
                          disabled={!hasEvidence}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Submit
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
                          {authStatus.canEdit && submissionStatus === 'Draft' && (
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
                                <td colSpan={authStatus.canEdit && submissionStatus === 'Draft' ? 10 : 9} className="p-3 font-semibold">
                                  {getPerspectiveName(perspectiveId)}
                                </td>
                              </tr>
                              {entries.map((entry) => (
                                <tr
                                  key={`${entry.entry_id}-${entry.actual_month}`}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                  {authStatus.canEdit && submissionStatus === 'Draft' && (
                                    <td className="p-4 whitespace-nowrap">
                                      <div className="flex justify-center space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-[#46B749] hover:bg-[#E4EFCF] dark:hover:bg-[#1B6131]"
                                          onClick={() => handleEditClick(entry)}
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
                                  {/* Optimized actuals rendering */}
                                  {entry.actuals && entry.actuals.length > 0 ? (
                                    <>
                                      <td className="p-4 whitespace-nowrap text-center">
                                        {String(entry.actuals[0].target_value || entry.kpiDefinition?.kpi_target || 'N/A')}
                                      </td>
                                      <td className="p-4 whitespace-nowrap text-center">
                                        {entry.actuals[0].actual_value || 'Not set'}
                                      </td>
                                      <td className="p-4 whitespace-nowrap text-center">
                                        {entry.actuals[0].actual_value && entry.actuals[0].target_value
                                          ? `${entry.actuals[0].achievement.toFixed(2)}%`
                                          : 'N/A'}
                                      </td>
                                      <td className="p-4 whitespace-normal max-w-xs text-center">
                                        {entry.actuals[0].problem_identification || 'N/A'}
                                      </td>
                                      <td className="p-4 whitespace-normal max-w-xs text-center">
                                        {entry.actuals[0].corrective_action || 'N/A'}
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="p-4 whitespace-nowrap text-center">
                                        {entry.target_value || 'N/A'}
                                      </td>
                                      <td className="p-4 whitespace-nowrap text-center">
                                        Not set
                                      </td>
                                      <td className="p-4 whitespace-nowrap text-center">
                                        N/A
                                      </td>
                                      <td className="p-4 whitespace-normal max-w-xs text-center">
                                        N/A
                                      </td>
                                      <td className="p-4 whitespace-normal max-w-xs text-center">
                                        N/A
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={authStatus.canEdit && submissionStatus === 'Draft' ? 10 : 9} className="p-4 text-center">
                              No records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination - using memoized totals */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginationMetrics.totalPages}
                totalItems={paginationMetrics.totalItems}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Dialog Components - using conditional rendering for performance optimization */}
      {selectedActual && dialogState.isEditDialogOpen && (
        <EditActualDialogContainer
          isOpen={true}
          onClose={() => handleDialogClose('isEditDialogOpen', true)}
          selectedActual={selectedActual}
          refreshData={refreshData}
        />
      )}

      {dialogState.isSubmitDialogOpen && (
        <SubmitDialogContainer
          isOpen={true}
          onClose={() => handleDialogClose('isSubmitDialogOpen', true)}
          submissionId={Number(submissionId)}
          refreshData={refreshData}
        />
      )}

      {dialogState.isApproveDialogOpen && (
        <ApproveDialogContainer
          isOpen={true}
          onClose={() => handleDialogClose('isApproveDialogOpen', true)}
          submissionId={Number(submissionId)}
          employeeId={user?.employee_data?.employee_id}
          refreshData={refreshData}
        />
      )}

      {dialogState.isRejectDialogOpen && (
        <RejectDialogContainer
          isOpen={true}
          onClose={() => handleDialogClose('isRejectDialogOpen', true)}
          submissionId={Number(submissionId)}
          employeeId={user?.employee_data?.employee_id}
          refreshData={refreshData}
          isAdminReject={false}
        />
      )}

      {dialogState.isAdminRejectDialogOpen && (
        <RejectDialogContainer
          isOpen={true}
          onClose={() => handleDialogClose('isAdminRejectDialogOpen', true)}
          submissionId={Number(submissionId)}
          refreshData={refreshData}
          isAdminReject={true}
        />
      )}

      {dialogState.isValidateDialogOpen && (
        <ValidateDialogContainer
          isOpen={true}
          onClose={() => handleDialogClose('isValidateDialogOpen', true)}
          submissionId={Number(submissionId)}
          refreshData={refreshData}
        />
      )}

      {dialogState.isRevertToDraftDialogOpen && (
        <RevertToDraftDialogContainer
          isOpen={true}
          onClose={() => handleDialogClose('isRevertToDraftDialogOpen', true)}
          submissionId={Number(submissionId)}
          refreshData={refreshData}
        />
      )}

      {dialogState.isSubmitEvidenceDialogOpen && (
        <UploadEvidenceDialogContainer
          isOpen={true}
          onClose={() => handleDialogClose('isSubmitEvidenceDialogOpen', true)}
          submissionId={Number(submissionId)}
          refreshData={refreshData}
        />
      )}

      {dialogState.isViewEvidenceDialogOpen && (
        <ViewEvidenceDialog
          isOpen={true}
          onClose={() => handleDialogClose('isViewEvidenceDialogOpen', false)}
          evidences={submissionEvidence || []}
        />
      )}
    </div>
  );
};

export default Actuals;