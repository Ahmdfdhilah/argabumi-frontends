import api from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface Period {
  period_id: number;
  period_name: string;
  period_year: number;
  period_start_date: string;
  period_end_date: string;
  period_description: string | null;
  period_status: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface PeriodCreate {
  period_name: string;
  period_year: number;
  period_start_date: string;
  period_end_date: string;
  period_description?: string;
}

export interface PeriodUpdate {
  period_name?: string;
  period_year?: number;
  period_start_date?: string;
  period_end_date?: string;
  period_description?: string;
}

export interface PeriodActivateUpdate {
  period_status: string;
}

export interface PeriodWithKPIs extends Period {
  total_kpis: number;
  bsc_kpis: number;
  mpm_kpis: number;
  ipm_kpis: number;
  action_plans: number;
}

export interface PeriodStats {
  period_id: number;
  period_name: string;
  period_year: number;
  period_status: string;
  total_kpis: number;
  on_track_kpis: number;
  at_risk_kpis: number;
  off_track_kpis: number;
  not_started_kpis: number;
  average_performance: number | null;
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const periodService = {
  // Get all periods with pagination and optional status filter
  getPeriods: async (
    skip: number = 0,
    limit: number = 100,
    status?: string
  ): Promise<Period[]> => {
    try {
      const params = { skip, limit, ...(status && { status }) };
      const response = await api.get("/periods/", { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch periods",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new period
  createPeriod: async (periodData: PeriodCreate): Promise<Period> => {
    try {
      const response = await api.post("/periods/", periodData);
      toast({
        title: "Success",
        description: "Period created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create period",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get the currently active period
  getActivePeriod: async (): Promise<Period> => {
    try {
      const response = await api.get("/periods/active");
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "No active period found",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get periods by year
  getPeriodsByYear: async (year: number): Promise<Period[]> => {
    try {
      const response = await api.get(`/periods/year/${year}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch periods for the year",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a period by ID
  getPeriodById: async (periodId: number): Promise<Period> => {
    try {
      const response = await api.get(`/periods/${periodId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch period",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a period by name
  getPeriodByName: async (name: string): Promise<Period> => {
    try {
      const response = await api.get(`/periods/name/${name}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch period",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update period information
  updatePeriod: async (
    periodId: number,
    periodData: PeriodUpdate
  ): Promise<Period> => {
    try {
      const response = await api.put(`/periods/${periodId}`, periodData);
      toast({
        title: "Success",
        description: "Period updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update period",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update period status (activate/close)
  updatePeriodStatus: async (
    periodId: number,
    statusData: PeriodActivateUpdate
  ): Promise<Period> => {
    try {
      const response = await api.patch(`/periods/${periodId}/status`, statusData);
      toast({
        title: "Success",
        description: `Period status updated to ${statusData.period_status}`,
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update period status",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Activate a period
  activatePeriod: async (periodId: number): Promise<Period> => {
    try {
      const response = await api.patch(`/periods/${periodId}/activate`);
      toast({
        title: "Success",
        description: "Period activated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to activate period",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Close a period
  closePeriod: async (periodId: number): Promise<Period> => {
    try {
      const response = await api.patch(`/periods/${periodId}/close`);
      toast({
        title: "Success",
        description: "Period closed successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to close period",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Soft delete a period
  deletePeriod: async (periodId: number): Promise<StatusMessage> => {
    try {
      const response = await api.delete(`/periods/${periodId}`);
      toast({
        title: "Success",
        description: "Period deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete period",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get period with KPI statistics
  getPeriodWithKPIs: async (periodId: number): Promise<PeriodWithKPIs> => {
    try {
      const response = await api.get(`/periods/${periodId}/kpis`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch period KPI statistics",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get period performance statistics
  getPeriodStats: async (periodId: number): Promise<PeriodStats> => {
    try {
      const response = await api.get(`/periods/${periodId}/stats`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch period statistics",
        variant: "destructive",
      });
      throw error;
    }
  },
};