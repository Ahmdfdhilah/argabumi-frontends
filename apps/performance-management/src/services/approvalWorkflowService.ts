// src/services/approvalWorkflowService.ts
import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

// Type definitions
export interface ApprovalWorkflowStep {
  step_id: number;
  workflow_id: number;
  step_level: number;
  approver_type: string;
  approver_id?: number;
  step_description: string;
  workflow_name?: string;
  approver_name?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface ApprovalWorkflow {
  workflow_id: number;
  workflow_name: string;
  workflow_type: string;
  org_unit_id?: number;
  is_active: boolean;
  org_unit_name?: string;
  steps_count: number;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface ApprovalWorkflowWithSteps extends ApprovalWorkflow {
  steps: ApprovalWorkflowStep[];
}

export interface ApprovalWorkflowCreate {
  workflow_name: string;
  workflow_type: string;
  org_unit_id?: number;
  is_active?: boolean;
}

export interface ApprovalWorkflowUpdate {
  workflow_name?: string;
  workflow_type?: string;
  org_unit_id?: number;
  is_active?: boolean;
}

export interface ApprovalWorkflowStepCreate {
  workflow_id: number;
  step_level: number;
  approver_type: string;
  approver_id?: number;
  step_description: string;
}

export interface ApprovalWorkflowStepUpdate {
  step_level?: number;
  approver_type?: string;
  approver_id?: number;
  step_description?: string;
}

export interface StatusMessage {
  status: string;
  message: string;
}

const { toast } = useToast();

export const approvalWorkflowService = {
  // Get all approval workflows
  getWorkflows: async (skip: number = 0, limit: number = 100): Promise<ApprovalWorkflow[]> => {
    try {
      const response = await pmApi.get("/approval-workflows/", {
        params: { skip, limit }
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch approval workflows",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get approval workflow by ID
  getWorkflow: async (workflowId: number): Promise<ApprovalWorkflow> => {
    try {
      const response = await pmApi.get(`/approval-workflows/${workflowId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch approval workflow",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get approval workflow with steps
  getWorkflowWithSteps: async (workflowId: number): Promise<ApprovalWorkflowWithSteps> => {
    try {
      const response = await pmApi.get(`/approval-workflows/${workflowId}/steps`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch workflow with steps",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create approval workflow
  createWorkflow: async (workflowData: ApprovalWorkflowCreate): Promise<ApprovalWorkflow> => {
    try {
      const response = await pmApi.post("/approval-workflows/", workflowData);
      toast({
        title: "Success",
        description: "Approval workflow created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create approval workflow",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update approval workflow
  updateWorkflow: async (workflowId: number, workflowData: ApprovalWorkflowUpdate): Promise<ApprovalWorkflow> => {
    try {
      const response = await pmApi.put(`/approval-workflows/${workflowId}`, workflowData);
      toast({
        title: "Success",
        description: "Approval workflow updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update approval workflow",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete approval workflow
  deleteWorkflow: async (workflowId: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/approval-workflows/${workflowId}`);
      toast({
        title: "Success",
        description: "Approval workflow deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete approval workflow",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create approval workflow step
  createWorkflowStep: async (stepData: ApprovalWorkflowStepCreate): Promise<ApprovalWorkflowStep> => {
    try {
      const response = await pmApi.post("/approval-workflows/steps", stepData);
      toast({
        title: "Success",
        description: "Workflow step created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create workflow step",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update approval workflow step
  updateWorkflowStep: async (stepId: number, stepData: ApprovalWorkflowStepUpdate): Promise<ApprovalWorkflowStep> => {
    try {
      const response = await pmApi.put(`/approval-workflows/steps/${stepId}`, stepData);
      toast({
        title: "Success",
        description: "Workflow step updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update workflow step",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete approval workflow step
  deleteWorkflowStep: async (stepId: number): Promise<StatusMessage> => {
    try {
      const response = await pmApi.delete(`/approval-workflows/steps/${stepId}`);
      toast({
        title: "Success",
        description: "Workflow step deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete workflow step",
        variant: "destructive",
      });
      throw error;
    }
  }
};