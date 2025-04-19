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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

// Define the month names for better organization in the UI
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

// Group months by quarters for tab organization
const QUARTERS = [
  { name: 'Q1', months: ['January', 'February', 'March'] },
  { name: 'Q2', months: ['April', 'May', 'June'] },
  { name: 'Q3', months: ['July', 'August', 'September'] },
  { name: 'Q4', months: ['October', 'November', 'December'] }
];

interface Target {
  target_month: number;
  target_value: number | string;
}

interface KPIDefinition {
  kpi_definition: string;
  kpi_weight: number;
  kpi_uom: string;
  kpi_category: string;
  kpi_calculation: string;
  kpi_perspective_id: string;
}

interface MPMEntry {
  entry_id: number;
  kpi_name: string;
  kpiDefinition?: KPIDefinition;
  targets: Target[];
}

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
  const [localTargets, setLocalTargets] = useState<Target[]>([]);
  const [activeTab, setActiveTab] = useState('Q1');

  // Initialize the local targets when the KPI changes
  useEffect(() => {
    if (kpi) {
      // Ensure all 12 months have a target value
      const fullTargets = Array.from({ length: 12 }, (_, i) => {
        const existingTarget = kpi.targets.find(t => t.target_month === i + 1);
        return existingTarget || { target_month: i + 1, target_value: '' };
      });
      
      setLocalTargets(fullTargets);
    }
  }, [kpi]);

  // Handle target value change
  const handleTargetChange = (month: number, value: string) => {
    setLocalTargets(prev => 
      prev.map(target => 
        target.target_month === month 
          ? { ...target, target_value: value === '' ? '' : parseFloat(value) } 
          : target
      )
    );
  };

  // Handle save
  const handleSave = () => {
    if (kpi) {
      const updatedKPI: MPMEntry = {
        ...kpi,
        targets: localTargets.filter(target => target.target_value !== '')
      };
      onSave(updatedKPI);
    }
  };

  if (!kpi) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95%] lg:max-w-lg rounded-lg overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="mt-4 lg:mt-0">Edit Monthly Targets</DialogTitle>
          <DialogDescription>
            Modify the monthly targets for {kpi.kpi_name}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="bg-[#f8fbf4] dark:bg-[#1B6131]/20 p-4 rounded-md mb-4">
            <p className="font-medium">{kpi.kpi_name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{kpi.kpiDefinition?.kpi_definition}</p>
            <div className="flex flex-wrap gap-x-4 mt-2 text-sm">
              <p><span className="font-medium">Weight:</span> {kpi.kpiDefinition?.kpi_weight}%</p>
              <p><span className="font-medium">UOM:</span> {kpi.kpiDefinition?.kpi_uom}</p>
              <p><span className="font-medium">Category:</span> {kpi.kpiDefinition?.kpi_category}</p>
            </div>
          </div>

          <Tabs defaultValue="Q1" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              {QUARTERS.map(quarter => (
                <TabsTrigger key={quarter.name} value={quarter.name}>
                  {quarter.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {QUARTERS.map(quarter => (
              <TabsContent key={quarter.name} value={quarter.name} className="space-y-4">
                {quarter.months.map(monthName => {
                  const monthNum = MONTH_NAMES.indexOf(monthName) + 1;
                  const target = localTargets.find(t => t.target_month === monthNum);
                  
                  return (
                    <div key={monthName} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`target-${monthNum}`} className="text-right">
                        {monthName}
                      </Label>
                      <Input
                        id={`target-${monthNum}`}
                        type="number"
                        value={target?.target_value?.toString() || ''}
                        onChange={(e) => handleTargetChange(monthNum, e.target.value)}
                        className="col-span-3"
                        placeholder={`Enter target for ${monthName}`}
                      />
                    </div>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DialogFooter className="space-y-4 pt-4">
          <div className="flex flex-col lg:flex-row gap-4 w-full justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#1B6131] hover:bg-[#46B749]">
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMonthlyTargetDialog;