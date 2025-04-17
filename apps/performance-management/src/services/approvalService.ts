// src/services/approvalService.ts
import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

// Type definitions
export interface Approval {
  approval_id: number;
  submission_id: number;
  workflow_step_id: number;
  approval_level: number;
  approver_id: number;
  approval_status: string;
  approval_notes?: string;
  approved_at?: string;
  approver_name?: string;
  step_description?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface ApprovalStatusUpdate {
  approval_status: string;
  approval_notes?: string;
}

export interface SubmissionWithApprovals {
  submission_id: number;
  submission_type: string;
  submission_status: string;
  current_approval_level: number;
  approvals: Approval[];
}

const { toast } = useToast();

export const approvalService = {
  // Get approvals by submission ID
  getApprovalsBySubmission: async (submissionId: number): Promise<Approval[]> => {
    try {
      const response = await pmApi.get(`/approvals/submission/${submissionId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch submission approvals",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get submission with approval status
  getSubmissionWithApprovals: async (submissionId: number): Promise<SubmissionWithApprovals> => {
    try {
      const response = await pmApi.get(`/approvals/submission/${submissionId}/status`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch submission approval status",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get pending approvals for current user
  getMyPendingApprovals: async (): Promise<Approval[]> => {
    try {
      const response = await pmApi.get("/approvals/pending");
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch pending approvals",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get approval by ID
  getApproval: async (approvalId: number): Promise<Approval> => {
    try {
      const response = await pmApi.get(`/approvals/${approvalId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch approval",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update approval status (approve or reject)
  updateApprovalStatus: async (approvalId: number, statusData: ApprovalStatusUpdate): Promise<Approval> => {
    try {
      const response = await pmApi.patch(`/approvals/${approvalId}/status`, statusData);
      
      const actionType = statusData.approval_status === "Approved" ? "approved" : "rejected";
      toast({
        title: "Success",
        description: `Submission successfully ${actionType}`,
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || `Failed to ${statusData.approval_status.toLowerCase()} submission`,
        variant: "destructive",
      });
      throw error;
    }
  }
};