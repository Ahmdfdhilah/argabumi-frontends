// src/services/kpiDefinitionService.ts
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

// KPI Definition related types
export interface KPIDefinitionBase {
  kpi_code: string;
  kpi_name: string;
  kpi_org_unit_id?: number | null;
  kpi_employee_id?: number | null;
  kpi_period_id: number;
  kpi_parent_id?: number | null;
  kpi_perspective_id: number;
  kpi_owner_id: number;
  kpi_definition?: string | null;
  kpi_weight: Decimal | string | number;
  kpi_uom: string;
  kpi_category: string;
  kpi_calculation: string;
  kpi_target?: Decimal | string | number | null;
  kpi_is_action_plan: boolean;
  kpi_is_ipm: boolean;
  kpi_visibility_level: string;
  kpi_metadata?: Record<string, any> | null;
}

export interface KPIDefinitionResponse extends KPIDefinitionBase, BaseEntityResponse {
  kpi_id: number;
  kpi_status: string;
}

export interface KPIDefinitionCreate extends KPIDefinitionBase {}

export interface KPIDefinitionUpdate {
  kpi_code?: string;
  kpi_name?: string;
  kpi_org_unit_id?: number | null;
  kpi_employee_id?: number | null;
  kpi_parent_id?: number | null;
  kpi_perspective_id?: number;
  kpi_owner_id?: number;
  kpi_definition?: string | null;
  kpi_weight?: Decimal | string | number;
  kpi_uom?: string;
  kpi_category?: string;
  kpi_calculation?: string;
  kpi_target?: Decimal | string | number | null;
  kpi_is_action_plan?: boolean;
  kpi_is_ipm?: boolean;
  kpi_status?: string;
  kpi_visibility_level?: string;
  kpi_metadata?: Record<string, any> | null;
}

export interface KPIActionPlanCreate {
  kpi_parent_id: number;
  kpi_name: string;
  kpi_definition?: string | null;
  kpi_weight: Decimal | string | number;
  kpi_target: Decimal | string | number;
  kpi_is_ipm: boolean;
  kpi_org_unit_id?: number | null;
  kpi_employee_id?: number | null;
  kpi_metadata?: Record<string, any> | null;
}

export interface KPIDefinitionWithChildrenResponse extends KPIDefinitionResponse {
  children: KPIDefinitionResponse[];
  parent?: KPIDefinitionResponse | null;
}

export interface KPIDefinitionFullResponse extends KPIDefinitionResponse {
  organization_unit_name?: string | null;
  employee_name?: string | null;
  owner_name: string;
  perspective_name: string;
  parent_kpi_name?: string | null;
  children_count: number;
}

export interface KPIDefinitionTreeNode {
  kpi_id: number;
  kpi_code: string;
  kpi_name: string;
  kpi_type: string;
  org_unit_id?: number | null;
  org_unit_name?: string | null;
  employee_id?: number | null;
  employee_name?: string | null;
  kpi_target?: Decimal | string | number | null;
  children: KPIDefinitionTreeNode[];
}

export interface KPICascadeResponse {
  tree: KPIDefinitionTreeNode[];
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const kpiDefinitionService = {
  // Get list of KPI definitions with pagination and optional period filter
  getKPIDefinitions: async (
    skip: number = 0,
    limit: number = 100,
    period_id?: number
  ): Promise<KPIDefinitionResponse[]> => {
    try {
      const params = { skip, limit, ...(period_id ? { period_id } : {}) };
      const response = await pmApi.get("/kpi-definitions/", { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch KPI definitions",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new KPI definition
  createKPIDefinition: async (kpiData: KPIDefinitionCreate): Promise<KPIDefinitionResponse> => {
    try {
      const response = await pmApi.post("/kpi-definitions/", kpiData);
      toast({
        title: "Success",
        description: "KPI definition created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create KPI definition",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new KPI action plan
  createActionPlan: async (actionPlanData: KPIActionPlanCreate): Promise<KPIDefinitionResponse> => {
    try {
      const response = await pmApi.post("/kpi-definitions/action-plan", actionPlanData);
      toast({
        title: "Success",
        description: "Action plan created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create action plan",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Search KPI definitions by code or name
  searchKPIDefinitions: async (
    term: string,
    period_id?: number,
    limit: number = 10
  ): Promise<KPIDefinitionResponse[]> => {
    try {
      const params = { ...(period_id ? { period_id } : {}), limit };
      const response = await pmApi.get(`/kpi-definitions/search/${term}`, { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to search KPI definitions",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get KPI tree for a period
  getKPITreeByPeriod: async (period_id: number): Promise<KPICascadeResponse> => {
    try {
      const response = await pmApi.get(`/kpi-definitions/period/${period_id}/tree`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch KPI tree",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get KPIs by organization unit
  getOrganizationUnitKPIs: async (
    org_unit_id: number,
    period_id?: number
  ): Promise<KPIDefinitionResponse[]> => {
    try {
      const params = { ...(period_id ? { period_id } : {}) };
      const response = await pmApi.get(`/kpi-definitions/organization-unit/${org_unit_id}`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch organization unit KPIs",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get KPIs by employee
  getEmployeeKPIs: async (
    employee_id: number,
    period_id?: number
  ): Promise<KPIDefinitionResponse[]> => {
    try {
      const params = { ...(period_id ? { period_id } : {}) };
      const response = await pmApi.get(`/kpi-definitions/employee/${employee_id}`, { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employee KPIs",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI definition by ID
  getKPIDefinition: async (kpi_id: number): Promise<KPIDefinitionResponse> => {
    try {
      const response = await pmApi.get(`/kpi-definitions/${kpi_id}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch KPI definition",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI definition by code
  getKPIDefinitionByCode: async (code: string): Promise<KPIDefinitionResponse> => {
    try {
      const response = await pmApi.get(`/kpi-definitions/code/${code}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch KPI definition by code",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI definition with its immediate children
  getKPIDefinitionWithChildren: async (kpi_id: number): Promise<KPIDefinitionWithChildrenResponse> => {
    try {
      const response = await pmApi.get(`/kpi-definitions/${kpi_id}/children`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch KPI definition with children",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a KPI definition with full context information
  getKPIDefinitionFull: async (kpi_id: number): Promise<KPIDefinitionFullResponse> => {
    try {
      const response = await pmApi.get(`/kpi-definitions/${kpi_id}/full`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch full KPI definition",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get KPI cascade as a tree structure
  getKPICascade: async (kpi_id: number): Promise<KPICascadeResponse> => {
    try {
      const response = await pmApi.get(`/kpi-definitions/${kpi_id}/cascade`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch KPI cascade",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update KPI definition information
  updateKPIDefinition: async (
    kpi_id: number,
    kpiData: KPIDefinitionUpdate
  ): Promise<KPIDefinitionResponse> => {
    try {
      const response = await pmApi.put(`/kpi-definitions/${kpi_id}`, kpiData);
      toast({
        title: "Success",
        description: "KPI definition updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update KPI definition",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Soft delete a KPI definition
  deleteKPIDefinition: async (kpi_id: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/kpi-definitions/${kpi_id}`);
      toast({
        title: "Success",
        description: "KPI definition deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete KPI definition",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get all action plans for a KPI
  getKPIActionPlans: async (kpi_id: number): Promise<KPIDefinitionResponse[]> => {
    try {
      const response = await pmApi.get(`/kpi-definitions/${kpi_id}/action-plans`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch KPI action plans",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get KPIs by type (BSC, MPM, IPM, ActionPlan)
  getKPIsByType: async (
    kpi_type: string,
    period_id?: number
  ): Promise<KPIDefinitionResponse[]> => {
    try {
      const params = { ...(period_id ? { period_id } : {}) };
      const response = await pmApi.get(`/kpi-definitions/type/${kpi_type}`, { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch KPIs by type",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default kpiDefinitionService;