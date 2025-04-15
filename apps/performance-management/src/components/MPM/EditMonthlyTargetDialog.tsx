import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { MPMEntry } from '@/lib/types';

interface EditMonthlyTargetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: MPMEntry | null;
  onSave: (updatedKPI: MPMEntry) => void;
}

const EditMonthlyTargetDialog: React.FC<EditMonthlyTargetDialogProps> = ({
  isOpen,
  onClose,
  kpi,
  onSave
}) => {
  const [localTargets, setLocalTargets] = useState<Record<string, number>>({});

  useEffect(() => {
    if (kpi) {
      setLocalTargets(prev => ({
        ...prev,
        ...kpi.targets,
      }));
    }
  }, [kpi]);


  const handleTargetChange = (month: string, value: string) => {
    setLocalTargets(prev => ({
      ...prev,
      [month]: parseFloat(value) || 0
    }));
  };

  const handleSave = () => {
    if (kpi) {
      const updatedKPI: MPMEntry = {
        ...kpi,
        targets: localTargets
      };
      onSave(updatedKPI);
      onClose();
    }
  };

  if (!kpi) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95%] lg:max-w-lg rounded-lg overflow-y-scroll max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className='mt-4 lg:mt-0'>Edit Monthly Targets for {kpi.kpi}</DialogTitle>
          <DialogDescription>
            Modify the monthly targets for this KPI
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {Object.entries(localTargets).map(([month, value]) => (
            <div key={month} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`target-${month}`} className="text-right">
                {month}
              </Label>
              <Input
                id={`target-${month}`}
                type="number"
                value={value}
                onChange={(e) => handleTargetChange(month, e.target.value)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <DialogFooter className='space-y-4'>
          <div className="flex flex-col lg:flex-row gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMonthlyTargetDialog;