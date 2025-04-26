import { useState } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import { ApproveDialog } from './ApproveDialog';
import { approvalService, ApprovalStatusUpdate } from '@/services/approvalService';

interface ApproveDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  employeeId?: number;
  refreshData: () => void;
}

export const ApproveDialogContainer = ({
  isOpen,
  onClose,
  submissionId,
  employeeId,
  refreshData
}: ApproveDialogContainerProps) => {
  const { toast } = useToast();
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  const handleApprove = async () => {
    if (!submissionId || !employeeId) return;

    setIsProcessingApproval(true);
    try {
      // First get the approval ID for the current user
      const approvalData = await approvalService.getApprovalsBySubmission(submissionId);
      const userApproval = approvalData.find(
        approval => approval.submission_id === submissionId &&
          approval.approval_status === 'Pending' &&
          approval.approver_id === employeeId
      );

      console.log(userApproval);
      
      if (!userApproval?.approval_id) {
        throw new Error("No pending approval found for current user");
      }

      const statusUpdate: ApprovalStatusUpdate = {
        approval_status: 'Approved',
        approval_notes: approvalNotes
      };
      console.log("status update", statusUpdate);


      await approvalService.updateApprovalStatus(userApproval.approval_id, statusUpdate);

      onClose();
      setApprovalNotes('');

      // Refresh data to get updated status
      refreshData();

      toast({
        title: "Success",
        description: "Targets approved successfully",
      });
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve targets",
        variant: "destructive",
      });
    } finally {
      setIsProcessingApproval(false);
    }
  };

  return (
    <ApproveDialog
      isOpen={isOpen}
      onClose={onClose}
      notes={approvalNotes}
      setNotes={setApprovalNotes}
      onApprove={handleApprove}
      isProcessing={isProcessingApproval}
    />
  );
};