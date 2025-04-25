import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { submissionService, SubmissionWithEntries, SubmissionEntry } from '../services/submissionService';
import { kpiDefinitionService, KPIDefinitionResponse } from '../services/kpiDefinitionService';
import { kpiTargetService, KPITargetResponse } from '../services/kpiTargetsService';
import { Employee, employeeService } from '../services/employeeService';
import { useAppSelector } from '@/redux/hooks';
import organizationUnitService from '@/services/organizationUnitService';

interface KPIEntryWithTargets extends SubmissionEntry {
  kpiDefinition?: KPIDefinitionResponse;
  targets: KPITargetResponse[];
}

interface AuthorizationStatus {
  isOwner: boolean;          // Whether current user is the employee who owns this submission
  isSupervisor: boolean;     // Whether current user is the supervisor who can edit/submit
  isOrgHead: boolean;        // Whether current user is the org head who can approve
  isOrgUnitManager: boolean; // Whether current user is manager of the org unit
  canEdit: boolean;          // Whether current user can edit targets
  canSubmit: boolean;        // Whether current user can submit targets
  canApprove: boolean;       // Whether current user can approve targets
  canReject: boolean;        // Whether current user can reject targets
  canRevertToDraft: boolean; // Whether current user can revert to draft
  canValidate: boolean;      // Whether current user can validate targets
  canView: boolean;          // Whether current user can view targets
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
  orgHeadData: any | null;
  orgUnitData: any | null;
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

export const useTargets = (): UseTargetsReturn => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionWithEntries | null>(null);
  const [entriesWithTargets, setEntriesWithTargets] = useState<KPIEntryWithTargets[]>([]);

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

  const determineEmployeeAuthorizationStatus = async (submissionData: any) => {
    if (!submissionData || !currentEmployeeId || !submissionData.employee_id) {
      return;
    }

    try {
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

      // If user is the owner, we don't need to check supervisor/org head status
      if (isOwner) {
        setAuthStatus({
          isOwner: true,
          isSupervisor: false,
          isOrgHead: false,
          isOrgUnitManager: false,
          canEdit: false, // Owners typically don't edit their own targets
          canSubmit: false, // Owners typically don't submit their own targets
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
        setSupervisorData({
          employee_id: currentEmployeeId
        });

        setAuthStatus({
          isOwner: false,
          isSupervisor: true,
          isOrgHead: false,
          isOrgUnitManager: false,
          canEdit: submissionData.submission_status === 'Draft',
          canSubmit: submissionData.submission_status === 'Draft',
          canApprove: false, // Supervisors typically don't approve
          canReject: false, // Supervisors typically don't reject
          canValidate: false,
          canView: true, // Supervisors can always view
          canRevertToDraft: submissionData.submission_status === 'Rejected'
        });
        return;
      }

      // If user is neither owner nor supervisor, check if they're an org head
      // Only fetch additional data if user has appropriate roles
      if (userHasRole('director') || userHasRole('org_head')) {
        // Get the supervisor first to navigate up the hierarchy
        let supervisor: Employee | null = null;

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
      console.log(user);

      console.log(isAdmin);

      if (isDirector || isAdmin) {
        setAuthStatus({
          isOwner: false,
          isSupervisor: false,
          isOrgHead: false,
          isOrgUnitManager: false,
          canEdit: isDirector,
          canSubmit: isDirector,
          canApprove: isDirector,
          canReject: isDirector,
          canValidate: isAdmin,
          canView: true,
          canRevertToDraft: false
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

  const determineOrgUnitAuthorizationStatus = async (submissionData: any) => {
    if (!submissionData || !currentEmployeeId || !submissionData.org_unit_id) {
      return;
    }

    try {
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
        setAuthStatus({
          isOwner: false,
          isSupervisor: false,
          isOrgHead: false,
          isOrgUnitManager: true,
          canEdit: submissionData.submission_status === 'Draft',
          canSubmit: submissionData.submission_status === 'Draft',
          canApprove: false,
          canReject: false,
          canValidate: false,
          canView: true,
          canRevertToDraft: submissionData.submission_status === 'Rejected'
        });
        return;
      }
      console.log(user);

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
                  canApprove: submissionData.submission_status === 'Submitted',
                  canReject: submissionData.submission_status === 'Submitted',
                  canValidate: isAdmin,
                  canView: isAdmin,
                  canRevertToDraft: false
                });
                return;
              }
            }
          }
        }
      }



      if (isDirector || isAdmin) {
        setAuthStatus({
          isOwner: false,
          isSupervisor: false,
          isOrgHead: false,
          isOrgUnitManager: false,
          canEdit: isDirector,
          canSubmit: isDirector,
          canApprove: isDirector,
          canReject: isDirector,
          canValidate: isAdmin,
          canView: true,
          canRevertToDraft: false
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
        canApprove: false,
        canReject: false,
        canValidate: false,
        canView: false,
        canRevertToDraft: false
      });

    } catch (err) {
      console.error("Error determining org unit authorization status:", err);
    }
  };

  const fetchData = async () => {
    if (!submissionId) {
      setError("Submission ID not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get submission details and entries
      const submissionData = await safelyFetchData(
        () => submissionService.getSubmission(parseInt(submissionId)),
        null,
        `Error fetching submission data for ID: ${submissionId}`
      );

      if (!submissionData) {
        throw new Error(`Failed to load submission with ID: ${submissionId}`);
      }
      console.log(submissionData);

      const submissionEntries = await safelyFetchData(
        () => submissionService.getSubmissionEntries(parseInt(submissionId)),
        [],
        `Error fetching submission entries for ID: ${submissionId}`
      );

      const submissionWithEntries = {
        ...submissionData,
        entries: submissionEntries
      };

      setSubmission(submissionWithEntries);

      // Determine authorization status based on submission type
      if (submissionData.employee_id) {
        // This is an employee-level submission
        await determineEmployeeAuthorizationStatus(submissionData);
      } else if (submissionData.org_unit_id) {
        // This is an organization-level submission
        await determineOrgUnitAuthorizationStatus(submissionData);
      }

      // For each entry, get KPI definition and targets
      const entriesWithData = await Promise.all(
        submissionEntries.map(async (entry) => {
          // Fetch KPI definition
          const kpiDefinition = await safelyFetchData(
            () => kpiDefinitionService.getKPIDefinition(entry.kpi_id),
            undefined,
            `Error fetching KPI definition for ID: ${entry.kpi_id}`
          );

          // Fetch targets for this entry
          const targets = await safelyFetchData(
            () => kpiTargetService.getTargetsByEntry(entry.entry_id, parseInt(submissionId)),
            [],
            `Error fetching targets for entry ID: ${entry.entry_id}`
          );

          return {
            ...entry,
            kpiDefinition,
            targets
          };
        })
      );

      setEntriesWithTargets(entriesWithData);
    } catch (err: any) {
      setError(err.message || "Failed to load MPM targets data");
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
  }, [submissionId, currentEmployeeId, currentUserOrgUnitId]);

  return {
    loading,
    error,
    submission,
    entriesWithTargets,
    refreshData: fetchData,
    authStatus,
    employeeData,
    supervisorData,
    orgHeadData,
    orgUnitData
  };
};