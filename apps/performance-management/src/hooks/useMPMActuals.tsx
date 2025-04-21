// src/hooks/useMPMActuals.ts
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { submissionService, SubmissionEntry } from '../services/submissionService';
import { kpiDefinitionService, KPIDefinitionResponse } from '../services/kpiDefinitionService';
import kpiActualService from '../services/kpiActualsService';
import { getMonthName } from '../utils/month';

// Types
export interface KPIEntryWithActuals extends SubmissionEntry {
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

interface UseMPMActualsReturn {
  loading: boolean;
  error: string | null;
  entriesWithActuals: KPIEntryWithActuals[];
  submissionStatus: string;
  refreshData: () => Promise<void>;
}

export const useMPMActuals = (): UseMPMActualsReturn => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [entriesWithActuals, setEntriesWithActuals] = useState<KPIEntryWithActuals[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');

  const fetchData = async () => {
    if (!submissionId || !month) {
      setError("Submission ID or month not provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, fetch submission data to get status
      const submissionData = await submissionService.getSubmission(parseInt(submissionId));
      setSubmissionStatus(submissionData.submission_status);

      // Next, fetch submission entries to get all KPI IDs
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
            console.log(actualsData);
            
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
              corrective_action: actual.actual_corrective_action || '',
            }));
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
              corrective_action: '',
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
      // Return all entries, even if they don't have actuals
      setEntriesWithActuals(entriesWithData as KPIEntryWithActuals[]);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || "Failed to load MPM actuals data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [submissionId, month]);

  return {
    loading,
    error,
    entriesWithActuals,
    submissionStatus,
    refreshData: fetchData
  };
};