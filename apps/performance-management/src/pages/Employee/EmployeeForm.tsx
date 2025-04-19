import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
// import { Textarea } from "@workspace/ui/components/textarea";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
    User,
    Mail,
    Phone,
    Building2,
    Users2,
    Briefcase,
    Save,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@workspace/ui/components/alert";
import employeeService, {
    Employee,
    CreateEmployeeData,
    UpdateEmployeeData
} from '@/services/employeeService';
import organizationUnitService from '@/services/organizationUnitService';
import Loader from '@workspace/ui/components/ui/loading';

interface OrgUnit {
    org_unit_id: number;
    org_unit_name: string;
}


const EmployeeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<CreateEmployeeData | UpdateEmployeeData>({
        employee_number: '',
        employee_name: '',
        employee_email: '',
        employee_phone: '',
        employee_position: '',
        employee_org_unit_id: undefined,
        employee_supervisor_id: undefined,
        is_active: true,
        employee_metadata: {}
    });

    // Options for dropdowns
    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
    const [supervisors, setSupervisors] = useState<Employee[]>([]);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch org units
                const orgUnitsData = await organizationUnitService.getOrganizationUnits(0, 100);
                setOrgUnits(orgUnitsData.map(unit => ({
                    org_unit_id: unit.org_unit_id,
                    org_unit_name: unit.org_unit_name
                })));

                // Fetch potential supervisors (filter to only include active employees)
                const employees = await employeeService.getEmployees(0, 100);
                const potentialSupervisors = employees.filter(emp => emp.is_active);
                setSupervisors(potentialSupervisors);

                // If in edit mode, fetch employee data
                if ( id) {
                    const employeeId = Number(id);
                    const employeeData = await employeeService.getEmployeeWithDetails(employeeId);

                    // Populate form with employee data
                    setFormData({
                        employee_number: employeeData.employee_number,
                        employee_name: employeeData.employee_name,
                        employee_email: employeeData.employee_email || '',
                        employee_phone: employeeData.employee_phone || '',
                        employee_position: employeeData.employee_position || '',
                        employee_org_unit_id: employeeData.employee_org_unit_id ?? undefined,
                        employee_supervisor_id: employeeData.employee_supervisor_id ?? undefined,
                        is_active: employeeData.is_active,
                        employee_metadata: employeeData.employee_metadata || {}
                    });
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Handle numeric fields
        if (name === 'employee_org_unit_id' || name === 'employee_supervisor_id') {
            setFormData(prev => ({
                ...prev,
                [name]: value ? parseInt(value) : undefined
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_active: checked
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (id) {
                // Update existing employee
                await employeeService.updateEmployee(Number(id), formData as UpdateEmployeeData);
            } else {
                // Create new employee
                await employeeService.createEmployee(formData as CreateEmployeeData);
            }

            // Redirect back to employee list
            navigate('/performance-management/employees');
        } catch (err) {
            console.error("Error submitting form:", err);
            setError("Failed to save employee data. Please check the form and try again.");
        } finally {
            setIsSubmitting(false);
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
                            items={[
                                { label: 'Employees', path: '/performance-management/employees' },
                                { label: isEditMode ? 'Edit Employee' : 'Create Employee' }
                            ]}
                        /> */}

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <Card className="mb-4">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            {id ? 'Edit Employee' : 'Create New Employee'}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {error && (
                                            <div className="col-span-full">
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>Error</AlertTitle>
                                                    <AlertDescription>{error}</AlertDescription>
                                                </Alert>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_number">Employee Number *</Label>
                                            <Input
                                                id="employee_number"
                                                name="employee_number"
                                                value={formData.employee_number}
                                                onChange={handleInputChange}
                                                required
                                                disabled={id?true:false}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_name">Full Name *</Label>
                                            <Input
                                                id="employee_name"
                                                name="employee_name"
                                                value={formData.employee_name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="employee_email"
                                                    name="employee_email"
                                                    type="email"
                                                    value={formData.employee_email}
                                                    onChange={handleInputChange}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_phone">Phone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="employee_phone"
                                                    name="employee_phone"
                                                    type="tel"
                                                    value={formData.employee_phone}
                                                    onChange={handleInputChange}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_position">Position</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="employee_position"
                                                    name="employee_position"
                                                    value={formData.employee_position}
                                                    onChange={handleInputChange}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_org_unit_id">Organization Unit</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <select
                                                    id="employee_org_unit_id"
                                                    name="employee_org_unit_id"
                                                    value={formData.employee_org_unit_id || ''}
                                                    onChange={handleInputChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                                                >
                                                    <option value="">Select Organization Unit</option>
                                                    {orgUnits.map(unit => (
                                                        <option key={unit.org_unit_id} value={unit.org_unit_id}>
                                                            {unit.org_unit_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_supervisor_id">Supervisor</Label>
                                            <div className="relative">
                                                <Users2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <select
                                                    id="employee_supervisor_id"
                                                    name="employee_supervisor_id"
                                                    value={formData.employee_supervisor_id || ''}
                                                    onChange={handleInputChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                                                >
                                                    <option value="">Select Supervisor</option>
                                                    {supervisors.map(supervisor => (
                                                        <option key={supervisor.employee_id} value={supervisor.employee_id}>
                                                            {supervisor.employee_name} ({supervisor.employee_number})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* <div className="space-y-2">
                                            <Label htmlFor="employee_metadata">Additional Information</Label>
                                            <Textarea
                                                id="employee_metadata"
                                                name="employee_metadata"
                                                value={JSON.stringify(formData.employee_metadata || {})}
                                                onChange={handleInputChange}
                                                placeholder="Enter additional information as JSON"
                                            />
                                        </div> */}

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={handleCheckboxChange}
                                            />
                                            <Label htmlFor="is_active">Active Employee</Label>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => navigate('/performance-management/employees')}
                                            disabled={isSubmitting}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader text='processing...' />
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {id ? 'Update Employee' : 'Create Employee'}
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>
                        )}
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default EmployeeForm;