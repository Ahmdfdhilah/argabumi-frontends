// src/services/userService.ts
import api from "@/utils/auth";
import { useToast } from "@workspace/ui/components/sonner";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  applications: Application[];
}

export interface Application {
  id: number;
  name: string;
  description: string;
  icon: string;
  url: string;
}

const { toast } = useToast();

export const userService = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get("/api/users/");
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

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/api/users/${id}`);
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

  // Create user
  createUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.post("/api/users/", userData);
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

  // Update user
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/api/users/${id}`, userData);
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
  deleteUser: async (id: number): Promise<number> => {
    try {
      await api.delete(`/api/users/${id}`);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      return id;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete user",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Assign applications to user
  assignApplications: async (userId: number, applicationIds: number[]) => {
    try {
      const response = await api.post(`/api/users/${userId}/applications`, {
        application_ids: applicationIds
      });
      toast({
        title: "Success",
        description: "Applications assigned successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to assign applications",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Remove application from user
  removeApplication: async (userId: number, applicationId: number) => {
    try {
      await api.delete(`/api/users/${userId}/applications/${applicationId}`);
      toast({
        title: "Success",
        description: "Application removed successfully",
      });
      return { userId, applicationId };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to remove application",
        variant: "destructive",
      });
      throw error;
    }
  }
};

export default userService;