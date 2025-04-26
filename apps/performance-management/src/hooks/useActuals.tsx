import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { submissionService, SubmissionEntry, SubmissionWithEntries } from '../services/submissionService';
import { kpiDefinitionService, KPIDefinitionResponse } from '../services/kpiDefinitionService';
import kpiActualService from '../services/kpiActualsService';
import { getMonthName } from '../utils/month';
import { useAppSelector } from '@/redux/hooks';
import { employeeService } from '../services/employeeService';
import organizationUnitService from '@/services/organizationUnitService';
import { evidenceService, KPIEvidence } from '../services/evidenceService';
import { useToast } from '@workspace/ui/components/sonner';

// Types
export interface KPIEntryWithActuals extends SubmissionEntry {
  target_value: string;
  actual_value: string;
  achievement_percentage: any;
  problem_identification: string;
  corrective_action: string;
  kpiDefinition?: KPIDefinitionResponse;
  actual_month: number;
  month_name: string;
  actuals: {
    actual_id: number;
    entry_id: number;
    actual_value: number;
    actual_month: number;
    target_value: number;
    achievement: number;
    score: number;
    problem_identification: string;
    corrective_action: string;
  }[];
}

interface AuthorizationStatus {
  isOwner: boolean;          // Whether current user is the employee who owns this submission
  isSupervisor: boolean;     // Whether current user is the supervisor who can edit/submit
  isOrgHead: boolean;        // Whether current user is the org head who can approve
  isOrgUnitManager: boolean; // Whether current user is manager of the org unit
  canEdit: boolean;          // Whether current user can edit actuals
  canSubmit: boolean;        // Whether current user can submit actuals
  canSubmitEvidence: boolean; // Whether current user can submit evidence
  canApprove: boolean;       // Whether current user can approve actuals
  canReject: boolean;        // Whether current user can reject actuals
  canRevertToDraft: boolean; // Whether current user can revert to draft
  canValidate: boolean;      // Whether current user can validate actuals
  canView: boolean;          // Whether current user can view actuals
}

interface UseActualsReturn {
  loading: boolean;
  error: string | null;
  entriesWithActuals: KPIEntryWithActuals[];
  submissionStatus: string;
  submissionData: SubmissionWithEntries | null;
  refreshData: () => Promise<void>;
  authStatus: AuthorizationStatus;
  employeeData: any | null;
  supervisorData: any | null;
  orgHeadData: any | null;
  submissionEvidence: KPIEvidence[];
}

// Cache for API responses
const apiCache = {
  kpiDefinitions: new Map<number, KPIDefinitionResponse>(),
  actuals: new Map<string, any[]>(),
  evidence: new Map<number, KPIEvidence[]>(),
  submissions: new Map<number, any>(),
  entries: new Map<number, SubmissionEntry[]>(),
  employees: new Map<number, any>(),
  orgUnits: new Map<number, any>()
};

// Safely fetch data with error handling and caching
const safelyFetchData = async <T,>(
  fetchFunction: () => Promise<T>,
  defaultValue: T,
  errorMessage: string,
  cacheKey?: string | number,
  cache?: Map<string | number, T>
): Promise<T> => {
  // Check cache first if provided
  if (cacheKey !== undefined && cache && cache.has(cacheKey)) {
    return cache.get(cacheKey) as T;
  }

  try {
    const result = await fetchFunction();

    // Save to cache if caching is enabled
    if (cacheKey !== undefined && cache && result) {
      cache.set(cacheKey, result);
    }

    return result;
  } catch (err) {
    console.warn(errorMessage, err);
    return defaultValue;
  }
};

export const useActuals = (): UseActualsReturn => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [entriesWithActuals, setEntriesWithActuals] = useState<KPIEntryWithActuals[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  const [submissionData, setSubmissionData] = useState<SubmissionWithEntries | null>(null);
  const [submissionEvidence, setSubmissionEvidence] = useState<KPIEvidence[]>([]);

  // Employee/Organization hierarchy data
  const [employeeData, setEmployeeData] = useState<any | null>(null);
  const [supervisorData, setSupervisorData] = useState<any | null>(null);
  const [orgHeadData, setOrgHeadData] = useState<any | null>(null);

  // Track if initial data has been loaded
  const isInitialLoad = useRef(true);

  // Default authorization status
  const [authStatus, setAuthStatus] = useState<AuthorizationStatus>({
    isOwner: false,
    isSupervisor: false,
    isOrgHead: false,
    isOrgUnitManager: false,
    canEdit: false,
    canSubmit: false,
    canSubmitEvidence: false,
    canApprove: false,
    canReject: false,
    canValidate: false,
    canView: false,
    canRevertToDraft: false
  });

  // Get current user from Redux store
  const { user } = useAppSelector((state: any) => state.auth);
  const { toast } = useToast();
  const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;
  const currentUserRoles = user?.roles ?? [];

  // Check if user has specific role
  const userHasRole = (roleCode: string): boolean => {
    return currentUserRoles.some((role: any) => role.role_code === roleCode);
  };

  // Determine authorization status based on submission data and user context
  const determineAuthorizationStatus = async (
    submissionData: any,
    evidenceData: KPIEvidence[]
  ) => {
    if (!submissionData || !user) return;

    const currentEmployeeId = user.employee_data?.employee_id;
    const isAdmin = userHasRole('admin');
    const isDirector = userHasRole('director');
    const hasEvidence = evidenceData && evidenceData.length > 0;

    // Default permissions - everyone starts with nothing
    const newAuthStatus: AuthorizationStatus = {
      isOwner: false,
      isSupervisor: false,
      isOrgHead: false,
      isOrgUnitManager: false,
      canEdit: false,
      canSubmit: false,
      canSubmitEvidence: false,
      canApprove: false,
      canReject: false,
      canValidate: false,
      canView: false,
      canRevertToDraft: false
    };

    // Admins always get certain permissions
    if (isAdmin) {
      newAuthStatus.canView = true;
      newAuthStatus.canValidate = submissionData.submission_status === 'Approved';
    }

    // Directors can view everything
    if (isDirector) {
      newAuthStatus.canView = true;
    }

    // EMPLOYEE-LEVEL SUBMISSION
    if (submissionData.employee_id) {
      // Is current user the owner of this submission?
      if (currentEmployeeId === submissionData.employee_id) {
        newAuthStatus.isOwner = true;
        newAuthStatus.canView = true;
        newAuthStatus.canSubmitEvidence = submissionData.submission_status === 'Draft';

        // Save employee data for future use
        setEmployeeData(user.employee_data);
        return setAuthStatus(newAuthStatus);
      }

      // Get submission employee data (only if not the owner)
      const submissionEmployee = await safelyFetchData(
        () => employeeService.getEmployeeById(Number(submissionData.employee_id)),
        null,
        `Error fetching employee data for ID: ${submissionData.employee_id}`,
        submissionData.employee_id,
        apiCache.employees
      );

      if (!submissionEmployee) return setAuthStatus(newAuthStatus);

      setEmployeeData(submissionEmployee);

      // Is current user the supervisor of this employee?
      const isSupervisor = submissionEmployee.employee_supervisor_id === currentEmployeeId;

      if (isSupervisor) {
        newAuthStatus.isSupervisor = true;
        newAuthStatus.canView = true;
        newAuthStatus.canEdit = submissionData.submission_status === 'Draft';
        newAuthStatus.canSubmit = submissionData.submission_status === 'Draft' && hasEvidence;
        newAuthStatus.canRevertToDraft = ['Rejected', 'Admin_Rejected'].includes(submissionData.submission_status);

        // Save supervisor data
        setSupervisorData({
          employee_id: currentEmployeeId,
        });

        return setAuthStatus(newAuthStatus);
      }

    }
    // ORG UNIT-LEVEL SUBMISSION
    else if (submissionData.org_unit_id) {
      // Extract user and org unit context from Redux store to avoid another API call
      const userOrgUnitId = user?.org_unit_data?.org_unit_id;

      let submissionOrgUnit = null;

      // Only fetch org unit data if needed for parent relationship check
      // (ideally this would be provided by the submission data itself)
      if (userOrgUnitId && userOrgUnitId !== submissionData.org_unit_id) {
        submissionOrgUnit = await safelyFetchData(
          () => organizationUnitService.getOrganizationUnitById(Number(submissionData.org_unit_id)),
          null,
          `Error fetching org unit data for ID: ${submissionData.org_unit_id}`
        );
      }

      const isOrgUnitHead = userOrgUnitId === submissionData.org_unit_id;
      console.log(hasEvidence);

      if (isOrgUnitHead) {
        console.log("masuk 1");
        newAuthStatus.isOwner = true;
        newAuthStatus.isOrgHead = true;
        newAuthStatus.isOrgUnitManager = true;
        newAuthStatus.canView = true;
        newAuthStatus.canEdit = submissionData.submission_status === 'Draft';
        newAuthStatus.canSubmit = submissionData.submission_status === 'Draft' && hasEvidence;
        newAuthStatus.canSubmitEvidence = submissionData.submission_status === 'Draft';
        newAuthStatus.canRevertToDraft = ['Rejected', 'Admin_Rejected'].includes(submissionData.submission_status);
        return setAuthStatus(newAuthStatus);
      }

      // Check for parent org unit relationship
      if (submissionOrgUnit && submissionOrgUnit?.org_unit_parent_id) {
        const parentOrgUnit = await safelyFetchData(
          () => organizationUnitService.getOrganizationUnitById(
            submissionData?.org_unit_id ? Number(submissionData.org_unit_id) : 0
          ),
          null,
          `Error fetching parent org unit for ID: ${submissionOrgUnit?.org_unit_parent_id}`,
          submissionOrgUnit?.org_unit_parent_id,
          apiCache.orgUnits
        );

        if (parentOrgUnit && parentOrgUnit.org_unit_head_id) {
          const orgHead = await safelyFetchData(
            () => employeeService.getEmployeeById(parentOrgUnit.org_unit_head_id),
            null,
            `Error fetching org head for ID: ${parentOrgUnit.org_unit_head_id}`,
            parentOrgUnit.org_unit_head_id,
            apiCache.employees
          );

          if (orgHead) {
            setOrgHeadData(orgHead);
            // Check if user is the org head
            const isOrgHead = orgHead.employee_id === currentEmployeeId;

            if (isOrgHead) {
              newAuthStatus.isOrgHead = true;
              newAuthStatus.canView = true;
              newAuthStatus.canApprove = submissionData.submission_status === 'Submitted';
              newAuthStatus.canReject = submissionData.submission_status === 'Submitted';

              return setAuthStatus(newAuthStatus);
            }
          }
        }
      }

      // Check if user's org unit is the direct supervisor of this org unit
      const isSupervisorOrgUnit = submissionOrgUnit?.org_unit_parent_id === currentUserOrgUnitId;

      if (isSupervisorOrgUnit) {
        newAuthStatus.canView = true;
        newAuthStatus.canApprove = submissionData.submission_status === 'Submitted';
        newAuthStatus.canReject = submissionData.submission_status === 'Submitted';

        return setAuthStatus(newAuthStatus);
      }
    }
    // Set the final authorization status
    setAuthStatus(newAuthStatus);
  };

  const fetchData = async () => {
    if (!submissionId || !month) {
      setError("Submission ID or month not provided");
      setLoading(false);
      return;
    }

    try {
      apiCache.actuals.clear();
      apiCache.evidence.clear();
      apiCache.submissions.delete(parseInt(submissionId));
      apiCache.entries.delete(parseInt(submissionId));

      setLoading(true);
      setError(null);

      const submissionIdNum = parseInt(submissionId);
      const monthNum = parseInt(month);

      // Get submission details - use cache if available
      const submissionDataResult = await safelyFetchData(
        () => submissionService.getSubmission(submissionIdNum),
        null,
        `Error fetching submission for ID: ${submissionId}`,
        submissionIdNum,
        apiCache.submissions
      );

      if (!submissionDataResult) {
        throw new Error(`Failed to load submission with ID: ${submissionId}`);
      }

      // Get evidence with caching
      const evidenceData = await safelyFetchData(
        () => evidenceService.getEvidencesBySubmission(submissionIdNum),
        [],
        `Error fetching evidence for submission ${submissionId}`,
        submissionIdNum,
        apiCache.evidence
      );

      // Get submission entries with caching
      const entries = await safelyFetchData(
        () => submissionService.getSubmissionEntries(submissionIdNum),
        [],
        `Error fetching submission entries for ID: ${submissionId}`,
        submissionIdNum,
        apiCache.entries
      );

      const defaultKpiDefinition: KPIDefinitionResponse = {
        kpi_id: 0,
        kpi_status: '',
        kpi_code: '',
        kpi_name: '',
        kpi_definition: '',
        created_at: '',
        updated_at: '',
        kpi_period_id: 0,
        kpi_perspective_id: 0,
        kpi_owner_id: 0,
        kpi_weight: '',
        kpi_uom: '',
        kpi_category: '',
        kpi_calculation: '',
        kpi_is_action_plan: false,
        kpi_is_ipm: false,
        kpi_visibility_level: '',
        created_by: null,
        updated_by: null
      };

      // For each entry, fetch KPI definition and actual data with caching
      const entriesWithData = await Promise.all(
        entries.map(async (entry) => {
          // Fetch KPI definition using cache
          const kpiDefinition = await safelyFetchData(
            () => kpiDefinitionService.getKPIDefinition(entry.kpi_id),
            defaultKpiDefinition,
            `Error fetching KPI definition for ID: ${entry.kpi_id}`,
            entry.kpi_id,
            apiCache.kpiDefinitions
          );

          // Fetch actuals for this KPI and month with cache
          const cacheKey = `${entry.kpi_id}_${monthNum}`;
          const actualsData = await safelyFetchData(
            () => kpiActualService.getActualsByKpiAndMonth(entry.kpi_id, monthNum),
            [],
            `Error fetching actuals for KPI ${entry.kpi_id} and month ${monthNum}`,
            cacheKey,
            apiCache.actuals
          );

          // Process actuals data to our format
          const actuals = actualsData.map(actual => ({
            actual_id: actual.actual_id,
            entry_id: entry.entry_id,
            actual_value: typeof actual.actual_value === 'string' ?
              parseFloat(actual.actual_value) : (actual.actual_value as number),
            actual_month: actual.actual_month,
            target_value: typeof actual.target_value === 'string' ?
              parseFloat(actual.target_value as string) : (actual.target_value as number) || 0,
            achievement: typeof actual.actual_achievement_percentage === 'string' ?
              parseFloat(actual.actual_achievement_percentage as string) :
              (actual.actual_achievement_percentage as number) || 0,
            score: 0, // Need to calculate or fetch
            problem_identification: actual.actual_problem_identification || '',
            corrective_action: actual.actual_corrective_action || ''
          }));

          // If no actuals found, create a default one
          if (actuals.length === 0) {
            actuals.push({
              actual_id: 0,
              entry_id: entry.entry_id,
              actual_value: 0,
              actual_month: monthNum,
              target_value: 0,
              achievement: 0,
              score: 0,
              problem_identification: '',
              corrective_action: ''
            });
          }

          return {
            ...entry,
            kpiDefinition,
            actual_month: monthNum,
            month_name: getMonthName(monthNum),
            actuals
          };
        })
      );

      // Update submission data
      const submissionWithEntries = {
        ...submissionDataResult,
        entries
      } as SubmissionWithEntries;

      // Update all states
      setSubmissionStatus(submissionDataResult.submission_status);
      setSubmissionData(submissionWithEntries);
      setSubmissionEvidence(evidenceData);
      setEntriesWithActuals(entriesWithData as KPIEntryWithActuals[]);

      // Determine authorization status
      await determineAuthorizationStatus(submissionDataResult, evidenceData);

      // Mark initial load as complete
      isInitialLoad.current = false;

    } catch (err: any) {
      console.error('Error fetching data:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to load MPM actuals data",
        variant: "destructive",
      });
      setError(err.message || "Failed to load MPM actuals data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId && month) {
      // Clear caches when dependencies change to ensure fresh data
      if (!isInitialLoad.current) {
        apiCache.actuals.clear();
        apiCache.evidence.clear();
      }
      fetchData();
    }
  }, [submissionId, month]);

  return {
    loading,
    error,
    entriesWithActuals,
    submissionStatus,
    submissionData,
    refreshData: fetchData,
    authStatus,
    employeeData,
    supervisorData,
    orgHeadData,
    submissionEvidence
  };
};