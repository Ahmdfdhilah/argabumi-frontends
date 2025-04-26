import { useToast } from '@workspace/ui/components/sonner';
import EditMonthlyTargetDialog from './EditMonthlyTargetDialog';
import { kpiTargetService } from '@/services/kpiTargetsService';

interface EditTargetDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: any;
  refreshData: () => void;
}

export const EditTargetDialogContainer = ({ 
  isOpen, 
  onClose, 
  kpi, 
  refreshData 
}: EditTargetDialogContainerProps) => {
  const { toast } = useToast();
  
  const handleSaveTargets = async (updatedEntry: any) => {
    try {
      // Map the updated entry to the format expected by the bulk update endpoint
      const bulkUpdateData = {
        targets: updatedEntry.targets.map((target: any) => ({
          target_id: target.target_id,
          target_value: target.target_value,
          target_notes: target.target_notes || null
        }))
      };

      // Call the service to update the targets
      await kpiTargetService.bulkUpdateTargets(bulkUpdateData);

      // Refresh data to show updated values
      refreshData();
      onClose();

      toast({
        title: "Success",
        description: "Targets updated successfully",
      });
    } catch (error) {
      console.error('Error updating targets:', error);
      toast({
        title: "Error",
        description: "Failed to update targets",
        variant: "destructive",
      });
    }
  };

  return (
    <EditMonthlyTargetDialog
      isOpen={isOpen}
      onClose={onClose}
      kpi={kpi}
      onSave={handleSaveTargets}
    />
  );
};