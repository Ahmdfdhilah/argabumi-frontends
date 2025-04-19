import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Edit, Search } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Filtering from '@/components/Filtering';
import Pagination from '@/components/Pagination';
import { IndividualActualsDialog } from '@/components/IndividualActualsDialog';
import Footer from '@/components/Footer';
import KPIDetailsCard from '@/components/KPIDetails';

type IndividualKPIActual = {
    id: string;
    name: string;
    position: string;
    target: number;
    actual: number;
    achievement: number;
    problemIdentification: string;
    rootCauseAnalysis: string;
    correctiveAction: string;
    status: 'On Track' | 'At Risk' | 'Off Track';
};

const MPMActualsActionPlans: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { mpmActualId, mpmId, teamId } = useParams<{
        mpmActualId: string,
        mpmId: string,
        teamId: string
    }>();
    const month = searchParams.get('month') || 'January';

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
   
    const [isEditIndividualDialogOpen, setIsEditIndividualDialogOpen] = useState(false);
    const [selectedIndividual, setSelectedIndividual] = useState<IndividualKPIActual | null>(null);

    // Team and KPI Context
    const [teamContext] = useState({
        id: 1,
        perspective: 'Financial',
        kpiNumber: 1,
        kpi: 'Revenue Growth',
        category: 'Max',
        ytdCalculation: 'Accumulative',
        kpiDefinition: 'Increase overall company revenue',
        weight: 30,
        uom: 'Number',
        target: 100000
    });

    // Individual Actuals State
    const [individualActuals, setIndividualActuals] = useState<IndividualKPIActual[]>([
        {
            id: '1',
            name: 'John Doe',
            position: 'Senior Sales Representative',
            target: 30000,
            actual: 28000,
            achievement: 93.33,
            problemIdentification: 'Lower performance in new market segment',
            rootCauseAnalysis: 'Insufficient product knowledge',
            correctiveAction: 'Additional training and product workshops',
            status: 'At Risk'
        },
        {
            id: '2',
            name: 'Jane Smith',
            position: 'Sales Representative',
            target: 25000,
            actual: 26500,
            achievement: 106,
            problemIdentification: '',
            rootCauseAnalysis: '',
            correctiveAction: '',
            status: 'On Track'
        },
        {
            id: '3',
            name: 'Michael Johnson',
            position: 'Sales Manager',
            target: 50000,
            actual: 47500,
            achievement: 95,
            problemIdentification: 'Team coordination issues',
            rootCauseAnalysis: 'Lack of regular sync meetings',
            correctiveAction: 'Implement weekly progress check-ins',
            status: 'At Risk'
        },
        {
            id: '4',
            name: 'Emily Clark',
            position: 'Account Executive',
            target: 35000,
            actual: 37000,
            achievement: 105.71,
            problemIdentification: '',
            rootCauseAnalysis: '',
            correctiveAction: '',
            status: 'On Track'
        },
        {
            id: '5',
            name: 'Robert Wilson',
            position: 'Junior Sales Representative',
            target: 20000,
            actual: 15000,
            achievement: 75,
            problemIdentification: 'Difficulty closing deals',
            rootCauseAnalysis: 'Lack of negotiation skills',
            correctiveAction: 'Negotiation training and shadowing sessions',
            status: 'Off Track'
        }
    ]);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [achievementFilter, setAchievementFilter] = useState('All');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Filter function
    const filteredIndividuals = useMemo(() => {
        return individualActuals.filter(individual => {
            const matchesSearch =
                individual.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                individual.position.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === 'All' || individual.status === statusFilter;

            const matchesAchievement =
                achievementFilter === 'All' ||
                (achievementFilter === 'Exceeding' && individual.achievement > 100) ||
                (achievementFilter === 'Meeting' && individual.achievement >= 90 && individual.achievement <= 100) ||
                (achievementFilter === 'Below' && individual.achievement < 90);

            return matchesSearch && matchesStatus && matchesAchievement;
        });
    }, [individualActuals, searchQuery, statusFilter, achievementFilter]);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredIndividuals.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredIndividuals.length / itemsPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, achievementFilter]);

    // Calculations
    const calculateTeamTotals = useMemo(() => {
        return {
            totalTarget: individualActuals.reduce((sum, individual) => sum + individual.target, 0),
            totalActual: individualActuals.reduce((sum, individual) => sum + individual.actual, 0),
            averageAchievement: individualActuals.reduce((sum, individual) => sum + individual.achievement, 0) / individualActuals.length
        };
    }, [individualActuals]);

    const handleEditIndividual = (updatedIndividual: IndividualKPIActual) => {
        setIndividualActuals(prev =>
            prev.map(individual =>
                individual.id === updatedIndividual.id
                    ? {
                        ...updatedIndividual,
                        achievement: (updatedIndividual.actual / updatedIndividual.target) * 100
                    }
                    : individual
            )
        );
        setIsEditIndividualDialogOpen(false);
    };

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
                
                
                
            />

            <div className="flex flex-col md:flex-row">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    
                    
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <div className="space-y-6 mb-16">
                            <Breadcrumb
                                items={[
                                    { label: 'MPM Actuals List', path: '/performance-management/mpm/actual' },
                                    { label: 'MPM Actuals', path: `/performance-management/mpm/actual/${mpmActualId}?month=${month}` },
                                    { label: 'MPM Actual Teams', path: `/performance-management/mpm/actual/${mpmActualId}/entri/${mpmId}/teams?month=${month}` }
                                ]}
                                currentPage="Individual Actuals"
                                subtitle={`MPM Actual ID: ${mpmActualId}  | Team ID: ${teamId} | Month: ${month}`}
                                showHomeIcon={true}
                            />

                            {/* Team and KPI Context Card */}
                            <KPIDetailsCard
                                title="Team KPI Details"
                                description="Overview of team performance indicators"
                                kpi={{
                                    name: teamContext.kpi,
                                    perspective: teamContext.perspective,
                                    number: teamContext.kpiNumber,
                                    definition: teamContext.kpiDefinition,
                                    weight: teamContext.weight,
                                    uom: teamContext.uom,
                                    target: teamContext.target,
                                    category: teamContext.category,
                                    ytdCalculation: teamContext.ytdCalculation,
                                    status: 'On Track'
                                }}
                            />

                            {/* Filter Section */}
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

                            {/* Individual Actuals Card */}
                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                        Individual KPI Actuals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='m-0 p-0 pb-8 overflow-x-auto'>
                                    <table className="w-full border-collapse">
                                        <thead className="bg-[#1B6131] text-white">
                                            <tr>
                                                <th className="p-3 text-center min-w-[100px]">Actions</th>
                                                <th className="p-3 min-w-[150px]">Name</th>
                                                <th className="p-3 min-w-[150px]">Position</th>
                                                <th className="p-3 text-center min-w-[100px]">Target</th>
                                                <th className="p-3 text-center min-w-[100px]">Actual</th>
                                                <th className="p-3 text-center min-w-[100px]">Achievement (%)</th>
                                                <th className="p-3 text-center min-w-[100px]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map(individual => (
                                                <tr
                                                    key={individual.id}
                                                    className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"
                                                >
                                                    <td className="p-3 text-center">
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
                                                    </td>
                                                    <td className="p-3">{individual.name}</td>
                                                    <td className="p-3">{individual.position}</td>
                                                    <td className="p-3 text-center">{individual.target.toLocaleString()}</td>
                                                    <td className="p-3 text-center">{individual.actual.toLocaleString()}</td>
                                                    <td className={`p-3 text-center font-bold ${individual.achievement >= 100
                                                        ? 'text-green-600'
                                                        : individual.achievement >= 80
                                                            ? 'text-amber-600'
                                                            : 'text-red-600'
                                                        }`}>
                                                        {individual.achievement.toFixed(2)}%
                                                    </td>
                                                    <td className={`p-3 text-center font-bold ${individual.status === 'On Track'
                                                        ? 'text-green-600'
                                                        : individual.status === 'At Risk'
                                                            ? 'text-amber-600'
                                                            : 'text-red-600'
                                                        }`}>
                                                        {individual.status}
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Team Totals Row */}
                                            <tr className="bg-[#1B6131] text-white font-bold">
                                                <td colSpan={3} className="p-3 text-center">Team Total</td>
                                                <td className="p-3 text-center">
                                                    {calculateTeamTotals.totalTarget.toLocaleString()}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {calculateTeamTotals.totalActual.toLocaleString()}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {calculateTeamTotals.averageAchievement.toFixed(2)}%
                                                </td>
                                                <td className="p-3 text-center"></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Pagination Component */}
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

            {selectedIndividual && (
                <IndividualActualsDialog
                    isOpen={isEditIndividualDialogOpen}
                    onClose={() => setIsEditIndividualDialogOpen(false)}
                    onSave={handleEditIndividual}
                    initialData={selectedIndividual}
                />
            )}
        </div>
    );
};

export default MPMActualsActionPlans;