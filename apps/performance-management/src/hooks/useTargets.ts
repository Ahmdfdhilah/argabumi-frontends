import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { submissionService, SubmissionWithEntries, SubmissionEntry } from '../services/submissionService';
import { kpiDefinitionService, KPIDefinitionResponse } from '../services/kpiDefinitionService';
import { kpiTargetService, KPITargetResponse } from '../services/kpiTargetsService';
import { useAppSelector } from '@/redux/hooks';
import { useToast } from '@workspace/ui/components/sonner';
import organizationUnitService from '@/services/organizationUnitService';
import employeeService from '@/services/employeeService';

interface KPIEntryWithTargets extends SubmissionEntry {
  kpiDefinition?: KPIDefinitionResponse;
  targets: KPITargetResponse[];
}

interface AuthorizationStatus {
  isOwner: boolean;          
  isSupervisor: boolean;     
  isParentOrgHead: boolean;        
  isOrgUnitHead: boolean;
  canEdit: boolean;          
  canSubmit: boolean;        
  canApprove: boolean;       
  canReject: boolean;        
  canRevertToDraft: boolean; 
  canValidate: boolean;      
  canView: boolean;          
}

interface UseTargetsReturn {
  loading: boolean;
  error: string | null;
  submission: SubmissionWithEntries | null;
  entriesWithTargets: KPIEntryWithTargets[];
  refreshData: () => Promise<void>;
  authStatus: AuthorizationStatus;
  employeeData: any | null;
  supervisorData: any | null;
  orgUnitData: any | null;
}

// Cache for API responses
const apiCache = {
  kpiDefinitions: new Map<number, KPIDefinitionResponse>(),
  targets: new Map<string, KPITargetResponse[]>()
};

// Safely fetch data with error handling and caching
const safelyFetchData = async <T,>(
  fetchFunction: () => Promise<T>,
  defaultValue: T,
  errorMessage: string,
  cacheKey?: string,
  cache?: Map<string | number, T>
): Promise<T> => {
  // Check cache first if provided
  if (cacheKey && cache && cache.has(cacheKey)) {
    return cache.get(cacheKey) as T;
  }

  try {
    const result = await fetchFunction();
    
    // Save to cache if caching is enabled
    if (cacheKey && cache && result) {
      cache.set(cacheKey, result);
    }
    
    return result;
  } catch (err) {
    console.warn(errorMessage, err);
    return defaultValue;
  }
};

export const useTargets = (): UseTargetsReturn => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionWithEntries | null>(null);
  const [entriesWithTargets, setEntriesWithTargets] = useState<KPIEntryWithTargets[]>([]);
  
  // Track if initial data has been loaded
  const isInitialLoad = useRef(true);

  // Employee/Organization hierarchy data
  const [employeeData, setEmployeeData] = useState<any | null>(null);
  const [supervisorData, setSupervisorData] = useState<any | null>(null);
  const [orgUnitData, setOrgUnitData] = useState<any | null>(null);

  // Default authorization status
  const [authStatus, setAuthStatus] = useState<AuthorizationStatus>({
    isOwner: false,
    isSupervisor: false,
    isParentOrgHead: false,
    isOrgUnitHead: false,
    canEdit: false,
    canSubmit: false,
    canApprove: false,
    canReject: false,
    canValidate: false,
    canView: false,
    canRevertToDraft: false
  });

  // Get current user from Redux store
  const { user } = useAppSelector((state: any) => state.auth);
  const { toast } = useToast();
  const currentUserRoles = user?.roles ?? [];

  // Check if user has specific role - memoize this if possible
  const userHasRole = (roleCode: string): boolean => {
    return currentUserRoles.some((role: any) => role.role_code === roleCode);
  };

  // Determine authorization status based on submission data and user context
  const determineAuthorizationStatus = async (submissionData: any) => {
    if (!submissionData || !user) return;

    const currentEmployeeId = user.employee_data?.employee_id;
    const isAdmin = userHasRole('admin');
    const isDirector = userHasRole('director');

    // Default permissions - everyone starts with nothing
    const newAuthStatus: AuthorizationStatus = {
      isOwner: false,
      isSupervisor: false,
      isParentOrgHead: false,
      isOrgUnitHead: false,
      canEdit: false,
      canSubmit: false,
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
      // Only fetch employee data if we need to verify supervision
      let submissionEmployee = null;
      
      // Only make this API call if the current user isn't the submission owner
      // (to check if current user is the supervisor)
      if (currentEmployeeId !== submissionData.employee_id) {
        submissionEmployee = await safelyFetchData(
          () => employeeService.getEmployeeById(Number(submissionData.employee_id)),
          null,
          `Error fetching employee data for ID: ${submissionData.employee_id}`
        );
      }
      
      // Is current user the owner of this submission?
      if (currentEmployeeId === submissionData.employee_id) {
        newAuthStatus.isOwner = true;
        newAuthStatus.canView = true;
        // Save employee data for future use
        setEmployeeData(user.employee_data);
      }

      // Is current user the supervisor of this employee?
      const isSupervisor = submissionEmployee?.employee_supervisor_id === currentEmployeeId;

      if (isSupervisor) {
        newAuthStatus.isSupervisor = true;
        newAuthStatus.canView = true;
        // Can edit if in Draft status
        newAuthStatus.canEdit = submissionData.submission_status === 'Draft';
        newAuthStatus.canSubmit = submissionData.submission_status === 'Draft';
        // Can revert if rejected
        newAuthStatus.canRevertToDraft = ['Rejected', 'Admin_Rejected'].includes(submissionData.submission_status);

        // Save supervisor data
        setSupervisorData({
          employee_id: currentEmployeeId,
        });
      }
    }

    // ORG UNIT-LEVEL SUBMISSION
    if (submissionData.org_unit_id) {
      // Extract user and org unit context from Redux store to avoid another API call
      const userOrgUnitId = user?.org_unit_data?.org_unit_id;
      const userSubordinateOrgUnits = user?.context?.subordinate_org_units || [];
      
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

      if (isOrgUnitHead) {
        newAuthStatus.isOrgUnitHead = true;
        newAuthStatus.canView = true;
        newAuthStatus.canEdit = submissionData.submission_status === 'Draft';
        newAuthStatus.canSubmit = submissionData.submission_status === 'Draft';
        newAuthStatus.canRevertToDraft = ['Rejected', 'Admin_Rejected'].includes(submissionData.submission_status);

        // Save org unit data
        setOrgUnitData(user.org_unit_data);
      }

      // Check if user is parent org head
      const isParentOrgHead = userSubordinateOrgUnits.includes(submissionData.org_unit_id);
      const isSupervisorHead = submissionOrgUnit?.org_unit_parent_id === userOrgUnitId;

      if (isSupervisorHead) {
        newAuthStatus.canView = true;
        newAuthStatus.canApprove = submissionData.submission_status === 'Submitted';
        newAuthStatus.canReject = submissionData.submission_status === 'Submitted';
      }
      
      if (isParentOrgHead) {
        newAuthStatus.isParentOrgHead = true;
        newAuthStatus.canView = true;
        newAuthStatus.canApprove = submissionData.submission_status === 'Submitted';
        newAuthStatus.canReject = submissionData.submission_status === 'Submitted';
      }
    }

    // Update authorization status
    setAuthStatus(newAuthStatus);
  };

  const fetchData = async () => {
    if (!submissionId) {
      setError("Submission ID not provided");
      setLoading(false);
      return;
    }

    try {
      apiCache.targets.clear();
      setLoading(true);
      setError(null);

      // Get submission details with entries 
      const submissionWithEntries = await safelyFetchData(
        () => submissionService.getSubmissionWithEntries(parseInt(submissionId)),
        null,
        `Error fetching submission with entries for ID: ${submissionId}`
      );

      if (!submissionWithEntries) {
        // Fallback: fetch submission and entries separately
        const submissionData = await safelyFetchData(
          () => submissionService.getSubmission(parseInt(submissionId)),
          null,
          `Error fetching submission for ID: ${submissionId}`
        );

        if (!submissionData) {
          throw new Error(`Failed to load submission with ID: ${submissionId}`);
        }

        const submissionEntries = await safelyFetchData(
          () => submissionService.getSubmissionEntries(parseInt(submissionId)),
          [],
          `Error fetching submission entries for ID: ${submissionId}`
        );

        const submissionObj = {
          ...submissionData,
          entries: submissionEntries
        };
        
        setSubmission(submissionObj);

        // Determine permissions based on submission data
        await determineAuthorizationStatus(submissionData);

        // Fetch all KPI definitions and targets in batch if possible
        // For now, we'll optimize the individual fetches
        
        // For each entry, get KPI definition and targets
        const entriesWithData = await Promise.all(
          submissionEntries.map(async (entry) => {
            // Fetch KPI definition using cache
            const kpiDefinition = await safelyFetchData(
              () => kpiDefinitionService.getKPIDefinition(entry.kpi_id),
              undefined,
              `Error fetching KPI definition for ID: ${entry.kpi_id}`,
              entry.kpi_id.toString(),
              apiCache.kpiDefinitions
            );

            // Fetch targets for this entry using cache
            const cacheKey = `${entry.entry_id}_${submissionId}`;
            const targets = await safelyFetchData(
              () => kpiTargetService.getTargetsByEntry(entry.entry_id, parseInt(submissionId)),
              [],
              `Error fetching targets for entry ID: ${entry.entry_id}`,
              cacheKey,
              apiCache.targets
            );

            return {
              ...entry,
              kpiDefinition,
              targets
            };
          })
        );

        setEntriesWithTargets(entriesWithData);
      } else {
        // We got everything in one call
        setSubmission(submissionWithEntries);

        // Determine permissions based on submission data
        await determineAuthorizationStatus(submissionWithEntries);

        // For each entry, get KPI definition and targets with caching
        const entriesWithData = await Promise.all(
          submissionWithEntries.entries.map(async (entry) => {
            // Fetch KPI definition using cache
            const kpiDefinition = await safelyFetchData(
              () => kpiDefinitionService.getKPIDefinition(entry.kpi_id),
              undefined,
              `Error fetching KPI definition for ID: ${entry.kpi_id}`,
              entry.kpi_id.toString(),
              apiCache.kpiDefinitions
            );

            // Fetch targets for this entry using cache
            const cacheKey = `${entry.entry_id}_${submissionId}`;
            const targets = await safelyFetchData(
              () => kpiTargetService.getTargetsByEntry(entry.entry_id, parseInt(submissionId)),
              [],
              `Error fetching targets for entry ID: ${entry.entry_id}`,
              cacheKey,
              apiCache.targets
            );

            return {
              ...entry,
              kpiDefinition,
              targets
            };
          })
        );

        setEntriesWithTargets(entriesWithData);
      }
      
      // Mark initial load as complete
      isInitialLoad.current = false;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load targets data",
        variant: "destructive",
      });
      setError(err.message || "Failed to load targets data");
    } finally {
      setLoading(false);
    }
  };

  // Only fetch data on initial mount or when submissionId changes
  useEffect(() => {
    // Clear caches when submissionId changes to ensure fresh data
    if (submissionId) {
      apiCache.kpiDefinitions.clear();
      apiCache.targets.clear();
      fetchData();
    }
  }, [submissionId]);

  return {
    loading,
    error,
    submission,
    entriesWithTargets,
    refreshData: fetchData,
    authStatus,
    employeeData,
    supervisorData,
    orgUnitData
  };
};