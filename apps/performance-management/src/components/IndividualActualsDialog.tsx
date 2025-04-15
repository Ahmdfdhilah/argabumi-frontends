
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


type IndividualKPIActual = {
    id: string;
    name: string;
    position: string;
    target: number;
    actual: number;
    achievement: number;
    problemIdentification: string;
    rootCauseAnalysis: string;
    correctiveAction: string;
    status: 'On Track' | 'At Risk' | 'Off Track';
};

// Individual Dialog Component
export const IndividualActualsDialog = ({
    isOpen,
    onClose,
    onSave,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (individual: IndividualKPIActual) => void;
    initialData?: IndividualKPIActual;
}) => {
    const [formData, setFormData] = useState<IndividualKPIActual>(initialData || {
        id: '',
        name: '',
        position: '',
        target: 0,
        actual: 0,
        achievement: 0,
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
                        {initialData ? 'Edit' : 'Add'} Individual KPI Actual
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                            />
                        </div>
                        <div>
                            <Label>Position</Label>
                            <Input
                                value={formData.position}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    position: e.target.value
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

                    {/* Problem Analysis */}
                    <div>
                        <Label>Problem Identification</Label>
                        <Input
                            value={formData.problemIdentification}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                problemIdentification: e.target.value
                            }))}
                            placeholder="Describe the specific problem"
                        />
                    </div>


                    <div>
                        <Label>Corrective Action</Label>
                        <Input
                            value={formData.correctiveAction}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                correctiveAction: e.target.value
                            }))}
                            placeholder="Propose solutions or improvements"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label>Status</Label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                status: e.target.value as IndividualKPIActual['status']
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