import { useState, useEffect } from 'react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
    Building2,
    Save,
    X,
    ArrowLeft,
    User
} from 'lucide-react';
// import Breadcrumb from '@/components/Breadcrumb';
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@workspace/ui/components/select";
import {
    Textarea
} from "@workspace/ui/components/textarea";
import {
    Switch
} from "@workspace/ui/components/switch";
import Footer from '@/components/Footer';
import organizationUnitService, {
    OrganizationUnitResponse,
    OrganizationUnitCreate,
    OrganizationUnitUpdate
} from '@/services/organizationUnitService';
import employeeService, { Employee } from '@/services/employeeService';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const OrganizationUnitForm = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const parent = searchParams.get('parent');
    const { id } = params;
    const isEditMode = Boolean(id);

    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [parentUnit, setParentUnit] = useState<OrganizationUnitResponse | null>(null);
    const [availableParents, setAvailableParents] = useState<OrganizationUnitResponse[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [searchTerm, _] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState<OrganizationUnitCreate | OrganizationUnitUpdate>({
        org_unit_code: '',
        org_unit_name: '',
        org_unit_type: 'Division',
        org_unit_head_id: null,
        org_unit_parent_id: null,
        org_unit_level: 1,
        org_unit_description: '',
        org_unit_metadata: {},
        is_active: true
    });

    // Fetch available organization units for parent selection
    useEffect(() => {
        const fetchOrganizationUnits = async () => {
            try {
                const data = await organizationUnitService.getOrganizationUnits(0, 100);
                setAvailableParents(data);
            } catch (error) {
                console.error('Failed to fetch organization units:', error);
            }
        };

        fetchOrganizationUnits();
    }, []);

    // Fetch employees for unit head selection
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await employeeService.getEmployees(0, 20);
                setEmployees(data);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    // If editing, fetch the organization unit details
    useEffect(() => {
        const fetchOrganizationUnit = async () => {
            if (id && !isNaN(Number(id))) {
                setIsLoading(true);
                try {
                    const data = await organizationUnitService.getOrganizationUnitById(Number(id));
                    setFormData({
                        org_unit_code: data.org_unit_code,
                        org_unit_name: data.org_unit_name,
                        org_unit_type: data.org_unit_type,
                        org_unit_head_id: data.org_unit_head_id,
                        org_unit_parent_id: data.org_unit_parent_id,
                        org_unit_level: data.org_unit_level,
                        org_unit_description: data.org_unit_description || '',
                        org_unit_metadata: data.org_unit_metadata || {},
                        is_active: data.is_active
                    });

                    // Fetch parent if exists
                    if (data.org_unit_parent_id) {
                        try {
                            const parentData = await organizationUnitService.getOrganizationUnitById(data.org_unit_parent_id);
                            setParentUnit(parentData);
                        } catch (error) {
                            console.error('Failed to fetch parent unit:', error);
                        }
                    }

                    // Fetch unit head if exists
                    if (data.org_unit_head_id) {
                        try {
                            const headData = await employeeService.getEmployeeById(data.org_unit_head_id);
                            setSelectedEmployee(headData);
                        } catch (error) {
                            console.error('Failed to fetch unit head:', error);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch organization unit:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchOrganizationUnit();
    }, [id]);

    // If creating with parent specified, fetch the parent details
    useEffect(() => {
        const fetchParentUnit = async () => {
            if (parent && !isNaN(Number(parent)) && !isEditMode) {
                try {
                    const data = await organizationUnitService.getOrganizationUnitById(Number(parent));
                    setParentUnit(data);
                    setFormData(prev => ({
                        ...prev,
                        org_unit_parent_id: data.org_unit_id,
                        org_unit_level: data.org_unit_level + 1
                    }));
                } catch (error) {
                    console.error('Failed to fetch parent unit:', error);
                }
            }
        };

        fetchParentUnit();
    }, [parent, isEditMode]);

    // Handle employee search
    useEffect(() => {
        const searchEmployees = async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    const results = await employeeService.searchEmployees(searchTerm, 10);
                    setEmployees(results);
                } catch (error) {
                    console.error('Failed to search employees:', error);
                } finally {
                    setIsSearching(false);
                }
            } else if (searchTerm === '') {
                // Reset to default list if search term is cleared
                try {
                    const data = await employeeService.getEmployees(0, 20);
                    setEmployees(data);
                } catch (error) {
                    console.error('Failed to fetch employees:', error);
                }
            }
        };

        // Debounce search
        const handler = setTimeout(() => {
            searchEmployees();
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleParentChange = async (value: string) => {
        if (value === "null") {
            setFormData(prev => ({
                ...prev,
                org_unit_parent_id: null,
                org_unit_level: 1
            }));
            setParentUnit(null);
        } else {
            const parentId = Number(value);
            try {
                const data = await organizationUnitService.getOrganizationUnitById(parentId);
                setParentUnit(data);
                setFormData(prev => ({
                    ...prev,
                    org_unit_parent_id: parentId,
                    org_unit_level: data.org_unit_level + 1
                }));
            } catch (error) {
                console.error('Failed to fetch parent unit:', error);
            }
        }
    };

    const handleUnitHeadChange = async (value: string) => {
        if (value === "null") {
            setFormData(prev => ({
                ...prev,
                org_unit_head_id: null
            }));
            setSelectedEmployee(null);
        } else {
            const employeeId = Number(value);
            try {
                const data = await employeeService.getEmployeeById(employeeId);
                setSelectedEmployee(data);
                setFormData(prev => ({
                    ...prev,
                    org_unit_head_id: employeeId
                }));
            } catch (error) {
                console.error('Failed to fetch employee details:', error);
            }
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_active: checked
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (isEditMode) {
                await organizationUnitService.updateOrganizationUnit(
                    Number(id),
                    formData as OrganizationUnitUpdate
                );
            } else {
                await organizationUnitService.createOrganizationUnit(
                    formData as OrganizationUnitCreate
                );
            }
            // Redirect back to the organization units list
            navigate('/performance-management/organization-units');
        } catch (error) {
            console.error('Failed to save organization unit:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />

            <div className="flex">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}

                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        {/* <Breadcrumb
                            items={[{ name: 'Organization Units', href: '/performance-management/organization-units' }]}
                            currentPage={isEditMode ? 'Edit Organization Unit' : 'Create Organization Unit'}
                            showHomeIcon={true}
                        /> */}

                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md mt-8">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="text-gray-700 dark:text-gray-200 flex items-center p-0">
                                        <Building2 className="h-5 w-5 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                                        {isEditMode ? 'Edit Organization Unit' : 'Create New Organization Unit'}
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        className="border-[#1B6131] text-[#1B6131] hover:bg-[#f0f9f0] dark:border-[#46B749] dark:text-[#46B749] dark:hover:bg-[#0a2e14]"
                                        onClick={() => navigate('/performance-management/organization-units')}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                </div>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="p-6">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <p>Loading organization unit data...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="org_unit_code">Unit Code <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="org_unit_code"
                                                        name="org_unit_code"
                                                        placeholder="Enter unit code"
                                                        value={formData.org_unit_code}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500">A unique identifier for this organization unit</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="org_unit_name">Unit Name <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="org_unit_name"
                                                        name="org_unit_name"
                                                        placeholder="Enter unit name"
                                                        value={formData.org_unit_name}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="org_unit_type">Unit Type <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="org_unit_type"
                                                        name="org_unit_type"
                                                        placeholder="Enter unit type"
                                                        value={formData.org_unit_type}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="org_unit_parent_id">Parent Unit</Label>
                                                    <Select
                                                        value={formData.org_unit_parent_id?.toString() || "null"}
                                                        onValueChange={handleParentChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select parent unit (optional)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="null">None (Root Level)</SelectItem>
                                                            {availableParents.map((unit) => (
                                                                <SelectItem key={unit.org_unit_id} value={unit.org_unit_id.toString()}>
                                                                    {unit.org_unit_name} ({unit.org_unit_code})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {parentUnit && (
                                                        <p className="text-xs text-gray-500">
                                                            Parent: {parentUnit.org_unit_name} (Level {parentUnit.org_unit_level})
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="org_unit_head_id">Unit Head</Label>
                                                    <div className="space-y-2">
                                                        <Select
                                                            value={formData.org_unit_head_id?.toString() || "null"}
                                                            onValueChange={handleUnitHeadChange}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select unit head (optional)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="null">None</SelectItem>
                                                                {isSearching ? (
                                                                    <div className="p-2 text-center text-sm text-gray-500">
                                                                        Searching...
                                                                    </div>
                                                                ) : employees.length === 0 ? (
                                                                    <div className="p-2 text-center text-sm text-gray-500">
                                                                        No employees found
                                                                    </div>
                                                                ) : (
                                                                    employees.map((employee) => (
                                                                        <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                                                                            {employee.employee_name} ({employee.employee_number})
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {selectedEmployee && (
                                                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-gray-500" />
                                                                <div>
                                                                    <p className="text-sm font-medium">{selectedEmployee.employee_name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {selectedEmployee.employee_position || 'No position'}
                                                                        {selectedEmployee.employee_email ? ` • ${selectedEmployee.employee_email}` : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="org_unit_level">Unit Level <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="org_unit_level"
                                                        name="org_unit_level"
                                                        type="number"
                                                        min="1"
                                                        value={formData.org_unit_level}
                                                        onChange={handleInputChange}
                                                        disabled={true}
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500">Level is automatically determined based on parent</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="org_unit_description">Description</Label>
                                                    <Textarea
                                                        id="org_unit_description"
                                                        name="org_unit_description"
                                                        placeholder="Enter unit description"
                                                        value={formData.org_unit_description || ''}
                                                        onChange={handleInputChange}
                                                        className="min-h-[120px]"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="is_active">Status</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id="is_active"
                                                                checked={formData.is_active}
                                                                onCheckedChange={handleSwitchChange}
                                                            />
                                                            <span className={`text-sm ${formData.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {formData.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Inactive units will not appear in active hierarchy views</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        onClick={() => navigate(-1)}
                                        disabled={isSaving}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                        disabled={isSaving}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? 'Saving...' : isEditMode ? 'Update Unit' : 'Create Unit'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default OrganizationUnitForm;