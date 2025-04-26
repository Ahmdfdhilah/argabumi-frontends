import { useState } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import { ConfirmDialog } from './ConfirmDialog';
import { submissionService, SubmissionStatusUpdate } from '@/services/submissionService';

interface RevertToDraftDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  refreshData: () => void;
}

export const RevertToDraftDialogContainer = ({ 
  isOpen, 
  onClose, 
  submissionId,
  refreshData 
}: RevertToDraftDialogContainerProps) => {
  const { toast } = useToast();
  const [isReverting, setIsReverting] = useState(false);
  
  const handleRevertToDraft = async () => {
    if (!submissionId) return;

    setIsReverting(true);
    try {
      const statusUpdate: SubmissionStatusUpdate = {
        submission_status: 'Draft',
        submission_comments: 'Reverted to draft for editing after rejection'
      };

      await submissionService.updateSubmissionStatus(submissionId, statusUpdate);

      toast({
        title: "Success",
        description: "Submission reverted to draft status successfully",
      });

      onClose();
      refreshData();
    } catch (error) {
      console.error('Error reverting to draft:', error);
      toast({
        title: "Error",
        description: "Failed to revert to draft status",
        variant: "destructive",
      });
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleRevertToDraft}
      isProcessing={isReverting}
      title="Revert to Draft"
      description="Are you sure you want to revert this submission to draft status? This will allow you to make changes before submitting again."
    />
  );
};