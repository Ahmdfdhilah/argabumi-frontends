import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { TeamTargetEditDialog } from '@/components/TeamTargetEditDialog';
import Footer from '@/components/Footer';
import KPIDetailsCard from '@/components/KPIDetails';

// Enhanced Types
type Perspective =
    | 'Financial'
    | 'Customer'
    | 'Internal Business Process'
    | 'Learning & Growth';

type Category = 'Max' | 'Min' | 'On Target';
type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
type UOMType = 'Number' | '%' | 'Days' | 'Kriteria';

type MPMEntry = {
    id?: number;
    perspective: Perspective;
    kpiNumber: number;
    kpi: string;
    kpiDefinition: string;
    weight: number;
    uom: UOMType;
    category: Category;
    ytdCalculation: YTDCalculation;
    targets: Record<string, number>;
};

type TeamKPIActionPlan = {
    id?: string;
    parentKPI: MPMEntry;
    teamName: string;
    teamWeight: number;
    teamTarget: number;
    monthlyTargets: Record<string, number>;
    comments?: string;
};

const MPMTargetsTeamKPI: React.FC = () => {
    const { targetId, mpmId } = useParams<{ targetId: string, mpmId: string }>();

    const [parentKPIs, _] = useState<MPMEntry[]>([
        {
            id: 1,
            perspective: 'Financial',
            kpiNumber: 1,
            kpi: 'Revenue Growth',
            kpiDefinition: 'Increase overall company revenue',
            weight: 30,
            uom: 'Number',
            category: 'Max',
            ytdCalculation: 'Accumulative',
            targets: {
                'Jan-25': 100000,
                'Feb-25': 120000,
                'Mar-25': 150000
            }
        }
    ]);

    // Enhanced Team KPI Action Plans with more flexible allocation
    const [teamKPIActionPlans, setTeamKPIActionPlans] = useState<TeamKPIActionPlan[]>([
        {
            id: '1',
            parentKPI: parentKPIs[0],
            teamName: 'Sales Team',
            teamWeight: 20,
            teamTarget: 50000,
            monthlyTargets: {
                'Jan-25': 50000,
                'Feb-25': 60000,
                'Mar-25': 75000
            },
            comments: 'Focus on high-value client acquisition'
        },
        {
            id: '2',
            parentKPI: parentKPIs[0],
            teamName: 'Business Development',
            teamWeight: 10,
            teamTarget: 25000,
            monthlyTargets: {
                'Jan-25': 25000,
                'Feb-25': 30000,
                'Mar-25': 35000
            },
            comments: 'Explore new market segments'
        },
        {
            id: '3',
            parentKPI: parentKPIs[0],
            teamName: 'Marketing',
            teamWeight: 15,
            teamTarget: 35000,
            monthlyTargets: {
                'Jan-25': 35000,
                'Feb-25': 40000,
                'Mar-25': 45000
            },
            comments: 'Increase brand awareness and lead generation'
        },
        {
            id: '4',
            parentKPI: parentKPIs[0],
            teamName: 'Customer Success',
            teamWeight: 10,
            teamTarget: 20000,
            monthlyTargets: {
                'Jan-25': 20000,
                'Feb-25': 22000,
                'Mar-25': 25000
            },
            comments: 'Improve customer retention and satisfaction'
        }
    ]);

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
    const [selectedActionPlan, setSelectedActionPlan] = useState<TeamKPIActionPlan | null>(null);
    const navigate = useNavigate();

    // Pagination state - Added from Actual MPM
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter state - Added from Actual MPM
    const [searchTerm, setSearchTerm] = useState('');
    const [teamFilter, setTeamFilter] = useState('All');

    // Apply filters to get filtered data - Added from Actual MPM
    const filteredData = useMemo(() => {
        return teamKPIActionPlans.filter(plan => {
            // Apply search term filter (case insensitive)
            const matchesSearch = searchTerm === '' ||
                plan.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (plan.comments && plan.comments.toLowerCase().includes(searchTerm.toLowerCase()));

            // Apply team filter
            const matchesTeam = teamFilter === 'All' || plan.teamName === teamFilter;

            return matchesSearch && matchesTeam;
        });
    }, [teamKPIActionPlans, searchTerm, teamFilter]);

    // Paginate the filtered data - Added from Actual MPM
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Calculation of totals
    const calculateTotals = useMemo(() => {
        const totals: Record<string, number> = {
            'Jan-25': 0,
            'Feb-25': 0,
            'Mar-25': 0,
            total: 0,
            totalWeight: 0 // Added to track total weight
        };

        filteredData.forEach(plan => {
            Object.keys(plan.monthlyTargets).forEach(month => {
                totals[month as keyof typeof totals] += plan.monthlyTargets[month];
            });
            totals.total += plan.teamTarget;
            totals.totalWeight += plan.teamWeight;
        });

        return totals;
    }, [filteredData]);

    // Pagination handlers - Added from Actual MPM
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Get unique team names for filter dropdown
    const teamNames = useMemo(() => {
        const names = new Set<string>();
        teamKPIActionPlans.forEach(plan => names.add(plan.teamName));
        return Array.from(names);
    }, [teamKPIActionPlans]);

    // Handlers for action plans
    const handleAddActionPlan = (newActionPlan: TeamKPIActionPlan) => {
        setTeamKPIActionPlans(prev => [...prev, { ...newActionPlan, id: `${prev.length + 1}` }]);
        setIsAddActionPlanDialogOpen(false);
    };

    const handleEditActionPlan = (updatedActionPlan: TeamKPIActionPlan) => {
        setTeamKPIActionPlans(prev =>
            prev.map(plan =>
                plan.id === updatedActionPlan.id ? updatedActionPlan : plan
            )
        );
        setIsEditActionPlanDialogOpen(false);
    };

    const handleDeleteActionPlan = (actionPlanId: string) => {
        setTeamKPIActionPlans(prev =>
            prev.filter(plan => plan.id !== actionPlanId)
        );
    };

    const actionButton = (
        <Button
            onClick={() => setIsAddActionPlanDialogOpen(true)}
            className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
        >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add KPI Action Plan
        </Button>
    );

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

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <div className="space-y-6 w-full">
                            <Breadcrumb
                                items={[{
                                    label: 'MPM Targets List',
                                    path: '/performance-management/mpm/target',
                                },
                                {
                                    label: 'MPM Targets',
                                    path: `/performance-management/mpm/target/${targetId}`,
                                }]}
                                currentPage="Team KPI Action Plans"
                                subtitle={`MPM Target ID: ${targetId} | Entry ID: ${mpmId}`}
                                showHomeIcon={true}
                            />

                            <KPIDetailsCard
                                title="KPI Details"
                                description="Overview of the Key Performance Indicator"
                                kpi={{
                                    name: parentKPIs[0].kpi,
                                    perspective: parentKPIs[0].perspective,
                                    number: parentKPIs[0].kpiNumber,
                                    definition: parentKPIs[0].kpiDefinition,
                                    weight: parentKPIs[0].weight,
                                    uom: parentKPIs[0].uom,
                                    category: parentKPIs[0].category,
                                    ytdCalculation: parentKPIs[0].ytdCalculation,
                                    status: 'On Track'
                                }}
                                targets={parentKPIs[0].targets}
                                actionButtonComponent={actionButton}
                            />

                            {/* Filter Section - Added from Actual MPM */}
                            <Filtering>
                                <div className="space-y-3">
                                    <label htmlFor="searchTerm" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search</span>
                                    </label>
                                    <Input
                                        id="searchTerm"
                                        type="text"
                                        placeholder="Search by team name or comments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Info className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Team</span>
                                    </label>
                                    <select
                                        value={teamFilter}
                                        onChange={(e) => setTeamFilter(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="All">All Teams</option>
                                        {teamNames.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                            </Filtering>

                            {/* Main Card */}
                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                        Team KPI Action Plans
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='m-0 p-0 pb-8'>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-[#1B6131] text-white">
                                                <tr>
                                                    <th className="p-4 text-center">Actions</th>
                                                    <th className="p-4 text-center">Team</th>
                                                    <th className="p-4 text-center">Team Target</th>
                                                    <th className="p-4 text-center">Team Weight</th>
                                                    <th className="p-4 text-center">Comments</th>
                                                    <th className="p-4 text-center">Jan-25</th>
                                                    <th className="p-4 text-center">Feb-25</th>
                                                    <th className="p-4 text-center">Mar-25</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((plan) => (
                                                    <tr
                                                        key={plan.id}
                                                        className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"
                                                    >
                                                        <td className="p-4 text-center">
                                                            <div className="flex justify-center space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="hover:text-[#1B6131]"
                                                                    onClick={() => navigate(`/performance-management/mpm/target/${targetId}/entri/${mpmId}/teams/${plan.teamName}`)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
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
                                                                    onClick={() => handleDeleteActionPlan(plan.id!)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">{plan.teamName}</td>
                                                        <td className="p-4 text-center">{plan.teamTarget.toLocaleString()}</td>
                                                        <td className="p-4 text-center">{plan.teamWeight}%</td>
                                                        <td className="p-4 text-center">{plan.comments}</td>
                                                        <td className="p-4 text-center">{plan.monthlyTargets['Jan-25'].toLocaleString()}</td>
                                                        <td className="p-4 text-center">{plan.monthlyTargets['Feb-25'].toLocaleString()}</td>
                                                        <td className="p-4 text-center">{plan.monthlyTargets['Mar-25'].toLocaleString()}</td>
                                                    </tr>
                                                ))}

                                                {/* Show message when no data is available */}
                                                {paginatedData.length === 0 && (
                                                    <tr>
                                                        <td colSpan={8} className="p-4 text-center text-gray-500">
                                                            No team KPIs match your search criteria.
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* Total Row - only show if we have data */}
                                                {paginatedData.length > 0 && (
                                                    <tr className="bg-[#1B6131] text-white font-bold">
                                                        <td className="p-4 text-center" colSpan={2}>Total</td>
                                                        <td className="p-4 text-center">{calculateTotals.total.toLocaleString()}</td>
                                                        <td className="p-4 text-center">{calculateTotals.totalWeight}%</td>
                                                        <td className="p-4 text-center"></td>
                                                        <td className="p-4 text-center">{calculateTotals['Jan-25'].toLocaleString()}</td>
                                                        <td className="p-4 text-center">{calculateTotals['Feb-25'].toLocaleString()}</td>
                                                        <td className="p-4 text-center">{calculateTotals['Mar-25'].toLocaleString()}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Component - Added from Actual MPM */}
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
            <TeamTargetEditDialog
                isOpen={isAddActionPlanDialogOpen}
                onClose={() => setIsAddActionPlanDialogOpen(false)}
                onSave={handleAddActionPlan}
            />

            {selectedActionPlan && (
                <TeamTargetEditDialog
                    isOpen={isEditActionPlanDialogOpen}
                    onClose={() => setIsEditActionPlanDialogOpen(false)}
                    onSave={handleEditActionPlan}
                    initialData={selectedActionPlan}
                />
            )}
        </div>
    );
};

export default MPMTargetsTeamKPI;