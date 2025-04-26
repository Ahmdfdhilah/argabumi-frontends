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
import { kpiDefinitionService } from '@/services/kpiDefinitionService';
import { useAppSelector } from '@/redux/hooks';

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
    parentKPI,
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Get current user data from Redux store
    const { user } = useAppSelector((state: any) => state.auth);
    const currentUserEmployeeId = user?.employee_data?.employee_id ?? null;
    const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;

    // Form state
    const [formData, setFormData] = useState({
        kpi_id: initialData?.kpi_id || null,
        kpi_parent_id: parentKPI?.kpi_id || null,
        kpi_name: initialData?.kpi_name || '',
        kpi_definition: initialData?.kpi_definition || '',
        kpi_weight: initialData?.kpi_weight || 0,
        kpi_target: initialData?.kpi_target || 0,
        kpi_is_ipm: initialData?.kpi_is_ipm || false,
        assignType: initialData?.kpi_org_unit_id ? 'Unit' : initialData?.kpi_employee_id ? 'Employee' : 'Unit',
        assigneeId: initialData?.kpi_org_unit_id || initialData?.kpi_employee_id || null,
        kpi_metadata: initialData?.kpi_metadata || {},
    });

    // State for dropdown options
    const [orgUnits, setOrgUnits] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [availableKPIs, setAvailableKPIs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [kpiSearchTerm, setKpiSearchTerm] = useState('');

    // Fetch organization units, employees, and available KPIs on component load
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Only fetch data if we're creating a new action plan (not editing)
                if (!initialData) {
                    // Fetch org units
                    const orgUnitsData = await organizationUnitService.getOrganizationUnits(0, 100);
                    setOrgUnits(orgUnitsData);

                    // Fetch employees
                    const employeesData = await employeeService.getEmployees(0, 100);
                    setEmployees(employeesData);

                    // Fetch KPIs the user has access to
                    if (currentUserOrgUnitId) {
                        const kpisData = await kpiDefinitionService.getOrganizationUnitKPIs(currentUserOrgUnitId);
                        const filteredKpisData = kpisData.filter((kpi: any) => kpi.kpi_is_action_plan === false);
                        setAvailableKPIs(filteredKpisData);
                    }
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen, currentUserOrgUnitId, initialData]);

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

    const handleKPISelection = async (kpiId: number) => {
        try {
            const selectedKPI = availableKPIs.find(kpi => kpi.kpi_id === kpiId);

            if (selectedKPI) {
                setFormData(prev => ({
                    ...prev,
                    kpi_name: selectedKPI.kpi_name,
                    kpi_definition: selectedKPI.kpi_definition || '',
                }));
            } else {
                // If not found in the current list, fetch the KPI details
                const kpiDetails = await kpiDefinitionService.getKPIDefinition(kpiId);
                setFormData(prev => ({
                    ...prev,
                    kpi_name: kpiDetails.kpi_name,
                    kpi_definition: kpiDetails.kpi_definition || '',
                }));
            }
        } catch (error) {
            console.error('Error selecting KPI:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            console.log(formData);

            // Validate form
            if (!formData.kpi_name) {
                toast({
                    title: "Validation Error",
                    description: "Action plan name is required",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            if (formData.kpi_weight <= 0) {
                toast({
                    title: "Validation Error",
                    description: "Weight must be greater than zero",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            // Only validate assignee when creating a new action plan
            if (!initialData && !formData.assigneeId) {
                toast({
                    title: "Validation Error",
                    description: "Please select an assignee",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            let actionPlanData;

            if (initialData) {
                // If editing, keep the original assignee data
                actionPlanData = {
                    ...(formData.kpi_id && { kpi_id: formData.kpi_id }),
                    kpi_parent_id: parentKPI.kpi_id,
                    kpi_name: formData.kpi_name,
                    kpi_definition: formData.kpi_definition || null,
                    kpi_weight: formData.kpi_weight,
                    kpi_target: formData.kpi_target,
                    kpi_is_ipm: initialData.kpi_is_ipm,
                    kpi_is_action_plan: true,
                    kpi_owner_id: currentUserEmployeeId,
                    kpi_org_unit_id: initialData.kpi_org_unit_id,
                    kpi_employee_id: initialData.kpi_employee_id,
                    kpi_metadata: formData.kpi_metadata
                };
            } else {
                // If creating, use the selected assignee data
                actionPlanData = {
                    kpi_parent_id: parentKPI.kpi_id,
                    kpi_name: formData.kpi_name,
                    kpi_definition: formData.kpi_definition || null,
                    kpi_weight: formData.kpi_weight,
                    kpi_target: formData.kpi_target,
                    kpi_is_ipm: formData.assignType === 'Employee',
                    kpi_is_action_plan: true,
                    kpi_owner_id: currentUserEmployeeId,
                    kpi_org_unit_id: formData.assignType === 'Unit' ? formData.assigneeId : null,
                    kpi_employee_id: formData.assignType === 'Employee' ? formData.assigneeId : null,
                    kpi_metadata: formData.kpi_metadata
                };
            }

            // Call parent's onSave with the form data
            await onSave(actionPlanData);
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

    // Filter KPIs based on search term
    const filteredKPIs = availableKPIs.filter(kpi =>
        kpi.kpi_name.toLowerCase().includes(kpiSearchTerm.toLowerCase())
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
                        {/* KPI Selection */}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                                Select Existing KPI
                            </Label>
                            <div className="col-span-3">
                                <Combobox
                                    options={filteredKPIs.map(kpi => ({
                                        value: kpi.kpi_id,
                                        label: kpi.kpi_name
                                    }))}
                                    value={null}
                                    onChange={(value: string | number) => handleKPISelection(Number(value))}
                                    placeholder="Search for a KPI..."
                                    searchPlaceholder="Search KPIs..."
                                    searchValue={kpiSearchTerm}
                                    onSearchChange={setKpiSearchTerm}
                                    emptyMessage="No KPIs found"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional: Select an existing KPI to use its name and definition
                                </p>
                            </div>
                        </div>

                        {/* Action Plan Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="kpi_name" className="text-right">
                                KPI *
                            </Label>
                            <Input
                                id="kpi_name"
                                name="kpi_name"
                                value={formData.kpi_name}
                                onChange={handleInputChange}
                                className="col-span-3"
                                required
                                disabled
                            />
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="kpi_definition" className="text-right">
                                KPI Definition
                            </Label>
                            <Textarea
                                id="kpi_definition"
                                name="kpi_definition"
                                value={formData.kpi_definition}
                                onChange={handleInputChange}
                                className="col-span-3"
                                rows={3}
                                disabled
                            />
                        </div>

                        {/* Weight */}
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

                        {/* Target Value */}
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

                        {/* Assign To - only show when creating a new action plan */}
                        {!initialData && (
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
                        )}
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : initialData ? 'Update' : 'Create'} Action Plan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ActionPlanEditDialog;