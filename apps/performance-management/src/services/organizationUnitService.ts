// src/services/organizationUnitService.ts
import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface OrganizationUnitBase {
  org_unit_code: string;
  org_unit_name: string;
  org_unit_type: string;
  org_unit_head_id?: number | null;
  org_unit_parent_id?: number | null;
  org_unit_level: number;
  org_unit_description?: string | null;
  org_unit_metadata?: Record<string, any> | null;
  is_active: boolean;
}

export interface OrganizationUnitResponse extends OrganizationUnitBase {
  org_unit_id: number;
  org_unit_path: string;
  created_at: string;
  created_by?: number | null;
  updated_at?: string | null;
  updated_by?: number | null;
  deleted_at?: string | null;
  deleted_by?: number | null;
}

export interface OrganizationUnitCreate extends OrganizationUnitBase {}

export interface OrganizationUnitUpdate {
  org_unit_code?: string;
  org_unit_name?: string;
  org_unit_type?: string;
  org_unit_head_id?: number | null;
  org_unit_parent_id?: number | null;
  org_unit_level?: number;
  org_unit_description?: string | null;
  org_unit_metadata?: Record<string, any> | null;
  is_active?: boolean;
}

export interface OrganizationUnitWithChildrenResponse extends OrganizationUnitResponse {
  children: OrganizationUnitResponse[];
}

export interface OrganizationUnitTreeNode {
  org_unit_id: number;
  org_unit_code: string;
  org_unit_name: string;
  org_unit_type: string;
  org_unit_level: number;
  org_unit_path: string;
  is_active: boolean;
  children: OrganizationUnitTreeNode[];
}

export interface OrganizationUnitHierarchyResponse {
  tree: OrganizationUnitTreeNode[];
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

const organizationUnitService = {
  // Get all organization units with pagination and optional search
  getOrganizationUnits: async (
    skip = 0,
    limit = 100,
    search?: string
  ): Promise<OrganizationUnitResponse[]> => {
    try {
      const params = { skip, limit, search };
      const response = await pmApi.get("/organization-units/", { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch organization units",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new organization unit
  createOrganizationUnit: async (
    orgUnitData: OrganizationUnitCreate
  ): Promise<OrganizationUnitResponse> => {
    try {
      const response = await pmApi.post("/organization-units/", orgUnitData);
      toast({
        title: "Success",
        description: "Organization unit created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create organization unit",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get the complete organization hierarchy as a tree
  getOrganizationHierarchy: async (): Promise<OrganizationUnitHierarchyResponse> => {
    try {
      const response = await pmApi.get("/organization-units/hierarchy");
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch organization hierarchy",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get an organization unit by ID
  getOrganizationUnitById: async (orgUnitId: number): Promise<OrganizationUnitResponse> => {
    try {
      const response = await pmApi.get(`/organization-units/${orgUnitId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch organization unit",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get an organization unit by code
  getOrganizationUnitByCode: async (code: string): Promise<OrganizationUnitResponse> => {
    try {
      const response = await pmApi.get(`/organization-units/code/${code}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch organization unit by code",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get an organization unit with its immediate children
  getOrganizationUnitWithChildren: async (
    orgUnitId: number
  ): Promise<OrganizationUnitWithChildrenResponse> => {
    try {
      const response = await pmApi.get(`/organization-units/${orgUnitId}/children`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch organization unit with children",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update organization unit information
  updateOrganizationUnit: async (
    orgUnitId: number,
    orgUnitData: OrganizationUnitUpdate
  ): Promise<OrganizationUnitResponse> => {
    try {
      const response = await pmApi.put(`/organization-units/${orgUnitId}`, orgUnitData);
      toast({
        title: "Success",
        description: "Organization unit updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update organization unit",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Soft delete an organization unit
  deleteOrganizationUnit: async (orgUnitId: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/organization-units/${orgUnitId}`);
      toast({
        title: "Success",
        description: "Organization unit deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete organization unit",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Search organization units by name or code
  searchOrganizationUnits: async (
    term: string,
    limit = 10
  ): Promise<OrganizationUnitResponse[]> => {
    try {
      const params = { limit };
      const response = await pmApi.get(`/organization-units/search/${term}`, { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to search organization units",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default organizationUnitService;