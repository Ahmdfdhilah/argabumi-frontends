import api from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface KPIPerspective {
  perspective_id: number;
  perspective_code: string;
  perspective_name: string;
  perspective_description: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface KPIPerspectiveCreate {
  perspective_code: string;
  perspective_name: string;
  perspective_description?: string;
}

export interface KPIPerspectiveUpdate {
  perspective_code?: string;
  perspective_name?: string;
  perspective_description?: string;
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const kpiPerspectiveService = {
  // Get all KPI perspectives with pagination
  getPerspectives: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<KPIPerspective[]> => {
    try {
      const params = { skip, limit };
      const response = await api.get("/api/kpi-perspectives/", { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to fetch KPI perspectives",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new KPI perspective
  createPerspective: async (
    perspectiveData: KPIPerspectiveCreate
  ): Promise<KPIPerspective> => {
    try {
      const response = await api.post("/api/kpi-perspectives/", perspectiveData);
      toast({
        title: "Success",
        description: "KPI perspective created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to create KPI perspective",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI perspective by ID
  getPerspectiveById: async (perspectiveId: number): Promise<KPIPerspective> => {
    try {
      const response = await api.get(`/api/kpi-perspectives/${perspectiveId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to fetch KPI perspective",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI perspective by code
  getPerspectiveByCode: async (code: string): Promise<KPIPerspective> => {
    try {
      const response = await api.get(`/api/kpi-perspectives/code/${code}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to fetch KPI perspective",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update KPI perspective information
  updatePerspective: async (
    perspectiveId: number,
    perspectiveData: KPIPerspectiveUpdate
  ): Promise<KPIPerspective> => {
    try {
      const response = await api.put(
        `/api/kpi-perspectives/${perspectiveId}`,
        perspectiveData
      );
      toast({
        title: "Success",
        description: "KPI perspective updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to update KPI perspective",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Soft delete a KPI perspective
  deletePerspective: async (
    perspectiveId: number
  ): Promise<StatusMessage> => {
    try {
      const response = await api.delete(`/api/kpi-perspectives/${perspectiveId}`);
      toast({
        title: "Success",
        description: "KPI perspective deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to delete KPI perspective",
        variant: "destructive",
      });
      throw error;
    }
  },
};