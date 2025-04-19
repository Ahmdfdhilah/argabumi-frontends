import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { useToast } from '@workspace/ui/components/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Combobox } from '@workspace/ui/components/combobox';
import organizationUnitService from '@/services/organizationUnitService';
import employeeService from '@/services/employeeService';

interface ActionPlanEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (actionPlan: any) => void;
    initialData?: any;
    parentKPI: any;
}

export const ActionPlanEditDialog: React.FC<ActionPlanEditDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        kpi_id: initialData?.kpi_id || null,
        kpi_name: initialData?.kpi_name || '',
        kpi_definition: initialData?.kpi_definition || '',
        kpi_weight: initialData?.kpi_weight || 0,
        kpi_target: initialData?.kpi_target || 0,
        assignType: initialData?.kpi_org_unit_id ? 'Unit' : initialData?.kpi_employee_id ? 'Employee' : 'Unit',
        assigneeId: initialData?.kpi_org_unit_id || initialData?.kpi_employee_id || null,
        kpi_metadata: initialData?.kpi_metadata || {},
    });

    // State for dropdown options
    const [orgUnits, setOrgUnits] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch organization units and employees on component load
    useEffect(() => {
        const fetchOrgUnits = async () => {
            try {
                const data = await organizationUnitService.getOrganizationUnits(0, 100);
                setOrgUnits(data);
            } catch (error) {
                console.error('Error fetching organization units:', error);
            }
        };

        const fetchEmployees = async () => {
            try {
                const data = await employeeService.getEmployees(0, 100);
                setEmployees(data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        if (isOpen) {
            fetchOrgUnits();
            fetchEmployees();
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'kpi_weight' || name === 'kpi_target') {
            // Handle numeric inputs
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAssignTypeChange = (type: string) => {
        setFormData(prev => ({ ...prev, assignType: type, assigneeId: null }));
    };

    const handleAssigneeChange = (id: number | string) => {
        setFormData(prev => ({ ...prev, assigneeId: id }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            // Validate form
            if (!formData.kpi_name) {
                toast({
                    title: "Validation Error",
                    description: "Action plan name is required",
                    variant: "destructive",
                });
                return;
            }

            if (formData.kpi_weight <= 0) {
                toast({
                    title: "Validation Error",
                    description: "Weight must be greater than zero",
                    variant: "destructive",
                });
                return;
            }

            if (!formData.assigneeId) {
                toast({
                    title: "Validation Error",
                    description: "Please select an assignee",
                    variant: "destructive",
                });
                return;
            }

            // Call parent's onSave with the form data
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving action plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter assignees based on search term
    const filteredOrgUnits = orgUnits.filter(unit =>
        unit.org_unit_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEmployees = employees.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Action Plan' : 'Add New Action Plan'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="kpi_name" className="text-right">
                                Action Plan Name *
                            </Label>
                            <Input
                                id="kpi_name"
                                name="kpi_name"
                                value={formData.kpi_name}
                                onChange={handleInputChange}
                                className="col-span-3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="kpi_definition" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="kpi_definition"
                                name="kpi_definition"
                                value={formData.kpi_definition}
                                onChange={handleInputChange}
                                className="col-span-3"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="kpi_weight" className="text-right">
                                Weight (%) *
                            </Label>
                            <Input
                                id="kpi_weight"
                                name="kpi_weight"
                                type="number"
                                value={formData.kpi_weight}
                                onChange={handleInputChange}
                                className="col-span-3"
                                min="0"
                                max="100"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="kpi_target" className="text-right">
                                Target Value *
                            </Label>
                            <Input
                                id="kpi_target"
                                name="kpi_target"
                                type="number"
                                value={formData.kpi_target}
                                onChange={handleInputChange}
                                className="col-span-3"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                                Assign To *
                            </Label>
                            <div className="col-span-3 space-y-4">
                                <Tabs
                                    value={formData.assignType}
                                    onValueChange={handleAssignTypeChange}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="Unit">Organization Unit</TabsTrigger>
                                        <TabsTrigger value="Employee">Employee</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="Unit" className="mt-4">
                                        <Combobox
                                            options={filteredOrgUnits.map(unit => ({
                                                value: unit.org_unit_id,
                                                label: unit.org_unit_name
                                            }))}
                                            value={formData.assignType === 'Unit' ? formData.assigneeId : null}
                                            onChange={handleAssigneeChange}
                                            placeholder="Select organization unit..."
                                            searchPlaceholder="Search units..."
                                            searchValue={searchTerm}
                                            onSearchChange={setSearchTerm}
                                            emptyMessage="No units found"
                                        />
                                    </TabsContent>

                                    <TabsContent value="Employee" className="mt-4">
                                        <Combobox
                                            options={filteredEmployees.map(emp => ({
                                                value: emp.employee_id,
                                                label: emp.employee_name
                                            }))}
                                            value={formData.assignType === 'Employee' ? formData.assigneeId : null}
                                            onChange={handleAssigneeChange}
                                            placeholder="Select employee..."
                                            searchPlaceholder="Search employees..."
                                            searchValue={searchTerm}
                                            onSearchChange={setSearchTerm}
                                            emptyMessage="No employees found"
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                        >
                            {initialData ? 'Update' : 'Create'} Action Plan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ActionPlanEditDialog;