// src/services/kpiTargetService.ts
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

// KPI Target related types
export interface KPITargetBase {
  entry_id: number;
  kpi_id: number;
  target_month: number; // 1-12 representing Jan-Dec
  target_value: Decimal | string | number;
  target_notes?: string | null;
}

export interface KPITargetResponse extends KPITargetBase, BaseEntityResponse {
  target_id: number;
  target_status: string;
  kpi_name?: string;
  month_name?: string; // "January", "February", etc.
}

export interface KPITargetCreate extends KPITargetBase {}

export interface KPITargetUpdate {
  target_value?: Decimal | string | number;
  target_notes?: string | null;
}

export interface KPITargetStatusUpdate {
  target_status: string;
  target_notes?: string | null;
}

export interface KPITargetBulkItem {
  target_id: number;
  target_value: Decimal | string | number;
  target_notes?: string | null;
}

export interface KPITargetBulkUpdate {
  targets: KPITargetBulkItem[];
}

export interface KPIMonthlyTargetsResponse {
  kpi_id: number;
  kpi_name: string;
  kpi_code: string;
  total_target: Decimal | string | number;
  monthly_targets: KPITargetResponse[];
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const kpiTargetService = {
  // Get all targets for a submission entry
  getTargetsByEntry: async (entryId: number, submissionId: number): Promise<KPITargetResponse[]> => {
    try {
      const response = await pmApi.get(`/kpi-targets/entry/${entryId}?submission_id=${submissionId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch targets by entry",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get targets for a KPI in a specific month
  getTargetsByKpiAndMonth: async (
    kpiId: number,
    month: number
  ): Promise<KPITargetResponse[]> => {
    try {
      const response = await pmApi.get(`/kpi-targets/kpi/${kpiId}/month/${month}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch targets by KPI and month",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI target by ID
  getTarget: async (targetId: number): Promise<KPITargetResponse> => {
    try {
      const response = await pmApi.get(`/kpi-targets/${targetId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch target",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get all monthly targets for a KPI
  getMonthlyTargets: async (kpiId: number): Promise<KPIMonthlyTargetsResponse> => {
    try {
      const response = await pmApi.get(`/kpi-targets/kpi/${kpiId}/monthly`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch monthly targets",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new KPI target
  createTarget: async (targetData: KPITargetCreate): Promise<KPITargetResponse> => {
    try {
      const response = await pmApi.post("/kpi-targets/", targetData);
      toast({
        title: "Success",
        description: "KPI target created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create target",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Auto-create monthly targets for a KPI based on annual target
  autoCreateMonthlyTargets: async (
    entryId: number,
    kpiId: number
  ): Promise<KPITargetResponse[]> => {
    try {
      const response = await pmApi.post("/kpi-targets/auto-create", null, {
        params: { entry_id: entryId, kpi_id: kpiId },
      });
      toast({
        title: "Success",
        description: "Monthly targets created automatically",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to auto-create targets",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update a KPI target
  updateTarget: async (
    targetId: number,
    targetData: KPITargetUpdate
  ): Promise<KPITargetResponse> => {
    try {
      const response = await pmApi.put(`/kpi-targets/${targetId}`, targetData);
      toast({
        title: "Success",
        description: "KPI target updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update target",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update a KPI target's status
  updateTargetStatus: async (
    targetId: number,
    statusData: KPITargetStatusUpdate
  ): Promise<KPITargetResponse> => {
    try {
      const response = await pmApi.patch(`/kpi-targets/${targetId}/status`, statusData);
      toast({
        title: "Success",
        description: "KPI target status updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update target status",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Bulk update multiple KPI targets
  bulkUpdateTargets: async (
    bulkData: KPITargetBulkUpdate
  ): Promise<KPITargetResponse[]> => {
    try {
      const response = await pmApi.post("/kpi-targets/bulk-update", bulkData);
      toast({
        title: "Success",
        description: "KPI targets updated in bulk successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to bulk update targets",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete a KPI target
  deleteTarget: async (targetId: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/kpi-targets/${targetId}`);
      toast({
        title: "Success",
        description: "KPI target deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete target",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default kpiTargetService;