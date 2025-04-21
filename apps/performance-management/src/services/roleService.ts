import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface Role {
  role_id: number;
  role_name: string;
  role_code: string;
  role_description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleData {
  role_name: string;
  role_code: string;
  role_description?: string;
  is_active?: boolean;
}

export interface UpdateRoleData {
  role_name?: string;
  role_code?: string;
  role_description?: string;
  is_active?: boolean;
}

export interface RolePermission {
  permission_id: number;
  permission_name: string;
  permission_code: string;
  permission_description?: string | null;
}

export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}

const { toast } = useToast();

export const roleService = {
  // Get all roles with pagination and optional search
  getRoles: async (
    skip: number = 0,
    limit: number = 100,
    search?: string
  ): Promise<Role[]> => {
    try {
      const params = { skip, limit };
      if (search) Object.assign(params, { search });
      
      const response = await pmApi.get("/roles/", { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch roles",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Search roles by term
  searchRoles: async (term: string, limit: number = 10): Promise<Role[]> => {
    try {
      const response = await pmApi.get(`/roles/search/${term}`, {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to search roles",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new role
  createRole: async (roleData: CreateRoleData): Promise<Role> => {
    try {
      const response = await pmApi.post("/roles/", roleData);
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create role",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get role by ID
  getRoleById: async (roleId: number): Promise<Role> => {
    try {
      const response = await pmApi.get(`/roles/${roleId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch role",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get role with permissions
  getRoleWithPermissions: async (roleId: number): Promise<RoleWithPermissions> => {
    try {
      const response = await pmApi.get(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch role permissions",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update role
  updateRole: async (roleId: number, roleData: UpdateRoleData): Promise<Role> => {
    try {
      const response = await pmApi.put(`/roles/${roleId}`, roleData);
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update role",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete role
  deleteRole: async (roleId: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await pmApi.delete(`/roles/${roleId}`);
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete role",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Add permission to role
  addPermissionToRole: async (roleId: number, permissionId: number): Promise<RoleWithPermissions> => {
    try {
      const response = await pmApi.post(`/roles/${roleId}/permissions/${permissionId}`);
      toast({
        title: "Success",
        description: "Permission added to role successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add permission to role",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Remove permission from role
  removePermissionFromRole: async (roleId: number, permissionId: number): Promise<RoleWithPermissions> => {
    try {
      const response = await pmApi.delete(`/roles/${roleId}/permissions/${permissionId}`);
      toast({
        title: "Success",
        description: "Permission removed from role successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to remove permission from role",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get all available permissions
  getAllPermissions: async (): Promise<RolePermission[]> => {
    try {
      const response = await pmApi.get("/permissions/");
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch permissions",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default roleService;