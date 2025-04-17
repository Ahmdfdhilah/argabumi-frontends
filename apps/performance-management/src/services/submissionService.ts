import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface SubmissionBase {
  submission_type: string;  // "Target" or "Actual"
  org_unit_id?: number;
  employee_id?: number;
  period_id: number;
  submission_month?: number;  // 1-12 representing Jan-Dec
  submission_comments?: string;
}

export interface Submission extends SubmissionBase {
  submission_id: number;
  submission_status: string;
  final_approver_id?: number;
  finalized_at?: string;
  org_unit_name?: string;
  employee_name?: string;
  period_name?: string;
  final_approver_name?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface SubmissionEntry {
  entry_id: number;
  submission_id: number;
  kpi_id: number;
  entry_status: string;
  entry_comments?: string;
  kpi_code?: string;
  kpi_name?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface SubmissionWithEntries extends Submission {
  entries: SubmissionEntry[];
}

export interface SubmissionCreate extends SubmissionBase {}

export interface SubmissionUpdate {
  submission_comments?: string;
}

export interface SubmissionStatusUpdate {
  submission_status: string;
  submission_comments?: string;
}

export interface SubmissionEntryCreate {
  submission_id: number;
  kpi_id: number;
  entry_comments?: string;
}

export interface SubmissionEntryUpdate {
  entry_comments?: string;
}

export interface SubmissionEntryStatusUpdate {
  entry_status: string;
  entry_comments?: string;
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const submissionService = {
  // Get submissions with filters
  getSubmissions: async (params?: {
    skip?: number;
    limit?: number;
    submission_type?: string;
    period_id?: number;
    org_unit_id?: number;
    employee_id?: number;
    month?: number;
    status?: string;
  }): Promise<Submission[]> => {
    try {
      const response = await pmApi.get("/submissions/", { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch submissions",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new submission
  createSubmission: async (submissionData: SubmissionCreate): Promise<Submission> => {
    try {
      const response = await pmApi.post("/submissions/", submissionData);
      toast({
        title: "Success",
        description: "Submission created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create submission",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get submission by ID
  getSubmission: async (id: number): Promise<Submission> => {
    try {
      const response = await pmApi.get(`/submissions/${id}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch submission",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get submission with entries
  getSubmissionWithEntries: async (id: number): Promise<SubmissionWithEntries> => {
    try {
      const response = await pmApi.get(`/submissions/${id}/entries`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch submission with entries",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update submission
  updateSubmission: async (id: number, submissionData: SubmissionUpdate): Promise<Submission> => {
    try {
      const response = await pmApi.put(`/submissions/${id}`, submissionData);
      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update submission",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update submission status
  updateSubmissionStatus: async (id: number, statusData: SubmissionStatusUpdate): Promise<Submission> => {
    try {
      const response = await pmApi.patch(`/submissions/${id}/status`, statusData);
      toast({
        title: "Success",
        description: `Submission ${statusData.submission_status.toLowerCase()} successfully`,
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update submission status",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete submission
  deleteSubmission: async (id: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/submissions/${id}`);
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete submission",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get submission entries
  getSubmissionEntries: async (submissionId: number): Promise<SubmissionEntry[]> => {
    try {
      const response = await pmApi.get(`/submissions/entries/${submissionId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch submission entries",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create submission entry
  createSubmissionEntry: async (entryData: SubmissionEntryCreate): Promise<SubmissionEntry> => {
    try {
      const response = await pmApi.post("/submissions/entries", entryData);
      toast({
        title: "Success",
        description: "Entry created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create entry",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get submission entry by ID
  getSubmissionEntry: async (entryId: number): Promise<SubmissionEntry> => {
    try {
      const response = await pmApi.get(`/submissions/entries/${entryId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch entry",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update submission entry
  updateSubmissionEntry: async (entryId: number, entryData: SubmissionEntryUpdate): Promise<SubmissionEntry> => {
    try {
      const response = await pmApi.put(`/submissions/entries/${entryId}`, entryData);
      toast({
        title: "Success",
        description: "Entry updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update entry",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update submission entry status
  updateSubmissionEntryStatus: async (entryId: number, statusData: SubmissionEntryStatusUpdate): Promise<SubmissionEntry> => {
    try {
      const response = await pmApi.patch(`/submissions/entries/${entryId}/status`, statusData);
      toast({
        title: "Success",
        description: `Entry ${statusData.entry_status.toLowerCase()} successfully`,
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update entry status",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete submission entry
  deleteSubmissionEntry: async (entryId: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/submissions/entries/${entryId}`);
      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete entry",
        variant: "destructive",
      });
      throw error;
    }
  }
};