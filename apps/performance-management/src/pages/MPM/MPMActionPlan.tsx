import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Edit, Eye, Info, PlusCircle, Trash2, Search } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';
import KPIDetailsCard from '@/components/KPIDetails';
import { useToast } from '@workspace/ui/components/sonner';
import { useAppSelector } from '@/redux/hooks';
import { kpiDefinitionService } from '@/services/kpiDefinitionService';
import ActionPlanEditDialog from '@/components/MPM/ActionPlanEditDialog';


// Types based on imported services
type KPIDefinitionResponse = any; // Use the actual type from kpiDefinitionService
type ActionPlanData = any; // Define the structure based on your requirements

const MPMActionPlan: React.FC = () => {
    const { submissionId, kpiId } = useParams<{ submissionId: string, kpiId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Get current user data from Redux store
    const { user } = useAppSelector((state: any) => state.auth);
    const currentUserOrgUnitId = user?.org_unit_data?.org_unit_id ?? null;

    // State for KPI data and action plans
    const [parentKPI, setParentKPI] = useState<KPIDefinitionResponse | null>(null);
    const [actionPlans, setActionPlans] = useState<ActionPlanData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for UI and dialogs
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAddActionPlanDialogOpen, setIsAddActionPlanDialogOpen] = useState(false);
    const [isEditActionPlanDialogOpen, setIsEditActionPlanDialogOpen] = useState(false);
    const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlanData | null>(null);

    // Authorization state
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    // Pagination and filtering state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('All');

    // Fetch parent KPI and action plans
    useEffect(() => {
        const fetchData = async () => {
            if (!kpiId) return;

            try {
                setLoading(true);

                // Fetch parent KPI details
                const kpiData = await kpiDefinitionService.getKPIDefinitionFull(parseInt(kpiId));
                setParentKPI(kpiData);

                // Fetch action plans for this KPI
                const actionPlansData = await kpiDefinitionService.getKPIActionPlans(parseInt(kpiId));
                setActionPlans(actionPlansData);

                // Check authorization based on the KPI's org_unit_id
                setIsAuthorized(kpiData.kpi_org_unit_id === currentUserOrgUnitId);

                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Failed to load KPI data');
                setLoading(false);
            }
        };

        fetchData();
    }, [kpiId, currentUserOrgUnitId]);

    // Apply filters to get filtered data
    const filteredData = useMemo(() => {
        return actionPlans.filter(plan => {
            // Apply search term filter (case insensitive)
            const matchesSearch = searchTerm === '' ||
                (plan.kpi_name && plan.kpi_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (plan.kpi_definition && plan.kpi_definition.toLowerCase().includes(searchTerm.toLowerCase()));

            // Apply assignee filter
            const matchesAssignee = assigneeFilter === 'All' ||
                (assigneeFilter === 'Unit' && plan.kpi_org_unit_id) ||
                (assigneeFilter === 'Employee' && plan.kpi_employee_id);

            return matchesSearch && matchesAssignee;
        });
    }, [actionPlans, searchTerm, assigneeFilter]);

    // Paginate the filtered data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Calculation of totals
    const calculateWeight = useMemo(() => {
        return filteredData.reduce((total, plan) => {
            return total + Number(plan.kpi_weight || 0);
        }, 0);
    }, [filteredData]);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Get unique assignees for filter dropdown
    const assigneeTypes = ["All", "Unit", "Employee"];

    // Handlers for action plans
    const handleAddActionPlan = async (newActionPlan: any) => {
        try {
            const actionPlanData = {
                kpi_parent_id: parseInt(kpiId!),
                kpi_name: newActionPlan.kpi_name,
                kpi_definition: newActionPlan.kpi_definition || null,
                kpi_weight: newActionPlan.kpi_weight,
                kpi_target: newActionPlan.kpi_target,
                kpi_is_ipm:  newActionPlan.assignType === 'Employee' ? true: false,
                kpi_is_action_plan: true,
                kpi_org_unit_id: newActionPlan.assignType === 'Unit' ? newActionPlan.assigneeId : null,
                kpi_employee_id: newActionPlan.assignType === 'Employee' ? newActionPlan.assigneeId : null,
                kpi_metadata: newActionPlan.kpi_metadata || null
            };
            console.log(actionPlanData);
            await kpiDefinitionService.createActionPlan(actionPlanData);     

            // Refresh the action plans list
            const updatedPlans = await kpiDefinitionService.getKPIActionPlans(parseInt(kpiId!));
            setActionPlans(updatedPlans);

            setIsAddActionPlanDialogOpen(false);
            toast({
                title: "Success",
                description: "Action plan created successfully",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || 'Failed to create action plan',
                variant: "destructive",
            });
        }
    };

    const handleEditActionPlan = async (updatedActionPlan: any) => {
        try {
            if (!updatedActionPlan.kpi_id) {
                throw new Error("Action plan ID is missing");
            }

            const actionPlanData = {
                kpi_name: updatedActionPlan.kpi_name,
                kpi_definition: updatedActionPlan.kpi_definition || null,
                kpi_weight: updatedActionPlan.kpi_weight,
                kpi_target: updatedActionPlan.kpi_target,
                kpi_org_unit_id: updatedActionPlan.assignType === 'Unit' ? updatedActionPlan.assigneeId : null,
                kpi_employee_id: updatedActionPlan.assignType === 'Employee' ? updatedActionPlan.assigneeId : null,
                kpi_metadata: updatedActionPlan.kpi_metadata || null
            };

            await kpiDefinitionService.updateKPIDefinition(updatedActionPlan.kpi_id, actionPlanData);

            // Refresh the action plans list
            const updatedPlans = await kpiDefinitionService.getKPIActionPlans(parseInt(kpiId!));
            setActionPlans(updatedPlans);

            setIsEditActionPlanDialogOpen(false);
            toast({
                title: "Success",
                description: "Action plan updated successfully",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || 'Failed to update action plan',
                variant: "destructive",
            });
        }
    };

    const handleDeleteActionPlan = async (actionPlanId: number) => {
        try {
            await kpiDefinitionService.deleteKPIDefinition(actionPlanId);

            // Refresh the action plans list
            const updatedPlans = await kpiDefinitionService.getKPIActionPlans(parseInt(kpiId!));
            setActionPlans(updatedPlans);

            toast({
                title: "Success",
                description: "Action plan deleted successfully",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || 'Failed to delete action plan',
                variant: "destructive",
            });
        }
    };

    const actionButton = (
        <Button
            onClick={() => isAuthorized ? setIsAddActionPlanDialogOpen(true) : null}
            className={`bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f] ${!isAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isAuthorized}
        >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Action Plan
        </Button>
    );

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    if (!parentKPI) {
        return <div className="flex items-center justify-center h-screen">KPI not found</div>;
    }

    return (
        <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />

            <div className="flex flex-col md:flex-row">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        <div className="space-y-6 w-full">
                            <Breadcrumb
                                items={[{
                                    label: 'MPM Targets List',
                                    path: '/performance-management/mpm/target',
                                },
                                {
                                    label: 'MPM Targets',
                                    path: `/performance-management/mpm/target/${submissionId}`,
                                }]}
                                currentPage="Action Plans"
                                subtitle={`Submission ID: ${submissionId} | KPI ID: ${kpiId}`}
                                showHomeIcon={true}
                            />

                            <KPIDetailsCard
                                title="KPI Details"
                                description="Overview of the Key Performance Indicator"
                                kpi={{
                                    name: parentKPI.kpi_name,
                                    perspective: parentKPI.perspective_name,
                                    number: parentKPI.kpi_code,
                                    definition: parentKPI.kpi_definition,
                                    weight: parentKPI.kpi_weight,
                                    uom: parentKPI.kpi_uom,
                                    category: parentKPI.kpi_category,
                                    ytdCalculation: parentKPI.kpi_calculation,
                                    status: parentKPI.kpi_status
                                }}
                                targets={{}} // You might need to adapt this based on your data structure
                                actionButtonComponent={actionButton}
                            />

                            {/* Filter Section */}
                            <Filtering>
                                <div className="space-y-3">
                                    <label htmlFor="searchTerm" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search</span>
                                    </label>
                                    <Input
                                        id="searchTerm"
                                        type="text"
                                        placeholder="Search by action plan name or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Info className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Assignee Type</span>
                                    </label>
                                    <select
                                        value={assigneeFilter}
                                        onChange={(e) => setAssigneeFilter(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none text-gray-900 dark:text-gray-100"
                                    >
                                        {assigneeTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </Filtering>

                            {/* Main Card */}
                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                        Action Plans
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='m-0 p-0 pb-8'>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-[#1B6131] text-white">
                                                <tr>
                                                    <th className="p-4 text-center">Actions</th>
                                                    <th className="p-4 text-center">Action Plan</th>
                                                    <th className="p-4 text-center">Target</th>
                                                    <th className="p-4 text-center">Weight</th>
                                                    <th className="p-4 text-center">Assignee Type</th>
                                                    <th className="p-4 text-center">Assignee</th>
                                                    <th className="p-4 text-center">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((plan) => (
                                                    <tr
                                                        key={plan.kpi_id}
                                                        className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"
                                                    >
                                                        <td className="p-4 text-center">
                                                            <div className="flex justify-center space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="hover:text-[#1B6131]"
                                                                    onClick={() => navigate(`/performance-management/mpm/target/${submissionId}/kpi/${kpiId}/action-plans/${plan.kpi_id}`)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                {isAuthorized && (
                                                                    <>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                setSelectedActionPlan(plan);
                                                                                setIsEditActionPlanDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleDeleteActionPlan(plan.kpi_id)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">{plan.kpi_name}</td>
                                                        <td className="p-4 text-center">{plan.kpi_target ? plan.kpi_target.toString() : '-'}</td>
                                                        <td className="p-4 text-center">{plan.kpi_weight ? plan.kpi_weight.toString() + '%' : '-'}</td>
                                                        <td className="p-4 text-center">{plan.kpi_org_unit_id ? 'Unit' : plan.kpi_employee_id ? 'Employee' : '-'}</td>
                                                        <td className="p-4 text-center">
                                                            {plan.kpi_org_unit_id ?
                                                                plan.organization_unit_name || plan.kpi_org_unit_id :
                                                                plan.kpi_employee_id ?
                                                                    plan.employee_name || plan.kpi_employee_id :
                                                                    '-'}
                                                        </td>
                                                        <td className="p-4 text-center">{plan.kpi_definition || '-'}</td>
                                                    </tr>
                                                ))}

                                                {/* Show message when no data is available */}
                                                {paginatedData.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="p-4 text-center text-gray-500">
                                                            No action plans match your search criteria.
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* Total Row - only show if we have data */}
                                                {paginatedData.length > 0 && (
                                                    <tr className="bg-[#1B6131] text-white font-bold">
                                                        <td className="p-4 text-center" colSpan={3}>Total</td>
                                                        <td className="p-4 text-center">{calculateWeight}%</td>
                                                        <td className="p-4 text-center" colSpan={3}></td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Component */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredData.length}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>

            {/* Dialogs */}
            <ActionPlanEditDialog
                isOpen={isAddActionPlanDialogOpen}
                onClose={() => setIsAddActionPlanDialogOpen(false)}
                onSave={handleAddActionPlan}
                parentKPI={parentKPI}
            />

            {selectedActionPlan && (
                <ActionPlanEditDialog
                    isOpen={isEditActionPlanDialogOpen}
                    onClose={() => setIsEditActionPlanDialogOpen(false)}
                    onSave={handleEditActionPlan}
                    initialData={selectedActionPlan}
                    parentKPI={parentKPI}
                />
            )}
        </div>
    );
};

export default MPMActionPlan;