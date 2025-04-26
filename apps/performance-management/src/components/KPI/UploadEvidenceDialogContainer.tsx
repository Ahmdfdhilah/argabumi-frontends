import UploadEvidenceDialog from './UploadEvidenceDialog';

interface UploadEvidenceDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  refreshData: () => void;
}

export const UploadEvidenceDialogContainer = ({
  isOpen,
  onClose,
  submissionId,
  refreshData,
}: UploadEvidenceDialogContainerProps) => {

  const handleCloseAndRefresh = () => {
    onClose();
    refreshData();
  };

  return (
    <UploadEvidenceDialog
      submissionId={submissionId}
      isOpen={isOpen}
      onClose={handleCloseAndRefresh}
    />
  );
};