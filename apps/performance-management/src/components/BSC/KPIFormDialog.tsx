import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    BSCEntry,
    Perspective,
    YTDCalculation,
    UOMType,
    Category
} from '../../lib/types';

type KPIFormDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (kpi: BSCEntry) => void;
    initialData?: Partial<BSCEntry>;
    mode: 'create' | 'edit';
};

const KPIFormDialog: React.FC<KPIFormDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData = {},
    mode
}) => {
    const [newKPI, setNewKPI] = useState<Partial<BSCEntry>>({});

    // Reset the form when the dialog opens or mode changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                // When creating, always start with an empty object
                setNewKPI({});
            } else if (mode === 'edit' && initialData) {
                // When editing, use the initial data
                setNewKPI(initialData);
            }
        }
    }, [isOpen, mode, initialData]);

    const handleSave = () => {
        if (newKPI) {
            const finalKPI: BSCEntry = {
                ...newKPI,
            } as BSCEntry;

            onSave(finalKPI);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95%] lg:max-w-full rounded-lg overflow-y-scroll max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className='mt-4 lg:mt-0'>{mode === 'create' ? 'Create KPI' : 'Edit KPI'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new KPI to the system'
                            : 'Modify the existing KPI details'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    {/* Perspective Select */}
                    <div className="space-y-2">
                        <Label>Perspective</Label>
                        <Select
                            value={newKPI.perspective}
                            onValueChange={(value) =>
                                setNewKPI({ ...newKPI, perspective: value as Perspective })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Perspective" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Financial">Financial</SelectItem>
                                <SelectItem value="Customer">Customer</SelectItem>
                                <SelectItem value="Internal Business Process">
                                    Internal Business Process
                                </SelectItem>
                                <SelectItem value="Learning & Growth">
                                    Learning & Growth
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>KPI</Label>
                        <Input
                            placeholder="Enter KPI name"
                            value={newKPI.kpi || ''}
                            onChange={(e) => setNewKPI({ ...newKPI, kpi: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>KPI Definition</Label>
                        <Input
                            placeholder="Enter KPI definition"
                            value={newKPI.kpiDefinition || ''}
                            onChange={(e) => setNewKPI({ ...newKPI, kpiDefinition: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Weight (%)</Label>
                        <Input
                            type="number"
                            placeholder="Enter weight"
                            value={newKPI.weight || ''}
                            onChange={(e) => setNewKPI({ ...newKPI, weight: Number(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>UOM</Label>
                        <Select
                            value={newKPI.uom}
                            onValueChange={(value) =>
                                setNewKPI({ ...newKPI, uom: value as UOMType })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select UOM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Number">Number</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                                <SelectItem value="Days">Days</SelectItem>
                                <SelectItem value="Kriteria">Kriteria</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={newKPI.category}
                            onValueChange={(value) =>
                                setNewKPI({ ...newKPI, category: value as Category })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Max">Max</SelectItem>
                                <SelectItem value="Min">Min</SelectItem>
                                <SelectItem value="On Target">On Target</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>YTD Calculation</Label>
                        <Select
                            value={newKPI.ytdCalculation}
                            onValueChange={(value) =>
                                setNewKPI({ ...newKPI, ytdCalculation: value as YTDCalculation })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select YTD Calculation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Accumulative">Accumulative</SelectItem>
                                <SelectItem value="Average">Average</SelectItem>
                                <SelectItem value="Last Value">Last Value</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Related PIC</Label>
                        <Input
                            placeholder="Enter Related PIC"
                            value={newKPI.relatedPIC || ''}
                            onChange={(e) => setNewKPI({ ...newKPI, relatedPIC: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Targets</Label>
                        <Input
                            type="number"
                            placeholder="Enter targets"
                            value={newKPI.target || ''}
                            onChange={(e) => setNewKPI({ ...newKPI, target: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <DialogFooter className='space-y-4'>
                    <div className="flex flex-col lg:flex-row gap-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                        >
                            Save KPI
                        </Button>
                    </div>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default KPIFormDialog;