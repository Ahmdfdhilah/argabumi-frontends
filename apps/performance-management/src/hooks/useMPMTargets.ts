// src/hooks/useMPMTargets.ts
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { submissionService, SubmissionWithEntries, SubmissionEntry } from '../services/submissionService';
import { kpiDefinitionService, KPIDefinitionResponse } from '../services/kpiDefinitionService';
import { kpiTargetService, KPITargetResponse } from '../services/kpiTargetsService';

interface KPIEntryWithTargets extends SubmissionEntry {
  kpiDefinition?: KPIDefinitionResponse;
  targets: KPITargetResponse[];
}

interface UseMPMTargetsReturn {
  loading: boolean;
  error: string | null;
  submission: SubmissionWithEntries | null;
  entriesWithTargets: KPIEntryWithTargets[];
  refreshData: () => Promise<void>;
}

export const useMPMTargets = (): UseMPMTargetsReturn => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionWithEntries | null>(null);
  const [entriesWithTargets, setEntriesWithTargets] = useState<KPIEntryWithTargets[]>([]);

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

      setSubmission({
        ...submissionData,
        entries: submissionEntries
      });
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
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load MPM targets data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [submissionId]);

  return {
    loading,
    error,
    submission,
    entriesWithTargets,
    refreshData: fetchData
  };
};