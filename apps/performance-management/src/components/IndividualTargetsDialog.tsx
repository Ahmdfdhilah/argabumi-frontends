import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
// Types reflecting the multi-level performance management hierarchy
type Perspective =
    | 'Financial'
    | 'Customer'
    | 'Internal Business Process'
    | 'Learning & Growth';

type Category = 'Max' | 'Min' | 'On Target';
type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
type UOMType = 'Number' | '%' | 'Days' | 'Kriteria';

type ParentKPI = {
    id: number;
    perspective: Perspective;
    kpiNumber: number;
    kpi: string;
    kpiDefinition: string;
    weight: number;
    uom: UOMType;
    category: Category;
    ytdCalculation: YTDCalculation;
    targets: Record<string, number>;
};

type TeamKPIActionPlan = {
    id: string;
    parentKPI: ParentKPI;
    teamName: string;
    teamWeight: number;
    teamTarget: number;
    monthlyTargets: Record<string, number>;
    comments?: string;
};

type IndividualPerformanceEntry = {
    id: string;
    name: string;
    position: string;
    monthlyTargets: Record<string, number>;
    monthlyActuals: Record<string, number>;
    weight: number;
    teamWeight: number;
};

// Individual Performance Dialog Component
export const IndividualTargetsDialog = ({
    isOpen,
    onClose,
    onSave,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (individual: IndividualPerformanceEntry) => void;
    initialData?: IndividualPerformanceEntry;
}) => {
    const { teamId } = useParams<{ teamId: string }>();

    const parentKPI: ParentKPI = {
        id: 1,
        perspective: 'Financial',
        kpiNumber: 1,
        kpi: 'Revenue Growth',
        kpiDefinition: 'Increase overall company revenue',
        weight: 30,
        uom: 'Number',
        category: 'Max',
        ytdCalculation: 'Accumulative',
        targets: {
            'Jan-25': 100000,
            'Feb-25': 120000,
            'Mar-25': 150000
        }
    };
    // State for team KPI action plans with individual breakdown
    const [teamActionPlan, _] = useState<TeamKPIActionPlan>({
        id: teamId || '1',
        parentKPI: parentKPI,
        teamName: 'Sales Team',
        teamWeight: 20,
        teamTarget: 75000,
        monthlyTargets: {
            'Jan-25': 50000,
            'Feb-25': 60000,
            'Mar-25': 75000
        },
        comments: 'Focus on high-value client acquisition'
    });
    const [formData, setFormData] = useState<IndividualPerformanceEntry>(initialData || {
        id: '',
        name: '',
        position: '',
        monthlyTargets: {
            'Jan-25': 0,
            'Feb-25': 0,
            'Mar-25': 0
        },
        monthlyActuals: {
            'Jan-25': 0,
            'Feb-25': 0,
            'Mar-25': 0
        },
        weight: 0,
        teamWeight: teamActionPlan.teamWeight
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95%] lg:max-w-xl rounded-lg overflow-y-scroll max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit' : 'Add'} Individual Performance
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Position</Label>
                        <Input
                            value={formData.position}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                position: e.target.value
                            }))}
                            className="col-span-3"
                        />
                    </div>

                    {/* Individual Weight */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Individual Weight (%)</Label>
                        <Input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                weight: Number(e.target.value)
                            }))}
                            className="col-span-3"
                            max={100}
                            min={0}
                        />
                    </div>

                    {/* Monthly Targets and Actuals */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Monthly Targets/Actuals</Label>
                        <div className="col-span-3 grid grid-cols-3 gap-2">
                            {Object.keys(formData.monthlyTargets).map(month => (
                                <div key={month} className="space-y-2">
                                    <Label>{month}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Target</Label>
                                            <Input
                                                type="number"
                                                value={formData.monthlyTargets[month]}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    monthlyTargets: {
                                                        ...prev.monthlyTargets,
                                                        [month]: Number(e.target.value)
                                                    }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Actual</Label>
                                            <Input
                                                type="number"
                                                value={formData.monthlyActuals[month]}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    monthlyActuals: {
                                                        ...prev.monthlyActuals,
                                                        [month]: Number(e.target.value)
                                                    }
                                                }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => onSave(formData)}
                        disabled={!formData.name}
                    >
                        {initialData ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
