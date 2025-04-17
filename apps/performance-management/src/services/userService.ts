// src/services/userService.ts
import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface UserBase {
  user_email: string;
  user_first_name: string;
  user_last_name?: string | null;
  user_sso_id?: string | null;
  user_is_active: boolean;
}

export interface User extends UserBase {
  user_id: number;
  user_employee_id?: number | null;
  employee_name?: string | null;
  org_unit_name?: string | null;
  user_created_at?: string;
  user_updated_at?: string;
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface UserContext {
  user_id: number;
  user_email: string;
  employee_id?: number | null;
  org_unit_id?: number | null;
  org_unit_path?: string | null;
  roles: string[];
  permissions: string[];
}

export interface Role {
  role_id: number;
  role_name: string;
  role_code: string;
  role_description?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface CreateUserData {
  user_email: string;
  user_first_name: string;
  user_last_name?: string;
  user_sso_id?: string;
  user_is_active?: boolean;
}

export interface UpdateUserData {
  user_first_name?: string;
  user_last_name?: string;
  user_sso_id?: string;
  user_is_active?: boolean;
}

export interface LinkEmployeeRequest {
  employee_id: number;
}

const { toast } = useToast();

export const userService = {
  // Get all users with pagination and optional search
  getUsers: async (
    skip: number = 0,
    limit: number = 100,
    search?: string
  ): Promise<User[]> => {
    try {
      const params = { skip, limit };
      if (search) Object.assign(params, { search });
      
      const response = await pmApi.get("/users/", { params });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch users",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get unlinked users (not associated with employees)
  getUnlinkedUsers: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<User[]> => {
    try {
      const response = await pmApi.get("/users/unlinked", {
        params: { skip, limit },
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch unlinked users",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Search users by term
  searchUsers: async (term: string, limit: number = 10): Promise<User[]> => {
    try {
      const response = await pmApi.get(`/users/search/${term}`, {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to search users",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: CreateUserData): Promise<User> => {
    try {
      const response = await pmApi.post("/users/", userData);
      toast({
        title: "Success",
        description: "User created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create user",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await pmApi.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch user",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get user with roles
  getUserWithRoles: async (userId: number): Promise<UserWithRoles> => {
    try {
      const response = await pmApi.get(`/users/${userId}/roles`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch user roles",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update user
  updateUser: async (userId: number, userData: UpdateUserData): Promise<User> => {
    try {
      const response = await pmApi.put(`/users/${userId}`, userData);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update user",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await pmApi.delete(`/users/${userId}`);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete user",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Link user to employee
  linkUserToEmployee: async (
    userId: number,
    data: LinkEmployeeRequest
  ): Promise<User> => {
    try {
      const response = await pmApi.post(`/users/${userId}/link-employee`, data);
      toast({
        title: "Success",
        description: "User linked to employee successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to link user to employee",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await pmApi.get("/users/me");
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch current user info",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get current user roles
  getCurrentUserRoles: async (): Promise<UserWithRoles> => {
    try {
      const response = await pmApi.get("/users/me/roles");
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch current user roles",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get current user context
  getCurrentUserContext: async (): Promise<UserContext> => {
    try {
      const response = await pmApi.get("/users/me/context");
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch user context",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Add role to user
  addRoleToUser: async (userId: number, roleId: number): Promise<UserWithRoles> => {
    try {
      const response = await pmApi.post(`/users/${userId}/roles/${roleId}`);
      toast({
        title: "Success",
        description: "Role added to user successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add role to user",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Remove role from user
  removeRoleFromUser: async (userId: number, roleId: number): Promise<UserWithRoles> => {
    try {
      const response = await pmApi.delete(`/users/${userId}/roles/${roleId}`);
      toast({
        title: "Success",
        description: "Role removed from user successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to remove role from user",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default userService;