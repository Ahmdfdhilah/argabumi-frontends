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
    Building2,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    Clock,
    PlusCircle,
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
import organizationUnitService, { 
    OrganizationUnitResponse,
} from '@/services/organizationUnitService';
import { useParams, useNavigate } from 'react-router-dom';

const OrganizationUnitDetailsPage = () => {
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
    const [orgUnit, setOrgUnit] = useState<OrganizationUnitResponse | null>(null);
    const [parentUnit, setParentUnit] = useState<OrganizationUnitResponse | null>(null);
    const [childUnits, setChildUnits] = useState<OrganizationUnitResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch organization unit details
    useEffect(() => {
        const fetchOrgUnitDetails = async () => {
            if (id && !isNaN(Number(id))) {
                setIsLoading(true);
                setError(null);
                try {
                    // Fetch the unit with its children
                    const unitWithChildren = await organizationUnitService.getOrganizationUnitWithChildren(Number(id));
                    setOrgUnit(unitWithChildren);
                    setChildUnits(unitWithChildren.children);
                    
                    // If there's a parent, fetch it
                    if (unitWithChildren.org_unit_parent_id) {
                        try {
                            const parent = await organizationUnitService.getOrganizationUnitById(unitWithChildren.org_unit_parent_id);
                            setParentUnit(parent);
                        } catch (error) {
                            console.error('Failed to fetch parent unit:', error);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch organization unit:', error);
                    setError('Failed to fetch organization unit details. The unit might have been deleted or you do not have access.');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchOrgUnitDetails();
    }, [id]);

    const handleDelete = async () => {
        if (!orgUnit) return;
        
        if (window.confirm(`Are you sure you want to delete ${orgUnit.org_unit_name}? This will also affect all child units.`)) {
            try {
                await organizationUnitService.deleteOrganizationUnit(orgUnit.org_unit_id);
                navigate('/performance-management/organization-units');
            } catch (error) {
                console.error('Failed to delete organization unit:', error);
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
                            items={[{ name: 'Organization Units', href: '/organization-units' }]}
                            currentPage="Unit Details"
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
                                <p>Loading organization unit details...</p>
                            </div>
                        ) : orgUnit ? (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8">
                                    <div className="flex items-center">
                                        <Building2 className="h-8 w-8 mr-3 text-[#1B6131] dark:text-[#46B749]" />
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {orgUnit.org_unit_name}
                                            </h1>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {orgUnit.org_unit_code} · {orgUnit.org_unit_type} · Level {orgUnit.org_unit_level}
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
                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                            onClick={() => navigate(`/performance-management/organization-units/${orgUnit.org_unit_id}/edit`)}
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
                                        <TabsTrigger value="children" className="data-[state=active]:text-[#1B6131] data-[state=active]:border-[#1B6131] dark:data-[state=active]:text-[#46B749] dark:data-[state=active]:border-[#46B749]">
                                            Child Units ({childUnits.length})
                                        </TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="details">
                                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                                <CardTitle className="text-gray-700 dark:text-gray-200">
                                                    Organization Unit Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <Table>
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell className="font-medium w-1/3">ID</TableCell>
                                                                    <TableCell>{orgUnit.org_unit_id}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Code</TableCell>
                                                                    <TableCell>{orgUnit.org_unit_code}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Name</TableCell>
                                                                    <TableCell>{orgUnit.org_unit_name}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Type</TableCell>
                                                                    <TableCell>{orgUnit.org_unit_type}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Level</TableCell>
                                                                    <TableCell>{orgUnit.org_unit_level}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="font-medium">Status</TableCell>
                                                                    <TableCell>
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            orgUnit.is_active 
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                        }`}>
                                                                            {orgUnit.is_active ? 'Active' : 'Inactive'}
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
                                                                    <TableCell className="font-medium w-1/3">Parent Unit</TableCell>
                                                                    <TableCell>                                                                    {parentUnit ? (
                                                                        <div className="flex items-center">
                                                                            <Building2 className="h-4 w-4 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                                                                            <span 
                                                                                className="text-[#1B6131] dark:text-[#46B749] hover:underline cursor-pointer"
                                                                                onClick={() => navigate(`/performance-management/organization-units/${parentUnit.org_unit_id}`)}
                                                                            >
                                                                                {parentUnit.org_unit_name}
                                                                            </span>
                                                                        </div>
                                                                    ) : 'None'}
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="font-medium">Description</TableCell>
                                                                <TableCell>{orgUnit.org_unit_description || 'N/A'}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="font-medium">Path</TableCell>
                                                                <TableCell>{orgUnit.org_unit_path}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="font-medium">Created At</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center">
                                                                        <Calendar className="h-4 w-4 mr-2" />
                                                                        {formatDate(orgUnit.created_at)}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="font-medium">Updated At</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center">
                                                                        <Clock className="h-4 w-4 mr-2" />
                                                                        {orgUnit.updated_at ? formatDate(orgUnit.updated_at) : 'N/A'}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="children">
                                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-gray-700 dark:text-gray-200">
                                                        Child Organization Units
                                                    </CardTitle>
                                                    <Button
                                                        className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                                        onClick={() => navigate(`/performance-management/organization-units/add?parent_id=${orgUnit.org_unit_id}`)}
                                                    >
                                                        <PlusCircle className="h-4 w-4 mr-2" />
                                                        Add Child Unit
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                {childUnits.length > 0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Code</TableHead>
                                                                <TableHead>Name</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Level</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {childUnits.map((unit) => (
                                                                <TableRow key={unit.org_unit_id}>
                                                                    <TableCell>{unit.org_unit_code}</TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center">
                                                                            <Building2 className="h-4 w-4 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                                                                            <span 
                                                                                className="text-[#1B6131] dark:text-[#46B749] hover:underline cursor-pointer"
                                                                                onClick={() => navigate(`/performance-management/organization-units/${unit.org_unit_id}`)}
                                                                            >
                                                                                {unit.org_unit_name}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>{unit.org_unit_type}</TableCell>
                                                                    <TableCell>{unit.org_unit_level}</TableCell>
                                                                    <TableCell>
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            unit.is_active 
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                        }`}>
                                                                            {unit.is_active ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-[#1B6131] hover:text-[#144d27] dark:text-[#46B749] dark:hover:text-[#3da33f]"
                                                                            onClick={() => navigate(`/performance-management/organization-units/${unit.org_unit_id}/details`)}
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
                                                        <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                                            No child units found
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                            This organization unit doesn't have any child units yet.
                                                        </p>
                                                        <Button
                                                            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                                            onClick={() => navigate(`/performance-management/organization-units/add?parent_id=${orgUnit.org_unit_id}`)}
                                                        >
                                                            <PlusCircle className="h-4 w-4 mr-2" />
                                                            Add Child Unit
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </>
                        ) : (
                            <Alert variant="destructive" className="mt-8">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Not Found</AlertTitle>
                                <AlertDescription>
                                    The requested organization unit could not be found.
                                </AlertDescription>
                            </Alert>
                        )}
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default OrganizationUnitDetailsPage;