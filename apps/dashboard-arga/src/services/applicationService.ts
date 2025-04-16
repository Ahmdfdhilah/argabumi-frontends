// src/services/applicationService.ts
import api from '@/utils/auth';
import { useToast } from "@workspace/ui/components/sonner";

export interface Application {
  id: number;
  name: string;
  code: string;
  description: string | null;
  base_url: string;
  created_at: string;
  updated_at: string;
}

const { toast } = useToast();

export const applicationService = {
  // Fetch all applications
  fetchApplications: async (): Promise<Application[]> => {
    try {
      const response = await api.get('/api/applications/');
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 'Failed to fetch applications',
        variant: "destructive",
      });
      throw error;
    }
  },

  // Fetch single application by ID
  fetchApplicationById: async (id: number): Promise<Application> => {
    try {
      const response = await api.get(`/api/applications/${id}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 'Failed to fetch application',
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create new application
  createApplication: async (applicationData: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> => {
    try {
      const response = await api.post('/api/applications/', applicationData);
      toast({
        title: "Success",
        description: "Application created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 'Failed to create application',
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update existing application
  updateApplication: async (id: number, data: Partial<Application>): Promise<Application> => {
    try {
      const response = await api.put(`/api/applications/${id}`, data);
      toast({
        title: "Success",
        description: "Application updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 'Failed to update application',
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete application
  deleteApplication: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/applications/${id}`);
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 'Failed to delete application',
        variant: "destructive",
      });
      throw error;
    }
  },

  // Fetch applications by user ID
  fetchUserApplications: async (userId: number): Promise<Application[]> => {
    try {
      const response = await api.get(`/api/applications/user/${userId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 'Failed to fetch user applications',
        variant: "destructive",
      });
      throw error;
    }
  }
};

export default applicationService;