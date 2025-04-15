import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Edit, PlusCircle, Trash2, Search } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Filtering from '@/components/Filtering';
import Pagination from '@/components/Pagination';
import { IndividualTargetsDialog } from '@/components/IndividualTargetsDialog';
import Footer from '@/components/Footer';
import KPIDetailsCard from '@/components/KPIDetails';

// Types reflecting the multi-level performance management hierarchy
type Perspective =
    | 'Financial'
    | 'Customer'
    | 'Internal Business Process'
    | 'Learning & Growth';

type Category = 'Max' | 'Min' | 'On Target';
type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
type UOMType = 'Number' | '%' | 'Days' | 'Kriteria';

type ParentKPI = {
    id: number;
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
    id: string;
    parentKPI: ParentKPI;
    teamName: string;
    teamWeight: number;
    teamTarget: number;
    monthlyTargets: Record<string, number>;
    comments?: string;
};

type IndividualPerformanceEntry = {
    id: string;
    name: string;
    position: string;
    monthlyTargets: Record<string, number>;
    monthlyActuals: Record<string, number>;
    weight: number;
    teamWeight: number;
    status?: 'On Track' | 'At Risk' | 'Off Track';
};

const MPMTargetsActionPlans: React.FC = () => {
    const { targetId, mpmId, teamId } = useParams<{ targetId: string, mpmId: string, teamId: string }>();

    const parentKPI: ParentKPI = {
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
    };

    // State for team KPI action plans with individual breakdown
    const [teamActionPlan, _] = useState<TeamKPIActionPlan>({
        id: teamId || '1',
        parentKPI: parentKPI,
        teamName: 'Sales Team',
        teamWeight: 20,
        teamTarget: 75000,
        monthlyTargets: {
            'Jan-25': 50000,
            'Feb-25': 60000,
            'Mar-25': 75000
        },
        comments: 'Focus on high-value client acquisition'
    });

    const [individuals, setIndividuals] = useState<IndividualPerformanceEntry[]>([
        {
            id: 'sales-1',
            name: 'John Doe',
            position: 'Senior Sales Representative',
            monthlyTargets: {
                'Jan-25': 20000,
                'Feb-25': 22000,
                'Mar-25': 25000
            },
            monthlyActuals: {
                'Jan-25': 18000,
                'Feb-25': 21500,
                'Mar-25': 0
            },
            weight: 5,
            teamWeight: 20,
            status: 'At Risk'
        },
        {
            id: 'sales-2',
            name: 'Jane Smith',
            position: 'Sales Representative',
            monthlyTargets: {
                'Jan-25': 15000,
                'Feb-25': 16000,
                'Mar-25': 18000
            },
            monthlyActuals: {
                'Jan-25': 14000,
                'Feb-25': 15500,
                'Mar-25': 0
            },
            weight: 10,
            teamWeight: 15,
            status: 'On Track'
        },
        {
            id: 'sales-3',
            name: 'Michael Johnson',
            position: 'Sales Manager',
            monthlyTargets: {
                'Jan-25': 25000,
                'Feb-25': 27000,
                'Mar-25': 30000
            },
            monthlyActuals: {
                'Jan-25': 23500,
                'Feb-25': 25000,
                'Mar-25': 0
            },
            weight: 15,
            teamWeight: 25,
            status: 'At Risk'
        },
        {
            id: 'sales-4',
            name: 'Emily Clark',
            position: 'Account Executive',
            monthlyTargets: {
                'Jan-25': 18000,
                'Feb-25': 20000,
                'Mar-25': 22000
            },
            monthlyActuals: {
                'Jan-25': 18500,
                'Feb-25': 20500,
                'Mar-25': 0
            },
            weight: 8,
            teamWeight: 18,
            status: 'On Track'
        },
        {
            id: 'sales-5',
            name: 'Robert Wilson',
            position: 'Junior Sales Representative',
            monthlyTargets: {
                'Jan-25': 12000,
                'Feb-25': 13000,
                'Mar-25': 15000
            },
            monthlyActuals: {
                'Jan-25': 9000,
                'Feb-25': 10500,
                'Mar-25': 0
            },
            weight: 5,
            teamWeight: 10,
            status: 'Off Track'
        }
    ]);

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');
    const [isAddIndividualDialogOpen, setIsAddIndividualDialogOpen] = useState(false);
    const [isEditIndividualDialogOpen, setIsEditIndividualDialogOpen] = useState(false);
    const [selectedIndividual, setSelectedIndividual] = useState<IndividualPerformanceEntry | null>(null);

    // Filter State - New
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [achievementFilter, setAchievementFilter] = useState('All');

    // Pagination State - New
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate achievement percentages for filtering
    const getAchievementPercentage = (individual: IndividualPerformanceEntry): number => {
        const totalTarget = individual.monthlyTargets['Jan-25'] + individual.monthlyTargets['Feb-25'];
        const totalActual = individual.monthlyActuals['Jan-25'] + individual.monthlyActuals['Feb-25'];
        return totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    };

    // Filter function - New
    const filteredIndividuals = useMemo(() => {
        return individuals.filter(individual => {
            const matchesSearch =
                individual.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                individual.position.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === 'All' || individual.status === statusFilter;

            const achievementPercentage = getAchievementPercentage(individual);
            const matchesAchievement =
                achievementFilter === 'All' ||
                (achievementFilter === 'Exceeding' && achievementPercentage > 100) ||
                (achievementFilter === 'Meeting' && achievementPercentage >= 90 && achievementPercentage <= 100) ||
                (achievementFilter === 'Below' && achievementPercentage < 90);

            return matchesSearch && matchesStatus && matchesAchievement;
        });
    }, [individuals, searchQuery, statusFilter, achievementFilter]);

    // Reset pagination when filters change - New
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, achievementFilter]);

    // Pagination calculations - New
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredIndividuals.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredIndividuals.length / itemsPerPage);

    // Calculations for team totals
    const calculateIndividualTotals = useMemo(() => {
        const totals: Record<string, { target: number, actual: number }> = {
            'Jan-25': { target: 0, actual: 0 },
            'Feb-25': { target: 0, actual: 0 },
            'Mar-25': { target: 0, actual: 0 }
        };

        currentItems.forEach(individual => {
            Object.keys(individual.monthlyTargets).forEach(month => {
                totals[month].target += individual.monthlyTargets[month];
                totals[month].actual += individual.monthlyActuals[month] || 0;
            });
        });

        return totals;
    }, [currentItems]);

    // Handlers for individual performance entries
    const handleAddIndividual = (newIndividual: IndividualPerformanceEntry) => {
        setIndividuals(prev => [
            ...prev,
            {
                ...newIndividual,
                id: `individual-${prev.length + 1}`
            }
        ]);
        setIsAddIndividualDialogOpen(false);
    };

    const handleEditIndividual = (updatedIndividual: IndividualPerformanceEntry) => {
        setIndividuals(prev =>
            prev.map(individual =>
                individual.id === updatedIndividual.id
                    ? updatedIndividual
                    : individual
            )
        );
        setIsEditIndividualDialogOpen(false);
    };

    const handleDeleteIndividual = (individualId: string) => {
        setIndividuals(prev =>
            prev.filter(individual => individual.id !== individualId)
        );
    };

    // Pagination handlers - New
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    return (
        <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900 pb-16">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
                currentSystem='Performance Management System'
            />

            <div className="flex flex-col md:flex-row">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    role={currentRole}
                    system="performance-management"
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <div className="space-y-6 mb-16">
                            <Breadcrumb
                                items={[{
                                    label: 'MPM Targets List',
                                    path: '/performance-management/mpm/target',
                                }, {
                                    label: 'MPM Targets',
                                    path: '/performance-management/mpm/target',
                                }, {
                                    label: 'MPM Target Teams',
                                    path: `/performance-management/mpm/target/${targetId}/entri/${mpmId}/teams`,
                                }]}
                                currentPage="Individual Targets"
                                subtitle={`MPM Target ID: ${targetId} | Entri ID: ${mpmId} | Team ID: ${teamId}`}
                                showHomeIcon={true}
                            />

                            <KPIDetailsCard
                                title="Team KPI Details"
                                description="Overview of team performance indicators"
                                kpi={{
                                    name: teamActionPlan.parentKPI.kpi,
                                    perspective: teamActionPlan.parentKPI.perspective,
                                    number: teamActionPlan.parentKPI.kpiNumber, // Assuming this is a number/ID
                                    uom: teamActionPlan.parentKPI.uom,
                                    weight: teamActionPlan.teamWeight,
                                    definition: teamActionPlan.parentKPI.kpiDefinition,
                                    pic: teamActionPlan.teamName, // Add if available
                                    status: "On Track" // Add if available
                                }}
                                targets={teamActionPlan.monthlyTargets}
                                actionButtonComponent={
                                    <Button
                                        onClick={() => setIsAddIndividualDialogOpen(true)}
                                        className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Action Plans
                                    </Button>
                                }
                            />

                            {/* Filter Section - New */}
                            <Filtering>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search</span>
                                    </label>
                                    <Input
                                        placeholder="Search by name or position..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <span>Status</span>
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="On Track">On Track</option>
                                        <option value="At Risk">At Risk</option>
                                        <option value="Off Track">Off Track</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <span>Achievement</span>
                                    </label>
                                    <select
                                        value={achievementFilter}
                                        onChange={(e) => setAchievementFilter(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md"
                                    >
                                        <option value="All">All Achievements</option>
                                        <option value="Exceeding">Exceeding Target ({`>100%`})</option>
                                        <option value="Meeting">Meeting Target (90-100%)</option>
                                        <option value="Below">Below Target ({`<90%`})</option>
                                    </select>
                                </div>
                            </Filtering>

                            {/* Individual Performance Card */}
                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                                        Individual Performance Entries
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='m-0 p-0 overflow-x-auto pb-8'>
                                    <table className="w-full border-collapse">
                                        <thead className="bg-[#1B6131] text-white">
                                            <tr>
                                                <th className="p-3 text-center min-w-[100px]">Actions</th>
                                                <th className="p-3 min-w-[150px]">Name</th>
                                                <th className="p-3 min-w-[150px]">Position</th>
                                                <th className="p-3 text-center min-w-[100px]">Weight</th>
                                                <th className="p-3 text-center min-w-[100px]">Status</th>
                                                <th className="p-3 text-center min-w-[100px]">Jan-25</th>
                                                <th className="p-3 text-center min-w-[100px]">Feb-25</th>
                                                <th className="p-3 text-center min-w-[100px]">Mar-25</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map(individual => (
                                                <tr
                                                    key={individual.id}
                                                    className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"
                                                >
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center space-x-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setSelectedIndividual(individual);
                                                                    setIsEditIndividualDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteIndividual(individual.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">{individual.name}</td>
                                                    <td className="p-3">{individual.position}</td>
                                                    <td className="p-3 text-center">{individual.weight}%</td>
                                                    <td className={`p-3 text-center font-bold ${individual.status === 'On Track'
                                                        ? 'text-green-600'
                                                        : individual.status === 'At Risk'
                                                            ? 'text-amber-600'
                                                            : 'text-red-600'
                                                        }`}>
                                                        {individual.status}
                                                    </td>
                                                    {(['Jan-25', 'Feb-25', 'Mar-25'] as const).map(month => (
                                                        <td key={month} className="p-3 text-center">
                                                            <div className="flex flex-col">
                                                                <span className="dark:text-white">
                                                                    T: {individual.monthlyTargets[month]}
                                                                </span>
                                                                <span
                                                                    className={`
                                                                font-bold 
                                                                ${individual.monthlyActuals[month] >= individual.monthlyTargets[month]
                                                                            ? 'text-green-600'
                                                                            : individual.monthlyActuals[month] >= individual.monthlyTargets[month] * 0.8
                                                                                ? 'text-amber-600'
                                                                                : 'text-red-600'
                                                                        }
                                                            `}
                                                                >
                                                                    A: {individual.monthlyActuals[month] || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            {/* Team Totals Row */}
                                            <tr className="bg-[#1B6131] text-white font-bold">
                                                <td colSpan={4} className="p-3 text-center">Team Total</td>
                                                <td className="p-3 text-center"></td>
                                                {(['Jan-25', 'Feb-25', 'Mar-25'] as const).map(month => {
                                                    const monthTotals = calculateIndividualTotals[month];
                                                    return (
                                                        <td key={month} className="p-3 text-center">
                                                            <div className="flex flex-col">
                                                                <span className="text-white">
                                                                    T: {monthTotals.target}
                                                                </span>
                                                                <span
                                                                    className={`
                                                                font-bold 
                                                                ${monthTotals.actual >= monthTotals.target
                                                                            ? 'text-green-600'
                                                                            : monthTotals.actual >= monthTotals.target * 0.8
                                                                                ? 'text-amber-600'
                                                                                : 'text-red-600'
                                                                        }
                                                            `}
                                                                >
                                                                    A: {monthTotals.actual}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Pagination Component - New */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredIndividuals.length}
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
            <IndividualTargetsDialog
                isOpen={isAddIndividualDialogOpen}
                onClose={() => setIsAddIndividualDialogOpen(false)}
                onSave={handleAddIndividual}
            />

            {selectedIndividual && (
                <IndividualTargetsDialog
                    isOpen={isEditIndividualDialogOpen}
                    onClose={() => setIsEditIndividualDialogOpen(false)}
                    onSave={handleEditIndividual}
                    initialData={selectedIndividual}
                />
            )}
        </div>
    );
};

export default MPMTargetsActionPlans;