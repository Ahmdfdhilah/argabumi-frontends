// src/services/kpiActualService.ts
import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";
import { Decimal } from "decimal.js";

// Common types
export interface BaseEntityResponse {
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

// KPI Actual related types
export interface KPIActualBase {
  entry_id: number;
  kpi_id: number;
  actual_month: number; // 1-12 representing Jan-Dec
  actual_value: Decimal | string | number;
  actual_problem_identification?: string | null;
  actual_corrective_action?: string | null;
}

export interface KPIActualResponse extends KPIActualBase, BaseEntityResponse {
  actual_id: number;
  actual_status: string;
  actual_ytd_value?: Decimal | string | number | null;
  actual_achievement_percentage?: Decimal | string | number | null;
  kpi_name?: string | null;
  month_name?: string | null; // "January", "February", etc.
  target_value?: Decimal | string | number | null;
}

export interface KPIActualWithEvidenceResponse extends KPIActualResponse {
  evidence_count: number;
}

export interface KPIActualCreate extends KPIActualBase {}

export interface KPIActualUpdate {
  actual_value?: Decimal | string | number;
  actual_problem_identification?: string | null;
  actual_corrective_action?: string | null;
}

export interface KPIActualStatusUpdate {
  actual_status: string;
}

export interface KPIMonthlyActualsResponse {
  kpi_id: number;
  kpi_name: string;
  kpi_code: string;
  ytd_actual: Decimal | string | number;
  ytd_target: Decimal | string | number;
  ytd_achievement: Decimal | string | number;
  monthly_actuals: KPIActualResponse[];
}

export interface KPIProblemUpdateRequest {
  actual_id: number;
  actual_problem_identification: string;
  actual_corrective_action: string;
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const kpiActualService = {
  // Get all actuals for a submission entry
  getActualsByEntry: async (entryId: number): Promise<KPIActualResponse[]> => {
    try {
      const response = await pmApi.get(`/kpi-actuals/entry/${entryId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch actuals by entry",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get actuals for a KPI in a specific month
  getActualsByKpiAndMonth: async (
    kpiId: number,
    month: number
  ): Promise<KPIActualResponse[]> => {
    try {
      const response = await pmApi.get(`/kpi-actuals/kpi/${kpiId}/month/${month}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch actuals by KPI and month",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI actual by ID
  getActual: async (actualId: number): Promise<KPIActualResponse> => {
    try {
      const response = await pmApi.get(`/kpi-actuals/${actualId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch actual",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI actual with evidence count
  getActualWithEvidence: async (actualId: number): Promise<KPIActualWithEvidenceResponse> => {
    try {
      const response = await pmApi.get(`/kpi-actuals/${actualId}/evidence`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch actual with evidence",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get all monthly actuals for a KPI
  getMonthlyActuals: async (kpiId: number): Promise<KPIMonthlyActualsResponse> => {
    try {
      const response = await pmApi.get(`/kpi-actuals/kpi/${kpiId}/monthly`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch monthly actuals",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new KPI actual
  createActual: async (actualData: KPIActualCreate): Promise<KPIActualResponse> => {
    try {
      const response = await pmApi.post("/kpi-actuals/", actualData);
      toast({
        title: "Success",
        description: "KPI actual created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create actual",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update a KPI actual
  updateActual: async (
    actualId: number,
    actualData: KPIActualUpdate
  ): Promise<KPIActualResponse> => {
    try {
      const response = await pmApi.put(`/kpi-actuals/${actualId}`, actualData);
      toast({
        title: "Success",
        description: "KPI actual updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update actual",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update a KPI actual's status
  updateActualStatus: async (
    actualId: number,
    statusData: KPIActualStatusUpdate
  ): Promise<KPIActualResponse> => {
    try {
      const response = await pmApi.patch(`/kpi-actuals/${actualId}/status`, statusData);
      toast({
        title: "Success",
        description: "KPI actual status updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update actual status",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update problem identification and corrective action for an actual
  updateProblemInfo: async (
    problemData: KPIProblemUpdateRequest
  ): Promise<KPIActualResponse> => {
    try {
      const response = await pmApi.patch("/kpi-actuals/problem", problemData);
      toast({
        title: "Success",
        description: "Problem information updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update problem info",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete a KPI actual
  deleteActual: async (actualId: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/kpi-actuals/${actualId}`);
      toast({
        title: "Success",
        description: "KPI actual deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete actual",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default kpiActualService;