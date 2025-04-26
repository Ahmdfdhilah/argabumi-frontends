import { useState } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import { RejectDialog } from './RejectDialog';
import { approvalService, ApprovalStatusUpdate } from '@/services/approvalService';
import { submissionService } from '@/services/submissionService';

interface RejectDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  refreshData: () => void;
  employeeId?: number;
  isAdminReject: boolean;
}

export const RejectDialogContainer = ({
  isOpen,
  onClose,
  submissionId,
  refreshData,
  employeeId,
  isAdminReject
}: RejectDialogContainerProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReject = async () => {
    if (!submissionId) return;

    setIsProcessing(true);
    try {
      if (isAdminReject) {
        // Admin rejection logic
        const rejectData = {
          rejection_reason: notes
        };

        await submissionService.adminRejectSubmission(submissionId, rejectData);
      } else {

        if (!employeeId) {
          return
        }
        // First get the approval ID for the current user
        const approvalData = await approvalService.getApprovalsBySubmission(submissionId);
        console.log(employeeId);
        console.log(approvalData);
        

        const userApproval = approvalData.find(
          approval => approval.submission_id === submissionId &&
            approval.approval_status === 'Pending' &&
            approval.approver_id === employeeId
        );

        if (!userApproval?.approval_id) {
          throw new Error("No pending approval found for current user");
        }

        const statusUpdate: ApprovalStatusUpdate = {
          approval_status: 'Rejected',
          approval_notes: notes
        };

        await approvalService.updateApprovalStatus(userApproval.approval_id, statusUpdate);
      }

      toast({
        title: "Success",
        description: "Targets rejected successfully",
      });

      onClose();
      setNotes('');

      // Refresh data to get updated status
      refreshData();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject targets",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const title = isAdminReject ? "Admin Rejection" : "Reject Targets";
  const description = isAdminReject
    ? "You are about to reject these previously approved targets as an admin. Please provide a reason."
    : "You are about to reject these targets. Please provide a reason below.";

  return (
    <RejectDialog
      isOpen={isOpen}
      onClose={onClose}
      notes={notes}
      setNotes={setNotes}
      onReject={handleReject}
      isProcessing={isProcessing}
      title={title}
      description={description}
    />
  );
};