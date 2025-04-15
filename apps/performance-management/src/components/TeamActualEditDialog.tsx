import  { useState } from 'react';
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

type MonthType = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' |
    'July' | 'August' | 'September' | 'October' | 'November' | 'December';

type TeamKPIActual = {
    id: string;
    teamId: number;
    teamName: string;
    month: MonthType;
    target: number;
    actual: number;
    achievement: number;
    weight: number;
    problemIdentification: string;
    rootCauseAnalysis: string;
    correctiveAction: string;
    status: 'On Track' | 'At Risk' | 'Off Track';
};

export const TeamActualEditDialog = ({
    isOpen,
    onClose,
    onSave,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (teamKPI: TeamKPIActual) => void;
    initialData?: TeamKPIActual;
}) => {
    const [formData, setFormData] = useState<TeamKPIActual>(initialData || {
        id: '',
        teamId: 0,
        teamName: '',
        month: 'January',
        target: 0,
        actual: 0,
        achievement: 0,
        weight: 0,
        problemIdentification: '',
        rootCauseAnalysis: '',
        correctiveAction: '',
        status: 'On Track'
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit' : 'Add'} Team KPI Actual
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Team Name and Month */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Team Name</Label>
                            <Input
                                value={formData.teamName}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    teamName: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    {/* Targets and Actuals */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Target</Label>
                            <Input
                                type="number"
                                value={formData.target}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    target: Number(e.target.value)
                                }))}
                            />
                        </div>
                        <div>
                            <Label>Actual</Label>
                            <Input
                                type="number"
                                value={formData.actual}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    actual: Number(e.target.value)
                                }))}
                            />
                        </div>
                    </div>

                    {/* Achievement and Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Achievement (%)</Label>
                            <Input
                                type="number"
                                value={formData.achievement}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    achievement: Number(e.target.value)
                                }))}
                            />
                        </div>
                        <div>
                            <Label>Weight (%)</Label>
                            <Input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    weight: Number(e.target.value)
                                }))}
                            />
                        </div>
                    </div>

                    {/* Problem Identification */}
                    <div>
                        <Label>Problem Identification</Label>
                        <Input
                            value={formData.problemIdentification}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                problemIdentification: e.target.value
                            }))}
                        />
                    </div>

                    {/* Corrective Action */}
                    <div>
                        <Label>Corrective Action</Label>
                        <Input
                            value={formData.correctiveAction}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                correctiveAction: e.target.value
                            }))}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label>Status</Label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                status: e.target.value as TeamKPIActual['status']
                            }))}
                            className="w-full p-2 border rounded"
                        >
                            <option value="On Track">On Track</option>
                            <option value="At Risk">At Risk</option>
                            <option value="Off Track">Off Track</option>
                        </select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={() => onSave(formData)}>
                        {initialData ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
