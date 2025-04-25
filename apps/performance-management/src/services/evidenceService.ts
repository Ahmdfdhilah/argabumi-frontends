import { API_BASE_URL_PERFORMANCE_MANAGEMENT } from "@/config";
import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface KPIEvidenceBase {
  submission_id: number;
  evidence_description?: string;
}

export interface KPIEvidence extends KPIEvidenceBase {
  evidence_id: number;
  evidence_file_name: string;
  evidence_file_path: string;
  evidence_upload_date: string;
  evidence_status: string;
  
  // Additional context fields
  org_unit_name?: string;
  employee_name?: string;
  period_name?: string;
  submission_month?: number;
  month_name?: string;
  file_url?: string;
  
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface KPIEvidenceUpdate {
  evidence_description?: string;
}

export interface KPIEvidenceStatusUpdate {
  evidence_status: string;
  comments?: string;
}

export interface KPIEvidenceUploadResponse {
  evidence: KPIEvidence;
  file_url: string;
  content_type: string;
  file_size: number;
}

export interface KPIEvidenceListResponse {
  total_count: number;
  evidences: KPIEvidence[];
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const evidenceService = {
  // Get evidences by submission ID
  getEvidencesBySubmission: async (submissionId: number): Promise<KPIEvidence[]> => {
    try {
      const response = await pmApi.get(`/submissions/${submissionId}/evidence`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch evidences",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get all evidences with filtering
  getAllEvidences: async (
    periodId?: number,
    orgUnitId?: number,
    employeeId?: number,
    status?: string
  ): Promise<KPIEvidenceListResponse> => {
    try {
      let url = `/evidence`;
      const params = new URLSearchParams();
      
      if (periodId) params.append("period_id", periodId.toString());
      if (orgUnitId) params.append("org_unit_id", orgUnitId.toString());
      if (employeeId) params.append("employee_id", employeeId.toString());
      if (status) params.append("status", status);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await pmApi.get(url);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch evidences",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get evidence by ID
  getEvidence: async (evidenceId: number): Promise<KPIEvidence> => {
    try {
      const response = await pmApi.get(`/evidence/${evidenceId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch evidence",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Upload evidence
  uploadEvidence: async (
    submissionId: number,
    file: File,
    evidenceDescription?: string
  ): Promise<KPIEvidenceUploadResponse> => {
    try {
      const formData = new FormData();
      if (evidenceDescription) {
        formData.append("description", evidenceDescription);
      }
      formData.append("file", file);

      const response = await pmApi.post(`/submissions/${submissionId}/evidence`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      toast({
        title: "Success",
        description: "Evidence uploaded successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to upload evidence",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update evidence metadata
  updateEvidence: async (evidenceId: number, evidenceData: KPIEvidenceUpdate): Promise<KPIEvidence> => {
    try {
      const response = await pmApi.put(`/evidence/${evidenceId}`, evidenceData);
      toast({
        title: "Success",
        description: "Evidence updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update evidence",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update evidence status (for managers/supervisors)
  updateEvidenceStatus: async (evidenceId: number, statusData: KPIEvidenceStatusUpdate): Promise<KPIEvidence> => {
    try {
      const response = await pmApi.put(`/evidence/${evidenceId}/status`, statusData);
      toast({
        title: "Success",
        description: "Evidence status updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update evidence status",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete evidence
  deleteEvidence: async (evidenceId: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/evidence/${evidenceId}`);
      toast({
        title: "Success",
        description: "Evidence deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete evidence",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Download evidence file and auto-update status
  downloadEvidence: async (evidenceId: number): Promise<Blob> => {
    try {
      const response = await pmApi.get(`/evidence/${evidenceId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to download evidence",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Helper method to get evidence file URL
  getEvidenceFileUrl: (filePath: string): string => {
    return `${API_BASE_URL_PERFORMANCE_MANAGEMENT}/uploads/${filePath}`;
  }
};