// Main Targets Component - With Custom KPI Creation
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Edit, Eye, Send, CheckCircle, XCircle, CheckSquare, RotateCcw, Plus } from 'lucide-react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';
import { useTargets } from '@/hooks/useTargets';
import React from 'react';

// Import services
import { kpiPerspectiveService, KPIPerspective } from '@/services/kpiPerspectiveService';
import organizationUnitService, { OrganizationUnitResponse } from '@/services/organizationUnitService';
import { kpiDefinitionService, KPIDefinitionResponse } from '@/services/kpiDefinitionService';
import { allMonths, getMonthName } from '@/utils/month';
import { useAppSelector } from '@/redux/hooks';
import { SubmitDialogContainer } from '@/components/KPI/SubmitDialogContainer';
import { ApproveDialogContainer } from '@/components/KPI/ApproveDialogContainer';
import { ValidateDialogContainer } from '@/components/KPI/ValidateDialogContainer';
import { RejectDialogContainer } from '@/components/KPI/RejectDialogContainer';
import { RevertToDraftDialogContainer } from '@/components/KPI/RevertToDraftDialogContainer';
import { EditTargetDialogContainer } from '@/components/KPI/EditMonthlyTargetDialogContainer';
import KPIFormDialog from '@/components/BSC/KPIFormDialog';
import { useToast } from '@workspace/ui/components/sonner';

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

  // Dialog visibility states
  const [isEditMonthlyTargetOpen, setIsEditMonthlyTargetOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isValidateDialogOpen, setIsValidateDialogOpen] = useState(false);
  const [isAdminRejectDialogOpen, setIsAdminRejectDialogOpen] = useState(false);
  const [isRevertToDraftDialogOpen, setIsRevertToDraftDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  // Custom KPI Dialog states
  const [isCustomKPIDialogOpen, setIsCustomKPIDialogOpen] = useState(false);
  const [currentEditingKPI, setCurrentEditingKPI] = useState<Partial<KPIDefinitionResponse> | undefined>(undefined);
  const [perspectives, setPerspectives] = useState<KPIPerspective[]>([]);
  const [accessibleOrgUnits, setAccessibleOrgUnits] = useState<OrganizationUnitResponse[]>([]);
  const [canCreateCustomKPI, setCanCreateCustomKPI] = useState(false);

  // Filtering states
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch data using our custom hook
  const {
    loading,
    error,
    submission,
    entriesWithTargets,
    refreshData,
    authStatus,
  } = useTargets();

  // Fetch perspectives and check organization unit access on component mount
  useEffect(() => {
    const fetchPerspectives = async () => {
      try {
        const data = await kpiPerspectiveService.getPerspectives();
        setPerspectives(data);
      } catch (error) {
        console.error('Error fetching perspectives:', error);
      }
    };

    const checkOrgUnitAccess = async () => {
      try {
        // Get user's employee data directly from Redux store
        const employeeId = user?.employee_data?.employee_id;
        const employeeOrgUnitId = user?.employee_data?.employee_org_unit_id;
        const userOrgUnit = user?.org_unit_data;

        if (!employeeId || !employeeOrgUnitId || !userOrgUnit) return;

        // Check if user is org unit head (org_unit_head_id === employee_id)
        if (userOrgUnit.org_unit_head_id === employeeId) {
          setCanCreateCustomKPI(true);

          // Get accessible org units (own org unit)
          const ownOrgUnit = {
            org_unit_id: userOrgUnit.org_unit_id,
            org_unit_code: userOrgUnit.org_unit_code,
            org_unit_name: userOrgUnit.org_unit_name,
            org_unit_type: userOrgUnit.org_unit_type,
            org_unit_head_id: userOrgUnit.org_unit_head_id,
            org_unit_parent_id: userOrgUnit.org_unit_parent_id,
            org_unit_level: userOrgUnit.org_unit_level,
            org_unit_description: userOrgUnit.org_unit_description,
            org_unit_metadata: userOrgUnit.org_unit_metadata,
            is_active: userOrgUnit.is_active,
            org_unit_path: userOrgUnit.org_unit_path,
          };

          // Get only direct subordinate units using the service method
          const subordinateOrgUnits = await organizationUnitService.getOrganizationUnitWithChildren(userOrgUnit.org_unit_id);

          // Set the accessible org units (own + direct subordinates)
          setAccessibleOrgUnits([ownOrgUnit, ...(subordinateOrgUnits.children || [])]);
        }
      } catch (error) {
        console.error('Error checking org unit access:', error);
      }
    };

    fetchPerspectives();
    checkOrgUnitAccess();
  }, [user]);

  // Handle edit target
  const handleEditMonthlyTarget = (entryId: number) => {
    const entry = entriesWithTargets.find(entry => entry.entry_id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      setIsEditMonthlyTargetOpen(true);
    }
  };

  const handlePerspectiveChange = (value: string) => {
    setSelectedPerspective(value);
  };

  // Open custom KPI dialog
  const handleOpenCustomKPIDialog = () => {
    if (!submission) return;

    setCurrentEditingKPI({
      kpi_code: '',
      kpi_name: '',
      kpi_definition: '',
      kpi_weight: 0,
      kpi_uom: '',
      kpi_category: '',
      kpi_calculation: '',
      kpi_target: 0,
      kpi_org_unit_id: user?.employee_data?.employee_org_unit_id,
      kpi_perspective_id: 0,
      kpi_owner_id: user?.employee_data?.employee_id,
      kpi_period_id: submission.period_id,
      kpi_parent_id: null
    });

    setIsCustomKPIDialogOpen(true);
  };

  // Handle save custom KPI
  const handleSaveCustomKPI = async (kpi: KPIDefinitionResponse) => {
    try {
      if (!submission) {
        toast({
          title: "Error",
          description: "Submission data is missing",
          variant: "destructive",
        });
        return;
      }

      // Create new custom KPI definition
      const createData = {
        kpi_code: kpi.kpi_code,
        kpi_name: kpi.kpi_name,
        kpi_org_unit_id: kpi.kpi_org_unit_id,
        kpi_period_id: submission.period_id,
        kpi_perspective_id: kpi.kpi_perspective_id,
        kpi_owner_id: user?.employee_data?.employee_id,
        kpi_definition: kpi.kpi_definition,
        kpi_weight: kpi.kpi_weight,
        kpi_uom: kpi.kpi_uom,
        kpi_category: kpi.kpi_category,
        kpi_calculation: kpi.kpi_calculation || '',
        kpi_target: kpi.kpi_target,
        kpi_is_action_plan: false,
        kpi_is_ipm: false,
        kpi_visibility_level: 'org_unit',
        kpi_status: 'Active',
        kpi_employee_id: null,
        kpi_parent_id: null,
      };

      await kpiDefinitionService.createKPIDefinition(createData);

      // After creating KPI, refresh data to show the new entry
      refreshData();

      setIsCustomKPIDialogOpen(false);
      toast({
        title: "Success",
        description: "Custom KPI created successfully",
      });
    } catch (error) {
      console.error("Error saving custom KPI:", error);
      toast({
        title: "Error",
        description: "Failed to create custom KPI",
        variant: "destructive",
      });
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
  const getMonthlyTargets = (entry: typeof entriesWithTargets[0], months: number[]): (string | number | any)[] => {
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
              <Filtering>
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
                      {/* Custom KPI Button - Only show if user is org unit head */}
                      {canCreateCustomKPI && submission?.submission_status === "Draft" && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center dark:hover:bg-blue-900/20"
                          onClick={handleOpenCustomKPIDialog}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Custom KPI
                        </Button>
                      )}

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
                            className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                            onClick={() => setIsValidateDialogOpen(true)}
                          >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Validate
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center dark:hover:bg-red-900/20"
                            onClick={() => setIsAdminRejectDialogOpen(true)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {/* Approval Buttons - Only show if user can approve/reject */}
                      {authStatus.canApprove && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                            onClick={() => setIsApproveDialogOpen(true)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center dark:hover:bg-red-900/20"
                            onClick={() => setIsRejectDialogOpen(true)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
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
                          {(authStatus.canEdit || (authStatus.canView && submissionType === 'MPM')) && (
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

                                  {(authStatus.canEdit || (authStatus.canView && submissionType === 'MPM')) && (
                                    <td className="p-4 text-center flex gap-2 justify-center">
                                      {/* View action plan button - only for MPM */}
                                      {submissionType === 'MPM' && authStatus.canView && (
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
                                      )}

                                      {/* Edit button - only if user can edit */}
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

      {/* Dialog containers with encapsulated logic */}
      {selectedEntry && (
        <EditTargetDialogContainer
          isOpen={isEditMonthlyTargetOpen}
          onClose={() => setIsEditMonthlyTargetOpen(false)}
          kpi={selectedEntry}
          refreshData={refreshData}
        />
      )}

      {/* Custom KPI Form Dialog */}
      <KPIFormDialog
        isOpen={isCustomKPIDialogOpen}
        onClose={() => setIsCustomKPIDialogOpen(false)}
        onSave={handleSaveCustomKPI}
        initialData={currentEditingKPI}
        mode="create"
        perspectives={perspectives}
        organizationUnits={accessibleOrgUnits}
      />

      <SubmitDialogContainer
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        submissionId={Number(submissionId)}
        refreshData={refreshData}
      />

      <ApproveDialogContainer
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        submissionId={Number(submissionId)}
        employeeId={user?.employee_data?.employee_id}
        refreshData={refreshData}
      />

      <ValidateDialogContainer
        isOpen={isValidateDialogOpen}
        onClose={() => setIsValidateDialogOpen(false)}
        submissionId={Number(submissionId)}
        refreshData={refreshData}
      />

      <RejectDialogContainer
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        submissionId={Number(submissionId)}
        employeeId={user?.employee_data?.employee_id}
        refreshData={refreshData}
        isAdminReject={false}
      />

      <RejectDialogContainer
        isOpen={isAdminRejectDialogOpen}
        onClose={() => setIsAdminRejectDialogOpen(false)}
        submissionId={Number(submissionId)}
        refreshData={refreshData}
        isAdminReject={true}
      />

      <RevertToDraftDialogContainer
        isOpen={isRevertToDraftDialogOpen}
        onClose={() => setIsRevertToDraftDialogOpen(false)}
        submissionId={Number(submissionId)}
        refreshData={refreshData}
      />
    </div>
  );
};

export default Targets;