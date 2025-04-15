import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@workspace/ui/components/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@workspace/ui/components/select';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
// Enhanced Types
type Perspective =
    | 'Financial'
    | 'Customer'
    | 'Internal Business Process'
    | 'Learning & Growth';

type Category = 'Max' | 'Min' | 'On Target';
type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
type UOMType = 'Number' | '%' | 'Days' | 'Kriteria';

type MPMEntry = {
    id?: number;
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
    id?: string;
    parentKPI: MPMEntry;
    teamName: string;
    teamWeight: number; // New: Team-specific weight allocation
    teamTarget: number;
    monthlyTargets: Record<string, number>;
    comments?: string; // Optional: Add comments for team strategy
};

// Dialog for adding/editing team KPI action plans
export const TeamTargetEditDialog = ({
    isOpen,
    onClose,
    onSave,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (actionPlan: TeamKPIActionPlan) => void;
    initialData?: TeamKPIActionPlan;
}) => {
    const [parentKPIs, _] = useState<MPMEntry[]>([
        {
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
        }
    ]);

    const [formData, setFormData] = useState<TeamKPIActionPlan>(initialData || {
        parentKPI: parentKPIs[0],
        teamName: '',
        teamWeight: 0,
        teamTarget: 0,
        monthlyTargets: {
            'Jan-25': 0,
            'Feb-25': 0,
            'Mar-25': 0
        },
        comments: ''
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95%] lg:max-w-2xl rounded-lg overflow-y-scroll max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit' : 'Add'} Team KPI Action Plan
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Parent KPI Selection */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Parent KPI</Label>
                        <Select
                            value={formData.parentKPI.id?.toString()}
                            onValueChange={(value) => {
                                const selectedKPI = parentKPIs.find(kpi => kpi.id === Number(value));
                                if (selectedKPI) {
                                    setFormData(prev => ({
                                        ...prev,
                                        parentKPI: selectedKPI
                                    }));
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Parent KPI" />
                            </SelectTrigger>
                            <SelectContent>
                                {parentKPIs.map(kpi => (
                                    <SelectItem key={kpi.id} value={formData.parentKPI.id ? formData.parentKPI.id.toString() : ''}>
                                        {kpi.kpi} - {kpi.perspective}
                                    </SelectItem>
                                ))}
                            </SelectContent>

                        </Select>
                    </div>

                    {/* Team Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Team Name</Label>
                        <Input
                            value={formData.teamName}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                teamName: e.target.value
                            }))}
                            className="col-span-3"
                        />
                    </div>

                    {/* Team Target */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Team Target</Label>
                        <Input
                            type="number"
                            value={formData.teamTarget}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                teamTarget: Number(e.target.value)
                            }))}
                            className="col-span-3"
                        />
                    </div>

                    {/* Monthly Targets */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Monthly Targets</Label>
                        <div className="col-span-3 grid grid-cols-3 gap-2">
                            {Object.keys(formData.monthlyTargets).map(month => (
                                <div key={month}>
                                    <Label>{month}</Label>
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
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weight */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Team Weight (%)</Label>
                    <Input
                        type="number"
                        value={formData.teamWeight}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            teamWeight: Number(e.target.value)
                        }))}
                        className="col-span-3"
                        max={100}
                        min={0}
                    />
                </div>

                {/* Optional: Comments Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Comments/Strategy</Label>
                    <Input
                        value={formData.comments || ''}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            comments: e.target.value
                        }))}
                        className="col-span-3"
                        placeholder="Team's strategy or comments"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => onSave(formData)}
                        disabled={!formData.teamName || formData.teamTarget <= 0}
                    >
                        {initialData ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};