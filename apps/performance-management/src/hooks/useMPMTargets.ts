import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { submissionService, SubmissionWithEntries, SubmissionEntry } from '../services/submissionService';
import { kpiDefinitionService, KPIDefinitionResponse } from '../services/kpiDefinitionService';
import { kpiTargetService, KPITargetResponse } from '../services/kpiTargetsService';
import { employeeService } from '../services/employeeService';
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
  canView: boolean;          // Whether current user can view targets
}

interface UseMPMTargetsReturn {
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

export const useMPMTargets = (): UseMPMTargetsReturn => {
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
    canView: false
  });

  // Get current user from Redux store
  const { user } = useAppSelector((state: any) => state.auth);
  const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;
  const currentEmployeeId = user?.employee_data?.employee_id ?? null;

  const determineEmployeeAuthorizationStatus = async (submissionData: any) => {
    if (!submissionData || !currentEmployeeId || !submissionData.employee_id) {
      return;
    }

    try {
      // Get the employee associated with this submission
      const employee = await employeeService.getEmployeeById(submissionData.employee_id);
      setEmployeeData(employee);

      let supervisor = null;
      let orgHead = null;

      // Get the employee's supervisor
      if (employee.employee_supervisor_id) {
        supervisor = await employeeService.getEmployeeById(employee.employee_supervisor_id);
        console.log("supervisor", supervisor);
        
        setSupervisorData(supervisor);

        // Get the organization unit of the supervisor
        if (supervisor.employee_org_unit_id) {
          const supervisorOrgUnit = await organizationUnitService.getOrganizationUnitById(supervisor.employee_org_unit_id);
          console.log("supervisorOrgUnit", supervisorOrgUnit);

          // Get the parent organization unit (to find the org head)
          if (supervisorOrgUnit.org_unit_parent_id) {
            const parentOrgUnit = await organizationUnitService.getOrganizationUnitById(supervisorOrgUnit.org_unit_parent_id);
            console.log("parentOrgUnit", parentOrgUnit);

            const orgUnitHead = parentOrgUnit.org_unit_head_id;
            if (orgUnitHead) {
              orgHead = await employeeService.getEmployeeById(orgUnitHead);
              console.log("orgHead", orgHead);
              
              setOrgHeadData(orgHead);
            }
          }
        }
      }
      
      // Determine authorization status using local variables instead of state
      const isOwner = currentEmployeeId === employee.employee_id;
      const isSupervisor = employee.employee_supervisor_id === currentEmployeeId;
      const isOrgHead = orgHead?.employee_id === currentEmployeeId;
      
      console.log("isOrgHead", isOrgHead);
      console.log("orgHead", orgHead);
      console.log("currentEmployeeId", currentEmployeeId);

      // Business rules for permissions
      const canView = isOwner || isSupervisor || isOrgHead;
      const canEdit = (isSupervisor && submissionData.submission_status === 'Draft');
      const canSubmit = (isSupervisor && submissionData.submission_status === 'Draft');
      const canApprove = (isSupervisor && submissionData.submission_status === 'Submitted');
      const canReject = (isSupervisor && submissionData.submission_status === 'Submitted');

      setAuthStatus({
        isOwner,
        isSupervisor,
        isOrgHead: !!isOrgHead,
        isOrgUnitManager: false,
        canEdit,
        canSubmit,
        canApprove,
        canReject,
        canView
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
      const orgUnit = await organizationUnitService.getOrganizationUnitById(submissionData.org_unit_id);
      setOrgUnitData(orgUnit);

      // Get the parent organization unit (to find the org head)
      let orgHead = null;
    
      if (orgUnit.org_unit_parent_id) {
        const parentOrgUnit = await organizationUnitService.getOrganizationUnitById(orgUnit.org_unit_parent_id);
        console.log("parentOrgUnit", parentOrgUnit);
        
        if (parentOrgUnit.org_unit_head_id) {
          orgHead = await employeeService.getEmployeeById(parentOrgUnit.org_unit_head_id);
          console.log("orgHead", orgHead);
          
          setOrgHeadData(orgHead);
        }
      }

      // Determine authorization status using local variables instead of state
      const isOrgUnitManager = orgUnit.org_unit_head_id === currentEmployeeId;
      const isOrgHead = orgHead?.employee_id === currentEmployeeId;

      // Business rules for permissions
      const canView = isOrgUnitManager || isOrgHead;
      const canEdit = (isOrgUnitManager && submissionData.submission_status === 'Draft');
      const canSubmit = (isOrgUnitManager && submissionData.submission_status === 'Draft');
      const canApprove = (isOrgHead && submissionData.submission_status === 'Submitted');
      const canReject = (isOrgHead && submissionData.submission_status === 'Submitted');

      setAuthStatus({
        isOwner: false,
        isSupervisor: false,
        isOrgHead: !!isOrgHead,
        isOrgUnitManager: !!isOrgUnitManager,
        canEdit: !!canEdit,
        canSubmit: !!canSubmit,
        canApprove: !!canApprove,
        canReject: !!canReject,
        canView: !!canView
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
      const [submissionData, submissionEntries] = await Promise.all([
        submissionService.getSubmission(parseInt(submissionId)),
        submissionService.getSubmissionEntries(parseInt(submissionId))
      ]);

      const submissionWithEntries = {
        ...submissionData,
        entries: submissionEntries
      };

      console.log("submissionWithEntries", submissionWithEntries);
      
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
          try {
            // Fetch KPI definition
            const kpiDefinition = await kpiDefinitionService.getKPIDefinition(entry.kpi_id);

            // Fetch targets for this entry
            const targets = await kpiTargetService.getTargetsByEntry(entry.entry_id, parseInt(submissionId));

            return {
              ...entry,
              kpiDefinition,
              targets
            };
          } catch (err) {
            console.error(`Error fetching data for entry ${entry.entry_id}:`, err);
            return {
              ...entry,
              targets: []
            };
          }
        })
      );

      setEntriesWithTargets(entriesWithData);
    } catch (err: any) {
      setError(err.message || "Failed to load MPM targets data");
    } finally {
      setLoading(false);
    }
  };

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