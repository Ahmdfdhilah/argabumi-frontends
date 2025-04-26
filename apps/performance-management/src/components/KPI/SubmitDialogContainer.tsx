import { useState } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import { SubmitDialog } from './SubmitDialog';
import { submissionService, SubmissionStatusUpdate } from '@/services/submissionService';

interface SubmitDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  refreshData: () => void;
}

export const SubmitDialogContainer = ({ 
  isOpen, 
  onClose, 
  submissionId,
  refreshData 
}: SubmitDialogContainerProps) => {
  const { toast } = useToast();
  const [submissionComments, setSubmissionComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitTargets = async () => {
    if (!submissionId) return;

    setIsSubmitting(true);
    try {
      const statusUpdate: SubmissionStatusUpdate = {
        submission_status: 'Submitted',
        submission_comments: submissionComments
      };

      await submissionService.updateSubmissionStatus(submissionId, statusUpdate);

      toast({
        title: "Success",
        description: "Targets submitted successfully",
      });

      onClose();
      setSubmissionComments('');
      // Refresh data to get updated submission status
      refreshData();
    } catch (error) {
      console.error('Error submitting targets:', error);
      toast({
        title: "Error",
        description: "Failed to submit targets",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubmitDialog
      isOpen={isOpen}
      onClose={onClose}
      comments={submissionComments}
      setComments={setSubmissionComments}
      onSubmit={handleSubmitTargets}
      isSubmitting={isSubmitting}
    />
  );
};