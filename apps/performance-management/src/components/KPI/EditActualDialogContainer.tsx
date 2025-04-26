// EditActualDialogContainer.tsx
import { useState } from 'react';
import { KPIEntryWithActuals } from '@/hooks/useActuals';
import EditActualDialog from './EditActualDialog';

interface EditActualDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedActual: KPIEntryWithActuals | null;
  refreshData: () => void;
}

export const EditActualDialogContainer = ({
  isOpen,
  onClose,
  selectedActual,
  refreshData,
}: EditActualDialogContainerProps) => {
 
  // We need to match what the dialog expects: KPIEntryWithActuals | null
  const [updatedActual, setUpdatedActual] = useState<KPIEntryWithActuals | null>(selectedActual);
  
  return (
    <EditActualDialog
      isOpen={isOpen}
      onClose={onClose}
      selectedActual={updatedActual}
      setSelectedActual={setUpdatedActual}
      refreshData={refreshData}
    />
  );
};