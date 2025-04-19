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
import { KPIDefinitionResponse } from '../../services/kpiDefinitionService';
import { KPIPerspective } from '../../services/kpiPerspectiveService';
import { OrganizationUnitResponse } from '../../services/organizationUnitService';

type KPIFormDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (kpi: KPIDefinitionResponse) => void;
    initialData?: Partial<KPIDefinitionResponse>;
    mode: 'create' | 'edit';
    perspectives: KPIPerspective[];
    organizationUnits: OrganizationUnitResponse[];
};

const KPIFormDialog: React.FC<KPIFormDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData = {},
    mode,
    perspectives,
    organizationUnits
}) => {
    const [formData, setFormData] = useState<Partial<KPIDefinitionResponse>>({});

    // Reset the form when the dialog opens or mode changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                // When creating, always start with an empty object
                setFormData({
                    kpi_code: '',
                    kpi_name: '',
                    kpi_definition: '',
                    kpi_weight: 0,
                    kpi_uom: '',
                    kpi_category: '',
                    kpi_calculation: '',
                    kpi_target: 0,
                    kpi_org_unit_id: undefined,
                    kpi_perspective_id: 0,
                    kpi_owner_id: undefined
                });
            } else if (mode === 'edit' && initialData) {
                // When editing, use the initial data
                setFormData(initialData);
            }
        }
    }, [isOpen, mode, initialData]);

    const handleSave = () => {
        if (formData) {
            const finalKPI = {
                ...formData,
            } as KPIDefinitionResponse;

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
                    {/* KPI Perspective Select */}
                    <div className="space-y-2">
                        <Label>Perspective</Label>
                        <Select
                            value={formData.kpi_perspective_id?.toString()}
                            onValueChange={(value) =>
                                setFormData({ ...formData, kpi_perspective_id: parseInt(value) })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Perspective" />
                            </SelectTrigger>
                            <SelectContent>
                                {perspectives.map((perspective) => (
                                    <SelectItem
                                        key={perspective.perspective_id}
                                        value={perspective.perspective_id.toString()}
                                    >
                                        {perspective.perspective_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* KPI Code */}
                    <div className="space-y-2">
                        <Label>KPI Code</Label>
                        <Input
                            placeholder="Enter KPI code"
                            value={formData.kpi_code || ''}
                            onChange={(e) => setFormData({ ...formData, kpi_code: e.target.value })}
                        />
                    </div>

                    {/* KPI Name */}
                    <div className="space-y-2">
                        <Label>KPI Name</Label>
                        <Input
                            placeholder="Enter KPI name"
                            value={formData.kpi_name || ''}
                            onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })}
                        />
                    </div>

                    {/* KPI Definition */}
                    <div className="space-y-2">
                        <Label>KPI Definition</Label>
                        <Input
                            placeholder="Enter KPI definition"
                            value={formData.kpi_definition || ''}
                            onChange={(e) => setFormData({ ...formData, kpi_definition: e.target.value })}
                        />
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                        <Label>Weight (%)</Label>
                        <Input
                            type="number"
                            placeholder="Enter weight"
                            value={formData.kpi_weight?.toString() || ''}
                            onChange={(e) => setFormData({ ...formData, kpi_weight: Number(e.target.value) })}
                        />
                    </div>

                    {/* UOM */}
                    <div className="space-y-2">
                        <Label>UOM</Label>
                        <Select
                            value={formData.kpi_uom}
                            onValueChange={(value) =>
                                setFormData({ ...formData, kpi_uom: value })
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

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={formData.kpi_category}
                            onValueChange={(value) =>
                                setFormData({ ...formData, kpi_category: value })
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

                    {/* YTD Calculation */}
                    <div className="space-y-2">
                        <Label>YTD Calculation</Label>
                        <Select
                            value={formData.kpi_calculation}
                            onValueChange={(value) =>
                                setFormData({ ...formData, kpi_calculation: value })
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

                    {/* Related PIC (Organization Unit) */}
                    <div className="space-y-2">
                        <Label>Related PIC</Label>
                        <Select
                            value={formData.kpi_org_unit_id?.toString() || ''}
                            onValueChange={(value) =>
                                setFormData({ ...formData, kpi_org_unit_id: parseInt(value) })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Organization Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {organizationUnits.map((orgUnit) => (
                                    <SelectItem
                                        key={orgUnit.org_unit_id}
                                        value={orgUnit.org_unit_id.toString()}
                                    >
                                        {orgUnit.org_unit_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Target */}
                    <div className="space-y-2">
                        <Label>Target</Label>
                        <Input
                            type="number"
                            placeholder="Enter target"
                            value={formData.kpi_target?.toString() || ''}
                            onChange={(e) => setFormData({ ...formData, kpi_target: Number(e.target.value) })}
                        />
                    </div>
                    <input
                        type="hidden"
                        value={formData.kpi_owner_id}
                    />
                </div>

                <DialogFooter className='space-y-4'>
                    <div className="flex flex-col lg:flex-row gap-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
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