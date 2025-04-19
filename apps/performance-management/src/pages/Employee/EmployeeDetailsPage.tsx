import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { 
    User,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    Mail,
    Phone,
    Building2,
    UsersRound,
    Briefcase,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@workspace/ui/components/alert";
import Footer from '@/components/Footer';
import employeeService, { 
    Employee,
    EmployeeWithKPIs,
    EmployeeWithSubmissions,
} from '@/services/employeeService';
import { useParams, useNavigate } from 'react-router-dom';

const EmployeeDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [employeeKPIs, setEmployeeKPIs] = useState<EmployeeWithKPIs | null>(null);
    const [employeeSubmissions, setEmployeeSubmissions] = useState<EmployeeWithSubmissions | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch employee details
    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            if (id && !isNaN(Number(id))) {
                setIsLoading(true);
                setError(null);
                try {
                    // Fetch the employee with details
                    const employeeDetails = await employeeService.getEmployeeWithDetails(Number(id));
                    setEmployee(employeeDetails);
                    
                    // Fetch KPIs
                    try {
                        const kpis = await employeeService.getEmployeeKPIs(Number(id));
                        setEmployeeKPIs(kpis);
                    } catch (error) {
                        console.error('Failed to fetch employee KPIs:', error);
                    }
                    
                    // Fetch submissions
                    try {
                        const submissions = await employeeService.getEmployeeSubmissions(Number(id));
                        setEmployeeSubmissions(submissions);
                    } catch (error) {
                        console.error('Failed to fetch employee submissions:', error);
                    }
                } catch (error) {
                    console.error('Failed to fetch employee:', error);
                    setError('Failed to fetch employee details. The employee might have been deleted or you do not have access.');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchEmployeeDetails();
    }, [id]);

    const handleDelete = async () => {
        if (!employee) return;
        
        if (window.confirm(`Are you sure you want to delete ${employee.employee_name}?`)) {
            try {
                await employeeService.deleteEmployee(employee.employee_id);
                navigate('/performance-management/employees');
            } catch (error) {
                console.error('Failed to delete employee:', error);
            }
        }
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                            items={[{ name: 'Employees', href: '/performance-management/employees' }]}
                            currentPage="Employee Details"
                            showHomeIcon={true}
                        /> */}

                        {error ? (
                            <Alert variant="destructive" className="mt-8">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <p>Loading employee details...</p>
                            </div>
                        ) : employee ? (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8">
                                    <div className="flex items-center">
                                        <User className="h-8 w-8 mr-3 text-[#1B6131] dark:text-[#46B749]" />
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {employee.employee_name}
                                            </h1>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {employee.employee_number} · {employee.employee_position || 'No Position'} · {employee.org_unit_name || 'No Department'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            className="border-[#1B6131] text-[#1B6131] hover:bg-[#f0f9f0] dark:border-[#46B749] dark:text-[#46B749] dark:hover:bg-[#0a2e14]"
                                            onClick={() => navigate(-1)}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-[#1B6131] text-[#1B6131] hover:bg-[#f0f9f0] dark:border-[#46B749] dark:text-[#46B749] dark:hover:bg-[#0a2e14]"
                                            onClick={() => navigate(`/performance-management/employees/${employee.employee_id}/hierarchy`)}
                                        >
                                            <UsersRound className="h-4 w-4 mr-2" />
                                            View Hierarchy
                                        </Button>
                                        <Button
                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                            onClick={() => navigate(`/performance-management/employees/${employee.employee_id}/edit`)}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                <Tabs defaultValue="details" className="mt-6">
                                    <TabsList className="border-b border-gray-200 dark:border-gray-700 w-full bg-transparent mb-4">
                                        <TabsTrigger value="details" className="data-[state=active]:text-[#1B6131] data-[state=active]:border-[#1B6131] dark:data-[state=active]:text-[#46B749] dark:data-[state=active]:border-[#46B749]">
                                            Details
                                        </TabsTrigger>
                                        <TabsTrigger value="kpis" className="data-[state=active]:text-[#1B6131] data-[state=active]:border-[#1B6131] dark:data-[state=active]:text-[#46B749] dark:data-[state=active]:border-[#46B749]">
                                            KPIs
                                        </TabsTrigger>
                                        <TabsTrigger value="submissions" className="data-[state=active]:text-[#1B6131] data-[state=active]:border-[#1B6131] dark:data-[state=active]:text-[#46B749] dark:data-[state=active]:border-[#46B749]">
                                            Submissions
                                        </TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="details">
                                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                                <CardTitle className="text-gray-700 dark:text-gray-200">
                                                    Employee Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <Table>
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell className="font-medium w-1/3">ID</TableCell>
                                                                    <TableCell>{employee.employee_id}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Employee Number</TableCell>
                                                                    <TableCell>{employee.employee_number}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Name</TableCell>
                                                                    <TableCell>{employee.employee_name}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Position</TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center">
                                                                            <Briefcase className="h-4 w-4 mr-2" />
                                                                            {employee.employee_position || 'Not specified'}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Status</TableCell>
                                                                    <TableCell>
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            employee.is_active 
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                        }`}>
                                                                            {employee.is_active ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                    
                                                    <div>
                                                        <Table>
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell className="font-medium w-1/3">Email</TableCell>
                                                                    <TableCell>
                                                                        {employee.employee_email ? (
                                                                            <div className="flex items-center">
                                                                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                                                                <a href={`mailto:${employee.employee_email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                                                                    {employee.employee_email}
                                                                                </a>
                                                                            </div>
                                                                        ) : 'Not specified'}
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Phone</TableCell>
                                                                    <TableCell>
                                                                        {employee.employee_phone ? (
                                                                            <div className="flex items-center">
                                                                                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                                                                <a href={`tel:${employee.employee_phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                                                                    {employee.employee_phone}
                                                                                </a>
                                                                            </div>
                                                                        ) : 'Not specified'}
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Organization Unit</TableCell>
                                                                    <TableCell>
                                                                        {employee.employee_org_unit_id && employee.org_unit_name ? (
                                                                            <div className="flex items-center">
                                                                                <Building2 className="h-4 w-4 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                                                                                <span 
                                                                                    className="text-[#1B6131] dark:text-[#46B749] hover:underline cursor-pointer"
                                                                                    onClick={() => navigate(`/performance-management/organization-units/${employee.employee_org_unit_id}`)}
                                                                                >
                                                                                    {employee.org_unit_name}
                                                                                </span>
                                                                            </div>
                                                                        ) : 'Not assigned'}
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Supervisor</TableCell>
                                                                    <TableCell>
                                                                        {employee.employee_supervisor_id && employee.supervisor_name ? (
                                                                            <div className="flex items-center">
                                                                                <User className="h-4 w-4 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                                                                                <span 
                                                                                    className="text-[#1B6131] dark:text-[#46B749] hover:underline cursor-pointer"
                                                                                    onClick={() => navigate(`/performance-management/employees/${employee.employee_supervisor_id}`)}
                                                                                >
                                                                                    {employee.supervisor_name}
                                                                                </span>
                                                                            </div>
                                                                        ) : 'No supervisor'}
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Created At</TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center">
                                                                            <Calendar className="h-4 w-4 mr-2" />
                                                                            {formatDate(employee.created_at)}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                                
                                                {employee.employee_metadata && Object.keys(employee.employee_metadata).length > 0 && (
                                                    <div className="mt-6">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                                            Additional Metadata
                                                        </h3>
                                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                                                            <pre className="whitespace-pre-wrap font-mono text-sm">
                                                                {JSON.stringify(employee.employee_metadata, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="kpis">
                                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-gray-700 dark:text-gray-200">
                                                        Key Performance Indicators
                                                    </CardTitle>
                                                    <Button
                                                        className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                                        onClick={() => navigate(`/performance-management/employees/${employee.employee_id}/kpis/add`)}
                                                    >
                                                        Add KPI
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <Tabs defaultValue="individual" className="mt-2">
                                                    <TabsList className="border-b border-gray-200 dark:border-gray-700 w-full bg-transparent mb-4">
                                                        <TabsTrigger value="individual" className="data-[state=active]:text-[#1B6131] data-[state=active]:border-[#1B6131] dark:data-[state=active]:text-[#46B749] dark:data-[state=active]:border-[#46B749]">
                                                            Individual KPIs ({employeeKPIs?.individual_kpis.length || 0})
                                                        </TabsTrigger>
                                                        <TabsTrigger value="owned" className="data-[state=active]:text-[#1B6131] data-[state=active]:border-[#1B6131] dark:data-[state=active]:text-[#46B749] dark:data-[state=active]:border-[#46B749]">
                                                            Owned KPIs ({employeeKPIs?.owned_kpis.length || 0})
                                                        </TabsTrigger>
                                                    </TabsList>
                                                    
                                                    <TabsContent value="individual">
                                                        {employeeKPIs?.individual_kpis && employeeKPIs.individual_kpis.length > 0 ? (
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Title</TableHead>
                                                                        <TableHead>Description</TableHead>
                                                                        <TableHead>Target</TableHead>
                                                                        <TableHead>Weight</TableHead>
                                                                        <TableHead className="text-right">Actions</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {employeeKPIs.individual_kpis.map((kpi) => (
                                                                        <TableRow key={kpi.kpi_id}>
                                                                            <TableCell className="font-medium">{kpi.kpi_title}</TableCell>
                                                                            <TableCell>{kpi.kpi_description || 'N/A'}</TableCell>
                                                                            <TableCell>{kpi.kpi_target !== null ? kpi.kpi_target : 'N/A'}</TableCell>
                                                                            <TableCell>{kpi.kpi_weight !== null ? `${kpi.kpi_weight}%` : 'N/A'}</TableCell>
                                                                            <TableCell className="text-right">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="text-[#1B6131] hover:text-[#144d27] dark:text-[#46B749] dark:hover:text-[#3da33f]"
                                                                                    onClick={() => navigate(`/performance-management/kpis/${kpi.kpi_id}`)}
                                                                                >
                                                                                    View <ChevronRight className="h-4 w-4 ml-1" />
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-12">
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                                                    No individual KPIs found
                                                                </h3>
                                                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                                    This employee doesn't have any individual KPIs assigned yet.
                                                                </p>
                                                                <Button
                                                                    className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                                                    onClick={() => navigate(`/performance-management/employees/${employee.employee_id}/kpis/add`)}
                                                                >
                                                                    Add KPI
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                    
                                                    <TabsContent value="owned">
                                                        {employeeKPIs?.owned_kpis && employeeKPIs.owned_kpis.length > 0 ? (
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Title</TableHead>
                                                                        <TableHead>Description</TableHead>
                                                                        <TableHead>Target</TableHead>
                                                                        <TableHead>Weight</TableHead>
                                                                        <TableHead className="text-right">Actions</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {employeeKPIs.owned_kpis.map((kpi) => (
                                                                        <TableRow key={kpi.kpi_id}>
                                                                            <TableCell className="font-medium">{kpi.kpi_title}</TableCell>
                                                                            <TableCell>{kpi.kpi_description || 'N/A'}</TableCell>
                                                                            <TableCell>{kpi.kpi_target !== null ? kpi.kpi_target : 'N/A'}</TableCell>
                                                                            <TableCell>{kpi.kpi_weight !== null ? `${kpi.kpi_weight}%` : 'N/A'}</TableCell>
                                                                            <TableCell className="text-right">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="text-[#1B6131] hover:text-[#144d27] dark:text-[#46B749] dark:hover:text-[#3da33f]"
                                                                                    onClick={() => navigate(`/performance-management/kpis/${kpi.kpi_id}`)}
                                                                                >
                                                                                    View <ChevronRight className="h-4 w-4 ml-1" />
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-12">
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                                                    No owned KPIs found
                                                                </h3>
                                                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                                    This employee doesn't own any KPIs yet.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                </Tabs>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="submissions">
                                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                                <CardTitle className="text-gray-700 dark:text-gray-200">
                                                    Performance Submissions
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                {employeeSubmissions?.submissions && employeeSubmissions.submissions.length > 0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>ID</TableHead>
                                                                <TableHead>Title</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Submission Date</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {employeeSubmissions.submissions.map((submission) => (
                                                                <TableRow key={submission.submission_id}>
                                                                    <TableCell>{submission.submission_id}</TableCell>
                                                                    <TableCell className="font-medium">{submission.submission_title}</TableCell>
                                                                    <TableCell>
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            submission.submission_status === 'Completed' 
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                                                : submission.submission_status === 'In Progress'
                                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                        }`}>
                                                                            {submission.submission_status}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>{formatDate(submission.submission_date)}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-[#1B6131] hover:text-[#144d27] dark:text-[#46B749] dark:hover:text-[#3da33f]"
                                                                            onClick={() => navigate(`/performance-management/submissions/${submission.submission_id}`)}
                                                                        >
                                                                            View <ChevronRight className="h-4 w-4 ml-1" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-12">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                                            No submissions found
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                            This employee has not made any performance submissions yet.
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                                </>
                        ) : (
                            <div className="flex justify-center items-center h-64">
                                <p>Employee not found</p>
                            </div>
                        )}
                    </main>
                    
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailsPage;