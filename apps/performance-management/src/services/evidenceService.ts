import { API_BASE_URL_PERFORMANCE_MANAGEMENT } from "@/config";
import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface KPIEvidenceBase {
  kpi_id: number;
  actual_id: number;
  evidence_description?: string;
}

export interface KPIEvidence extends KPIEvidenceBase {
  evidence_id: number;
  evidence_file_name: string;
  evidence_file_path: string;
  evidence_upload_date: string;
  kpi_name?: string;
  actual_month?: number;
  month_name?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface KPIEvidenceUpdate {
  evidence_description?: string;
}

export interface KPIEvidenceUploadResponse {
  evidence: KPIEvidence;
  file_url: string;
  content_type: string;
  file_size: number;
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const evidenceService = {
  // Get evidences by actual ID
  getEvidencesByActual: async (actualId: number): Promise<KPIEvidence[]> => {
    try {
      const response = await pmApi.get(`/evidences/actual/${actualId}`);
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

  // Get evidences by KPI ID
  getEvidencesByKpi: async (kpiId: number): Promise<KPIEvidence[]> => {
    try {
      const response = await pmApi.get(`/evidences/kpi/${kpiId}`);
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
      const response = await pmApi.get(`/evidences/${evidenceId}`);
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
    kpiId: number,
    actualId: number,
    file: File,
    evidenceDescription?: string
  ): Promise<KPIEvidenceUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("kpi_id", kpiId.toString());
      formData.append("actual_id", actualId.toString());
      if (evidenceDescription) {
        formData.append("evidence_description", evidenceDescription);
      }
      formData.append("file", file);

      const response = await pmApi.post("/evidences/upload", formData, {
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
      const response = await pmApi.put(`/evidences/${evidenceId}`, evidenceData);
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

  // Delete evidence
  deleteEvidence: async (evidenceId: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/evidences/${evidenceId}`);
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

  // Helper method to get evidence file URL
  getEvidenceFileUrl: (filePath: string): string => {
    return `${API_BASE_URL_PERFORMANCE_MANAGEMENT}/uploads/${filePath}`;
  }
};