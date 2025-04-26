import { useState } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import { ValidateDialog } from './ValidateDialog';
import { submissionService } from '@/services/submissionService';

interface ValidateDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  refreshData: () => void;
}

export const ValidateDialogContainer = ({ 
  isOpen, 
  onClose, 
  submissionId,
  refreshData 
}: ValidateDialogContainerProps) => {
  const { toast } = useToast();
  const [validationComments, setValidationComments] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  
  const handleValidate = async () => {
    if (!submissionId) return;

    setIsValidating(true);
    try {
      await submissionService.validateSubmission(submissionId, validationComments);

      toast({
        title: "Success",
        description: "Targets validated successfully",
      });

      onClose();
      setValidationComments('');

      // Refresh data to get updated status
      refreshData();
    } catch (error) {
      console.error('Error validating submission:', error);
      toast({
        title: "Error",
        description: "Failed to validate targets",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <ValidateDialog
      isOpen={isOpen}
      onClose={onClose}
      comments={validationComments}
      setComments={setValidationComments}
      onValidate={handleValidate}
      isProcessing={isValidating}
    />
  );
};