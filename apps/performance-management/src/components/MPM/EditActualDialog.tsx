import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { useToast } from '@workspace/ui/components/sonner';
import kpiActualService from '@/services/kpiActualsService';
import { KPIEntryWithActuals } from '@/hooks/useActuals';

interface EditActualDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedActual: KPIEntryWithActuals | null;
  setSelectedActual: React.Dispatch<React.SetStateAction<KPIEntryWithActuals | null>>;
  refreshData: () => void;
}

const EditActualDialog: React.FC<EditActualDialogProps> = ({
  isOpen,
  onClose,
  selectedActual,
  refreshData
}) => {
  const { toast } = useToast();
  const [localActual, setLocalActual] = useState<KPIEntryWithActuals | null>(null);

  // Update local state when selected actual changes
  useEffect(() => {
    if (selectedActual) {
      setLocalActual({...selectedActual});
    }
  }, [selectedActual]);

  // Reset local state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setLocalActual(null);
    }
  }, [isOpen]);

  // Save edited actual
  const handleSaveActual = async () => {
    if (!localActual) return;

    try {
      // Extract the actual we're updating
      const actualToUpdate = localActual.actuals[0]; 
    
      const updateData = {
        actual_value: actualToUpdate.actual_value,
        actual_problem_identification: actualToUpdate.problem_identification,
        actual_corrective_action: actualToUpdate.corrective_action
      };

      console.log(updateData);
      
      await kpiActualService.updateActual(actualToUpdate.actual_id, updateData);

      toast({
        title: "Success",
        description: "Actual updated successfully",
      });

      onClose();
      refreshData(); // Refresh data after update
    } catch (error) {
      console.error('Error updating actual:', error);
      toast({
        title: "Error",
        description: "Failed to update actual",
        variant: "destructive",
      });
    }
  };

  if (!isOpen || !localActual) return null;

  // For simplicity, assuming we're editing the first actual in the array
  const actual = localActual.actuals[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-scroll max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Edit KPI Actual Data</DialogTitle>
          <DialogDescription>
            Update actual values and corrective actions
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>KPI</Label>
            <Input value={localActual.kpi_name} disabled />
          </div>

          <div className="space-y-2">
            <Label>Target</Label>
            <Input value={actual.target_value} disabled />
          </div>

          <div className="space-y-2">
            <Label>Actual</Label>
            <Input
              type="number"
              value={actual.actual_value}
              onChange={(e) => {
                const actualValue = parseFloat(e.target.value);
                const achievement = (actualValue / actual.target_value) * 100;

                setLocalActual({
                  ...localActual,
                  actuals: [
                    {
                      ...actual,
                      actual_value: actualValue,
                      achievement: achievement
                    }
                  ]
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Achievement (%)</Label>
            <Input value={actual.achievement?.toFixed(2) || '0'} disabled />
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Problem Identification</Label>
            <Input
              value={actual.problem_identification || ''}
              onChange={(e) => {
                setLocalActual({
                  ...localActual,
                  actuals: [
                    {
                      ...actual,
                      problem_identification: e.target.value
                    }
                  ]
                });
              }}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Corrective Action</Label>
            <Input
              value={actual.corrective_action || ''}
              onChange={(e) => {
                setLocalActual({
                  ...localActual,
                  actuals: [
                    {
                      ...actual,
                      corrective_action: e.target.value
                    }
                  ]
                });
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveActual}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditActualDialog;