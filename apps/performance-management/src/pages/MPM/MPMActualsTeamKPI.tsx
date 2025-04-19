import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Edit, Eye, Info, Search } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import { teamMpmActual } from '@/lib/MpmTeamMocksData';
import { TeamActualEditDialog } from '@/components/TeamActualEditDialog';
import Footer from '@/components/Footer';
import KPIDetailsCard from '@/components/KPIDetails';

type MonthType = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' |
    'July' | 'August' | 'September' | 'October' | 'November' | 'December';

type Perspective =
    | 'Financial'
    | 'Customer'
    | 'Internal Business Process'
    | 'Learning & Growth';

type MPMEntry = {
    id?: number;
    perspective: Perspective;
    kpiNumber: number;
    kpi: string;
    category: string;
    ytdCalculation: string;
    kpiDefinition: string;
    weight: number;
    uom: string;
    target: number;
};

type TeamKPIActual = {
    id: string;
    teamId: number;
    teamName: string;
    month: MonthType;
    target: number;
    actual: number;
    achievement: number;
    weight: number;
    problemIdentification: string;
    rootCauseAnalysis: string;
    correctiveAction: string;
    status: 'On Track' | 'At Risk' | 'Off Track';
};

const MPMActualsTeamKPI: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { mpmActualId, mpmId } = useParams<{
        mpmActualId: string,
        mpmId: string
    }>();
    const month = searchParams.get('month');

    // State for sidebar and UI
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
   
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedTeamKPI, setSelectedTeamKPI] = useState<TeamKPIActual | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const navigate = useNavigate();

    const [parentKPI] = useState<MPMEntry>({
        id: 1,
        perspective: 'Financial',
        kpiNumber: 1,
        kpi: 'Revenue Growth',
        category:'Max',
        ytdCalculation: 'Accumulative',
        kpiDefinition: 'Increase overall company revenue',
        weight: 30,
        uom: 'Number',
        target: 100000
    });

    const [teamKPIActuals, setTeamKPIActuals] = useState<TeamKPIActual[]>(teamMpmActual);

    // Apply filters to get filtered data
    const filteredData = useMemo(() => {
        return teamKPIActuals.filter(kpi => {
            // Apply search term filter (case insensitive)
            const matchesSearch = searchTerm === '' ||
                kpi.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                kpi.problemIdentification.toLowerCase().includes(searchTerm.toLowerCase()) ||
                kpi.rootCauseAnalysis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                kpi.correctiveAction.toLowerCase().includes(searchTerm.toLowerCase());

            // Apply status filter
            const matchesStatus = statusFilter === 'All' || kpi.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [teamKPIActuals, searchTerm, statusFilter]);

    // Paginate the filtered data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const calculateTotals = useMemo(() => {
        // Calculate totals based on filtered data
        return {
            total: filteredData.reduce((sum, plan) => sum + plan.actual, 0),
            totalWeight: filteredData.reduce((sum, plan) => sum + plan.weight, 0),
            averageAchievement: filteredData.length > 0
                ? filteredData.reduce((sum, plan) => sum + plan.achievement, 0) / filteredData.length
                : 0
        };
    }, [filteredData]);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const handleEditTeamKPI = (teamKPI: TeamKPIActual) => {
        setTeamKPIActuals(prev =>
            prev.map(item =>
                item.id === teamKPI.id ? teamKPI : item
            )
        );
        setIsEditDialogOpen(false);
    };

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
                                items={[
                                    { label: 'MPM Actuals', path: '/performance-management/mpm/actual' },
                                    { label: `${month} Actuals`, path: `/performance-management/mpm/actual/${mpmActualId}?month=${month}` }
                                ]}
                                currentPage={`MPM Actual ID: ${mpmActualId}`}
                                subtitle={`MPM Actual ID: ${mpmActualId} | Month: ${month}`}
                                showHomeIcon={true}
                            />

                            <KPIDetailsCard
                                title="KPI Details"
                                description="Overview of the Key Performance Indicator"
                                kpi={{
                                    name: parentKPI.kpi,
                                    perspective: parentKPI.perspective,
                                    number: parentKPI.kpiNumber,
                                    definition: parentKPI.kpiDefinition,
                                    weight: parentKPI.weight,
                                    uom: parentKPI.uom,
                                    target: parentKPI.target,
                                    category: parentKPI.category,
                                    ytdCalculation: parentKPI.ytdCalculation,
                                    status: 'On Track'
                                }}
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
                                        placeholder="Search by team name or action items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Info className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Status</span>
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="On Track">On Track</option>
                                        <option value="At Risk">At Risk</option>
                                        <option value="Off Track">Off Track</option>
                                    </select>
                                </div>
                            </Filtering>

                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                        Team KPI Actuals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='m-0 p-0 pb-8'>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-[#1B6131] text-white">
                                                <tr>
                                                    <th className="p-4 text-center">Actions</th>
                                                    <th className="p-4 text-center">Team</th>
                                                    <th className="p-4 text-center">Target</th>
                                                    <th className="p-4 text-center">Actual</th>
                                                    <th className="p-4 text-center">Achievement (%)</th>
                                                    <th className="p-4 text-center">Weight (%)</th>
                                                    <th className="p-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((kpi) => (
                                                    <tr
                                                        key={kpi.id}
                                                    >
                                                        <td className="p-4 text-center">
                                                            <div className="flex justify-center space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="hover:text-[#1B6131]"
                                                                    onClick={() => navigate(`/performance-management/mpm/actual/${mpmActualId}/entri/${mpmId}/teams/${kpi.teamId}`)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setSelectedTeamKPI(kpi);
                                                                        setIsEditDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">{kpi.teamName}</td>
                                                        <td className="p-4 text-center">{kpi.target.toLocaleString()}</td>
                                                        <td className="p-4 text-center">{kpi.actual.toLocaleString()}</td>
                                                        <td className="p-4 text-center">{kpi.achievement}%</td>
                                                        <td className="p-4 text-center">{kpi.weight}%</td>
                                                        <td className="p-4 text-center">
                                                            <span className={`
                                                            px-2 py-1 rounded-full text-xs font-bold
                                                            ${kpi.status === 'On Track' ? 'bg-green-200 text-green-800' :
                                                                    kpi.status === 'At Risk' ? 'bg-yellow-200 text-yellow-800' :
                                                                        'bg-red-200 text-red-800'}
                                                        `}>
                                                                {kpi.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Show message when no data is available */}
                                                {paginatedData.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="p-4 text-center text-gray-500">
                                                            No team KPIs match your search criteria.
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* Total Row - only show if we have data */}
                                                {paginatedData.length > 0 && (
                                                    <tr className="bg-[#1B6131] text-white font-bold">
                                                        <td className="p-4 text-center" colSpan={2}>Total</td>
                                                        <td className="p-4 text-center"></td>
                                                        <td className="p-4 text-center">{calculateTotals.total.toLocaleString()}</td>
                                                        <td className="p-4 text-center">{calculateTotals.averageAchievement.toFixed(2)}%</td>
                                                        <td className="p-4 text-center">{calculateTotals.totalWeight}%</td>
                                                        <td className="p-4 text-center"></td>
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


            {selectedTeamKPI && (
                <TeamActualEditDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => setIsEditDialogOpen(false)}
                    onSave={handleEditTeamKPI}
                    initialData={selectedTeamKPI}
                />
            )}
        </div>
    );
};

export default MPMActualsTeamKPI;