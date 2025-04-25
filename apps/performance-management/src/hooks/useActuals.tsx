import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { submissionService, SubmissionEntry, SubmissionWithEntries } from '../services/submissionService';
import { kpiDefinitionService, KPIDefinitionResponse } from '../services/kpiDefinitionService';
import kpiActualService from '../services/kpiActualsService';
import { getMonthName } from '../utils/month';
import { useAppSelector } from '@/redux/hooks';
import { employeeService } from '../services/employeeService';
import organizationUnitService from '@/services/organizationUnitService';
import { evidenceService, KPIEvidence } from '../services/evidenceService';

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
  orgUnitData: any | null;
  submissionEvidence: KPIEvidence[];  // Added this for submission evidence
}

// Safely fetch data with error handling
const safelyFetchData = async <T,>(
  fetchFunction: () => Promise<T>,
  defaultValue: T,
  errorMessage: string
): Promise<T> => {
  try {
    return await fetchFunction();
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
  const [orgUnitData, setOrgUnitData] = useState<any | null>(null);

  // Authorization status
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
  const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;
  const currentEmployeeId = user?.employee_data?.employee_id ?? null;
  const currentUserRoles = user?.roles ?? [];

  // Check if user has specific role
  const userHasRole = (roleCode: string): boolean => {
    return currentUserRoles.some((role: any) => role.role_code === roleCode);
  };

  const determineEmployeeAuthorizationStatus = async (
    submissionData: any, 
    evidenceData: KPIEvidence[]
  ) => {
    if (!submissionData || !currentEmployeeId || !submissionData.employee_id) {
      return;
    }

    try {
      // Use actual evidence data passed as parameter
      const hasEvidence = evidenceData && evidenceData.length > 0;
      
      // Get the employee associated with this submission
      const employee = await safelyFetchData(
        () => employeeService.getEmployeeById(submissionData.employee_id),
        null,
        `Error fetching employee data for ID: ${submissionData.employee_id}`
      );

      if (!employee) return;
      setEmployeeData(employee);

      // Determine if current user is the employee (owner)
      const isOwner = currentEmployeeId === employee.employee_id;

      if (isOwner) {
        setAuthStatus({
          isOwner: true,
          isSupervisor: false,
          isOrgHead: false,
          isOrgUnitManager: false,
          canEdit: false, // Owners typically don't edit their own actuals
          canSubmit: false, // Owners typically don't submit their own actuals
          canSubmitEvidence: submissionData.submission_status === 'Draft',
          canApprove: false,
          canReject: false,
          canValidate: false,
          canView: true, // Owners can always view
          canRevertToDraft: false
        });
        return;
      }

      // Check if user is supervisor
      const isSupervisor = employee.employee_supervisor_id === currentEmployeeId;

      if (isSupervisor) {
        // If user is supervisor, set appropriate permissions based on submission status
        console.log("masuk supervisor");
        
        setSupervisorData({
          employee_id: currentEmployeeId
        });

        setAuthStatus({
          isOwner: false,
          isSupervisor: true,
          isOrgHead: false,
          isOrgUnitManager: false,
          canEdit: submissionData.submission_status === 'Draft',
          canSubmit: submissionData.submission_status === 'Draft' && hasEvidence,
          canSubmitEvidence: false, // Supervisors don't submit evidence
          canApprove: false, // Supervisors typically don't approve
          canReject: false, // Supervisors typically don't reject
          canValidate: false,
          canView: true, // Supervisors can always view
          canRevertToDraft: submissionData.submission_status === 'Rejected' || submissionData.submission_status === 'Admin_Rejected'
        });
        return;
      }

      // If user is neither owner nor supervisor, check if they're an org head
      // Only fetch additional data if user has appropriate roles
      if (userHasRole('director') || userHasRole('division_head') || userHasRole('department_head')) {
        // Get the supervisor first to navigate up the hierarchy
        let supervisor: any | null = null;
  
        if (employee.employee_supervisor_id) {
          supervisor = await safelyFetchData(
            () => employeeService.getEmployeeById(employee.employee_supervisor_id!),
            null,
            `Error fetching supervisor data for ID: ${employee.employee_supervisor_id}`
          );

          if (supervisor) {
            setSupervisorData(supervisor);

            // Only proceed with org unit checks if necessary
            if (supervisor.employee_org_unit_id) {
              const supervisorOrgUnit = await safelyFetchData(
                () => organizationUnitService.getOrganizationUnitById(supervisor?.employee_org_unit_id!),
                null,
                `Error fetching supervisor org unit for ID: ${supervisor.employee_org_unit_id}`
              );

              if (supervisorOrgUnit && supervisorOrgUnit.org_unit_parent_id) {
                const parentOrgUnit = await safelyFetchData(
                  () => organizationUnitService.getOrganizationUnitById(supervisorOrgUnit?.org_unit_parent_id!),
                  null,
                  `Error fetching parent org unit for ID: ${supervisorOrgUnit?.org_unit_parent_id}`
                );

                if (parentOrgUnit && parentOrgUnit.org_unit_head_id) {
                  const orgHead = await safelyFetchData(
                    () => employeeService.getEmployeeById(parentOrgUnit?.org_unit_head_id!),
                    null,
                    `Error fetching org head for ID: ${parentOrgUnit?.org_unit_head_id}`
                  );

                  if (orgHead) {
                    setOrgHeadData(orgHead);

                    // Check if current user is the org head
                    const isOrgHead = orgHead.employee_id === currentEmployeeId;

                    if (isOrgHead) {
                      setAuthStatus({
                        isOwner: false,
                        isSupervisor: false,
                        isOrgHead: true,
                        isOrgUnitManager: false,
                        canEdit: false,
                        canSubmit: false,
                        canSubmitEvidence: false,
                        canApprove: submissionData.submission_status === 'Submitted',
                        canReject: submissionData.submission_status === 'Submitted',
                        canValidate: false,
                        canView: true,
                        canRevertToDraft: false
                      });
                      return;
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Check for special roles
      const isDirector = userHasRole('director');
      const isAdmin = userHasRole('admin');

      if (isDirector || isAdmin) {
        setAuthStatus({
          isOwner: false,
          isSupervisor: false,
          isOrgHead: false,
          isOrgUnitManager: false,
          canEdit: isDirector && hasEvidence,
          canSubmit: isDirector && hasEvidence,
          canSubmitEvidence: isDirector && submissionData.submission_status === 'Draft',
          canApprove: isDirector,
          canReject: isDirector,
          canValidate: isAdmin,
          canView: true,
          canRevertToDraft: isDirector
        });
        return;
      }

      // Default case - user has no special roles for this submission
      setAuthStatus({
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

    } catch (err) {
      console.error("Error determining employee authorization status:", err);
    }
  };

  const determineOrgUnitAuthorizationStatus = async (
    submissionData: any,
    evidenceData: KPIEvidence[]
  ) => {
    if (!submissionData || !currentEmployeeId || !submissionData.org_unit_id) {
      return;
    }

    try {
      // Use actual evidence data passed as parameter
      const hasEvidence = evidenceData && evidenceData.length > 0;
      console.log("Evidence check in org unit auth:", evidenceData, "Has evidence:", hasEvidence);
      
      // Get the org unit associated with this submission
      const orgUnit = await safelyFetchData(
        () => organizationUnitService.getOrganizationUnitById(submissionData.org_unit_id),
        null,
        `Error fetching org unit for ID: ${submissionData.org_unit_id}`
      );

      // Check for special roles
      const isDirector = userHasRole('director');
      const isAdmin = userHasRole('admin');

      if (!orgUnit) return;

      setOrgUnitData(orgUnit);

      // Check if user is the org unit manager
      const isOrgUnitManager = orgUnit.org_unit_head_id === currentEmployeeId;

      if (isOrgUnitManager) {
        console.log("masuk org unit manager", hasEvidence);
        setAuthStatus({
          isOwner: true,
          isSupervisor: false,
          isOrgHead: true,
          isOrgUnitManager: true,
          canEdit: submissionData.submission_status === 'Draft',
          canSubmit: submissionData.submission_status === 'Draft' && hasEvidence,
          canSubmitEvidence: submissionData.submission_status === 'Draft',
          canApprove: false,
          canReject: false,
          canValidate: isAdmin,
          canView: true,
          canRevertToDraft: submissionData.submission_status === 'Rejected' || submissionData.submission_status === 'Admin_Rejected'
        });
        return;
      }

      // Only check for org head if user might be one (based on roles)
      if (userHasRole('admin') || !isOrgUnitManager) {
        // Get the parent organization unit (to find the org head)
        if (orgUnit.org_unit_parent_id) {
          const parentOrgUnit = await safelyFetchData(
            () => organizationUnitService.getOrganizationUnitById(orgUnit?.org_unit_parent_id!),
            null,
            `Error fetching parent org unit for ID: ${orgUnit?.org_unit_parent_id}`
          );

          if (parentOrgUnit && parentOrgUnit.org_unit_head_id) {
            const orgHead = await safelyFetchData(
              () => employeeService.getEmployeeById(parentOrgUnit?.org_unit_head_id!),
              null,
              `Error fetching org head for ID: ${parentOrgUnit?.org_unit_head_id}`
            );

            if (orgHead) {
              console.log("masuk sini", orgHead);
              
              setOrgHeadData(orgHead);

              // Check if user is the org head
              const isOrgHead = orgHead.employee_id === currentEmployeeId;

              if (isOrgHead) {
                setAuthStatus({
                  isOwner: false,
                  isSupervisor: false,
                  isOrgHead: true,
                  isOrgUnitManager: false,
                  canEdit: false,
                  canSubmit: false,
                  canSubmitEvidence: false,
                  canApprove: submissionData.submission_status === 'Submitted',
                  canReject: submissionData.submission_status === 'Submitted',
                  canValidate: isAdmin,
                  canView: isAdmin || true,
                  canRevertToDraft: false
                });
                return;
              }
            }
          }
        }
      }

      if (isDirector || isAdmin) {
        console.log("masuk sini 2");
        setAuthStatus({
          isOwner: false,
          isSupervisor: false,
          isOrgHead: false,
          isOrgUnitManager: false,
          canEdit: isDirector && hasEvidence && submissionData.submission_status === 'Draft',
          canSubmit: isDirector && hasEvidence && submissionData.submission_status === 'Draft',
          canSubmitEvidence: isDirector && submissionData.submission_status === 'Draft',
          canApprove: isDirector && submissionData.submission_status === 'Submitted',
          canReject: isDirector && submissionData.submission_status === 'Submitted',
          canValidate: isAdmin,
          canView: true,
          canRevertToDraft: isDirector && submissionData.submission_status === 'Rejected' || submissionData.submission_status === 'Admin_Rejected'
        });
        return;
      }

      // Default case - user has no special roles for this submission
      setAuthStatus({
        isOwner: false,
        isSupervisor: false,
        isOrgHead: false,
        isOrgUnitManager: false,
        canEdit: false,
        canSubmit: false,
        canSubmitEvidence: false,
        canApprove: false,
        canReject: false,
        canValidate: isAdmin,
        canView: false,
        canRevertToDraft: false
      });

    } catch (err) {
      console.error("Error determining org unit authorization status:", err);
    }
  };

  const fetchData = async () => {
    if (!submissionId || !month) {
      setError("Submission ID or month not provided");
      setLoading(false);
      return;
    }

    console.log("masuk fetch data");
    
    setLoading(true);
    setError(null);

    try {
      // First, fetch all necessary data before processing
      // This avoids state update timing issues
      
      // Fetch submission data
      const submissionDataResult = await submissionService.getSubmission(parseInt(submissionId));
      
      // Fetch evidence data - store in local variable first
      let evidenceData: KPIEvidence[] = [];
      try {
        evidenceData = await evidenceService.getEvidencesBySubmission(parseInt(submissionId));
        console.log("evidenceData di fetch", evidenceData);
      } catch (err) {
        console.error(`Error fetching evidence for submission ${submissionId}:`, err);
        evidenceData = []; // Ensure it's an empty array on error
      }
      
      // Fetch submission entries
      const entries = await submissionService.getSubmissionEntries(parseInt(submissionId));

      // For each entry, fetch KPI definition and actual data for the corresponding month
      const entriesWithData = await Promise.all(
        entries.map(async (entry) => {
          let kpiDefinition = {};
          let actuals = [];

          try {
            // Fetch KPI definition
            kpiDefinition = await kpiDefinitionService.getKPIDefinition(entry.kpi_id);
          } catch (err) {
            console.error(`Error fetching KPI definition for entry ${entry.entry_id}:`, err);
            // Use empty object if KPI definition fetch fails
            kpiDefinition = {};
          }

          try {
            // Fetch actuals for this KPI and month
            const actualsData = await kpiActualService.getActualsByKpiAndMonth(entry.kpi_id, parseInt(month));
            console.log("actualsData", actualsData);
            
            // Map actuals to our expected format
            actuals = actualsData.map(actual => ({
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
            console.log("actuals", actuals);
          } catch (err) {
            console.error(`Error fetching actuals for entry ${entry.entry_id}:`, err);
            // Create a default empty actual object if actuals fetch fails
            actuals = [{
              actual_id: 0,
              entry_id: entry.entry_id,
              actual_value: 0,
              actual_month: parseInt(month),
              target_value: 0,
              achievement: 0,
              score: 0,
              problem_identification: '',
              corrective_action: ''
            }];
          }

          return {
            ...entry,
            kpiDefinition,
            actual_month: parseInt(month),
            month_name: getMonthName(parseInt(month)),
            actuals: actuals
          };
        })
      );

      // Update all states with fetched data
      setSubmissionStatus(submissionDataResult.submission_status);
      setSubmissionData(submissionDataResult as SubmissionWithEntries);
      setSubmissionEvidence(evidenceData);
      setEntriesWithActuals(entriesWithData as KPIEntryWithActuals[]);

      // Determine authorization status based on submission type using local variables
      // Pass evidenceData directly to avoid state timing issues
      if (submissionDataResult.employee_id) {
        // This is an employee-level submission
        console.log("Employee-level submission");
        await determineEmployeeAuthorizationStatus(submissionDataResult, evidenceData);
      } else if (submissionDataResult.org_unit_id) {
        // This is an organization-level submission
        console.log("Organization-level submission");
        await determineOrgUnitAuthorizationStatus(submissionDataResult, evidenceData);
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || "Failed to load MPM actuals data");
    } finally {
      setLoading(false);
    }
  };

  // Set default permissions based on user roles
  useEffect(() => {
    // Check for director or admin role that might have default permissions
    const isDirector = userHasRole('director');
    const isAdmin = userHasRole('admin');

    if (isDirector || isAdmin) {
      setAuthStatus(prevState => ({
        ...prevState,
        canView: true,
        // Directors typically can view everything but might need additional checks for edit/submit/approve
      }));
    }
  }, [currentUserRoles]);

  useEffect(() => {
    fetchData();
  }, [submissionId, month, currentEmployeeId, currentUserOrgUnitId]);

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
    orgUnitData,
    submissionEvidence
  };
};