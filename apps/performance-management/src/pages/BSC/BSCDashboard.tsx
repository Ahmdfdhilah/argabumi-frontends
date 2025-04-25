import React, { useState, useMemo, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import Sidebar from '@/components/Sidebar';
import {
    ChevronUp, ChevronDown, Minus, ChevronRight, Search,
} from 'lucide-react';
import Header from '@/components/Header';
import Filtering from '@/components/Filtering';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@workspace/ui/components/table';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import { kpiDefinitionService, KPIDefinitionFullResponse } from '@/services/kpiDefinitionService';
import { kpiPerspectiveService, KPIPerspective } from '@/services/kpiPerspectiveService';
import { periodService, Period } from '@/services/periodService';
import { Decimal } from 'decimal.js';

// Types
type BSCType = 'BSC' | 'MPM' | 'IPM' | 'ActionPlan';
type BSCEntry = KPIDefinitionFullResponse & {
    perspective_name?: string; // Add perspective_name for use in UI
};

const BSCDashboard = () => {
    // Core state
    const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedType] = useState<BSCType>('BSC');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isEndDateDisabled, setIsEndDateDisabled] = useState<boolean>(false);

    // Data state
    const [loading, setLoading] = useState<boolean>(true);
    const [kpiData, setKpiData] = useState<BSCEntry[]>([]);
    const [_, setPeriods] = useState<Period[]>([]);
    const [perspectives, setPerspectives] = useState<KPIPerspective[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Search and filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPerspective, setSelectedPerspective] = useState<string>('All');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Fetch periods on component mount
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const fetchedPeriods = await periodService.getPeriods();
                setPeriods(fetchedPeriods);

                // Set default to active period if available
                try {
                    const activePeriod = await periodService.getActivePeriod();
                    setSelectedPeriodId(activePeriod.period_id);
                } catch {
                    // If no active period, select the first one
                    if (fetchedPeriods.length > 0) {
                        setSelectedPeriodId(fetchedPeriods[0].period_id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch periods:", error);
            }
        };

        fetchPeriods();
    }, []);

    // Fetch perspectives on component mount
    useEffect(() => {
        const fetchPerspectives = async () => {
            try {
                const fetchedPerspectives = await kpiPerspectiveService.getPerspectives();
                setPerspectives(fetchedPerspectives);
            } catch (error) {
                console.error("Failed to fetch perspectives:", error);
            }
        };

        fetchPerspectives();
    }, []);

    // Fetch KPI data when period changes
    useEffect(() => {
        const fetchKpiData = async () => {
            if (!selectedPeriodId) return;

            setLoading(true);
            try {
                const data = await kpiDefinitionService.getKPIsByType('BSC', selectedPeriodId);

                // Map perspective IDs to names for each KPI
                const enhancedData = data.map(kpi => {
                    const perspectiveObj = perspectives.find(p => p.perspective_id === kpi.kpi_perspective_id);
                    return {
                        ...kpi,
                        perspective_name: perspectiveObj?.perspective_name || 'Unknown'
                    };
                });

                // Add owner_name and children_count to match BSCEntry type
                const completeData = enhancedData.map(kpi => ({
                    ...kpi,
                    owner_name: '', // Add default value
                    children_count: 0 // Add default value
                }));

                setKpiData(completeData);
            } catch (error) {
                console.error("Failed to fetch KPI data:", error);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch data when both selectedPeriodId and perspectives are available
        if (selectedPeriodId && perspectives.length > 0) {
            fetchKpiData();
        }
    }, [selectedPeriodId, perspectives]);

    // Date handlers
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
        setIsEndDateDisabled(true);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    // Period change handler
    const handlePeriodChange = (periodId: number) => {
        setSelectedPeriodId(periodId);
    };

    // Filter handlers
    const handlePerspectiveChange = (value: string) => {
        setSelectedPerspective(value);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when search changes
    };

    // Filter and search data
    const filteredData = useMemo(() => {
        return kpiData.filter(item => {
            // Search term filter
            const matchesSearch =
                searchTerm === '' ||
                item.kpi_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.kpi_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.kpi_definition?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

            // Perspective filter
            const matchesPerspective =
                selectedPerspective === 'All' ||
                item.perspective_name === selectedPerspective;

            // Category filter
            const matchesCategory =
                selectedCategory === 'All' ||
                item.kpi_category === selectedCategory;

            return matchesSearch && matchesPerspective && matchesCategory;
        });
    }, [kpiData, searchTerm, selectedPerspective, selectedCategory]);

    // Handle pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, itemsPerPage]);

    // Group paginated data by perspective for display
    const paginatedGroupedData = useMemo(() => {
        // Group data by perspective_name
        return paginatedData.reduce((acc, curr) => {
            const perspectiveName = curr.perspective_name || 'Unknown';
            if (!acc[perspectiveName]) {
                acc[perspectiveName] = [];
            }
            acc[perspectiveName].push(curr);
            return acc;
        }, {} as Record<string, BSCEntry[]>);
    }, [paginatedData]);

    // Reset to first page when items per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    // Status indicator component
    const StatusIndicator: React.FC<{ target?: Decimal | string | number | null, actual?: Decimal | string | number | null }> =
        ({ target, actual }) => {
            if (!target || !actual) return <Minus className="text-yellow-500" />;

            const targetNum = typeof target === 'object' ? target.toNumber() : Number(target);
            const actualNum = typeof actual === 'object' ? actual.toNumber() : Number(actual);

            // Calculate achievement percentage (similar to what would be in your API)
            const achievement = (actualNum / targetNum) * 100;

            if (achievement > 100) return <ChevronUp className="text-green-500" />;
            if (achievement < 100) return <ChevronDown className="text-red-500" />;
            return <Minus className="text-yellow-500" />;
        };

    // Calculate totals
    const totals = useMemo(() => {
        return filteredData.reduce((acc, curr) => {
            const weight = typeof curr.kpi_weight === 'object'
                ? curr.kpi_weight.toNumber()
                : Number(curr.kpi_weight);

            // In a real app, you would get these from the API
            // For this example, I'm computing placeholders for score and endScore
            const score = weight; // Placeholder calculation
            const endScore = weight; // Placeholder calculation

            return {
                weight: acc.weight + weight,
                score: acc.score + score,
                endScore: acc.endScore + endScore,
            };
        }, {
            weight: 0,
            score: 0,
            endScore: 0,
        });
    }, [filteredData]);


    // Row expansion handler
    const handleRowClick = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const ExpandedContent = ({ item }: { item: BSCEntry }) => (
        <div className="space-y-2">
            <p className="text-[#1B6131] dark:text-[#46B749]">
                <strong>KPI Definition:</strong> {item.kpi_definition || 'No definition available'}
            </p>
            {item.kpi_metadata?.problemIdentification && (
                <p className="text-[#1B6131] dark:text-[#46B749]">
                    <strong>Problem Identification:</strong> {item.kpi_metadata.problemIdentification}
                </p>
            )}
            {item.kpi_metadata?.correctiveAction && (
                <p className="text-[#1B6131] dark:text-[#46B749]">
                    <strong>Corrective Action:</strong> {item.kpi_metadata.correctiveAction}
                </p>
            )}
        </div>
    );

    // Get unique categories for filter
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(kpiData.map(item => item.kpi_category))];
        return ['All', ...uniqueCategories];
    }, [kpiData]);

    return (
        <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900">
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
                        <div className="space-y-6">
                            <Breadcrumb
                                items={[]}
                                currentPage="BSC Dashboard"
                                showHomeIcon={true}
                            />

                            {/* Filter Section */}
                            <Filtering
                            >
                                {/* Custom Filter Options */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search</span>
                                    </label>
                                    <Input
                                        placeholder="Search by KPI, Code, or Definition..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <span>Perspective</span>
                                    </label>
                                    <select
                                        value={selectedPerspective}
                                        onChange={(e) => handlePerspectiveChange(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none"
                                    >
                                        <option value="All">All</option>
                                        {perspectives.map((perspective) => (
                                            <option key={perspective.perspective_id} value={perspective.perspective_name}>
                                                {perspective.perspective_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <span>Category</span>
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131] p-2 h-10 rounded-md focus:ring-2 focus:ring-[#46B749] dark:focus:ring-[#1B6131] focus:outline-none"
                                    >
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </Filtering>

                            {/* BSC Table Card */}
                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md pb-8">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                        BSC Performance Metrics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="dark:bg-gray-900 m-0 p-0">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <p className="text-gray-500">Loading BSC data...</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <th className="p-4 text-left font-medium text-white">Perspective</th>
                                                    <th className="p-4 text-left font-medium text-white">Code</th>
                                                    <th className="p-4 text-left font-medium text-white">KPI</th>
                                                    <th className="p-4 text-left font-medium text-white">Weight</th>
                                                    <th className="p-4 text-left font-medium text-white">UOM</th>
                                                    <th className="p-4 text-left font-medium text-white">Category</th>
                                                    <th className="p-4 text-left font-medium text-white">Target</th>
                                                    <th className="p-4 text-left font-medium text-white">Actual</th>
                                                    <th className="p-4 text-left font-medium text-white">Achievement</th>
                                                    <th className="p-4 text-left font-medium text-white">Status</th>
                                                    <th className="p-4 text-left font-medium text-white">Score</th>
                                                    <th className="p-4 text-left font-medium text-white">Score Akhir</th>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Object.entries(paginatedGroupedData).map(([perspectiveName, items]) => {
                                                    // Create an array to track which items have expanded content
                                                    const itemsWithExpanded = items.map(item => ({
                                                        ...item,
                                                        isExpanded: expandedRow === item.kpi_id
                                                    }));



                                                    return (
                                                        <React.Fragment key={perspectiveName}>
                                                            {/* Render each item row */}
                                                            {itemsWithExpanded.map((item, index) => {
                                                                const isFirstInGroup = index === 0;
                                                                const totalRowsInPerspective = items.length +
                                                                    itemsWithExpanded.filter(i => i.isExpanded).length + 1;

                                                                // Calculate achievement - normally this would come from the API
                                                                const target = typeof item.kpi_target === 'object'
                                                                    ? item.kpi_target?.toNumber()
                                                                    : Number(item.kpi_target);

                                                                const actual = item.kpi_metadata?.actual
                                                                    ? Number(item.kpi_metadata.actual)
                                                                    : null;

                                                                const achievement = target && actual
                                                                    ? ((actual / target) * 100).toFixed(2)
                                                                    : '-';

                                                                return (
                                                                    <React.Fragment key={item.kpi_id}>
                                                                        <TableRow
                                                                            onClick={() => handleRowClick(item.kpi_id)}
                                                                            className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"
                                                                        >
                                                                            {isFirstInGroup && (
                                                                                <TableCell
                                                                                    rowSpan={totalRowsInPerspective}
                                                                                    className="bg-[#E4EFCF] dark:bg-[#1B6131]/30 font-medium text-[#1B6131] dark:text-[#46B749]"
                                                                                >
                                                                                    {perspectiveName}
                                                                                </TableCell>
                                                                            )}
                                                                            <TableCell className="flex items-center gap-2 text-[#1B6131] dark:text-[#46B749]">
                                                                                {expandedRow === item.kpi_id ? (
                                                                                    <ChevronDown size={16} />
                                                                                ) : (
                                                                                    <ChevronRight size={16} />
                                                                                )}
                                                                                {item.kpi_code}
                                                                            </TableCell>
                                                                            <TableCell>{item.kpi_name}</TableCell>
                                                                            <TableCell>
                                                                                {typeof item.kpi_weight === 'object'
                                                                                    ? item.kpi_weight.toFixed(2)
                                                                                    : Number(item.kpi_weight).toFixed(2)}%
                                                                            </TableCell>
                                                                            <TableCell>{item.kpi_uom}</TableCell>
                                                                            <TableCell>{item.kpi_category}</TableCell>
                                                                            <TableCell>
                                                                                {item.kpi_target
                                                                                    ? (typeof item.kpi_target === 'object'
                                                                                        ? item.kpi_target.toString()
                                                                                        : item.kpi_target)
                                                                                    : '-'}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.kpi_metadata?.actual || '-'}
                                                                            </TableCell>
                                                                            <TableCell>{achievement}%</TableCell>
                                                                            <TableCell>
                                                                                <StatusIndicator
                                                                                    target={item.kpi_target}
                                                                                    actual={item.kpi_metadata?.actual}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {(typeof item.kpi_weight === 'object'
                                                                                    ? item.kpi_weight.toFixed(2)
                                                                                    : Number(item.kpi_weight).toFixed(2))}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {(typeof item.kpi_weight === 'object'
                                                                                    ? item.kpi_weight.toFixed(2)
                                                                                    : Number(item.kpi_weight).toFixed(2))}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        {expandedRow === item.kpi_id && (
                                                                            <TableRow className="bg-[#E4EFCF]/30 dark:bg-[#1B6131]/10">
                                                                                <TableCell colSpan={11} className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                                                                                    <ExpandedContent item={item} />
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                    </React.Fragment>
                                                                );
                                                            })}

                                                            {/* Render perspective subtotal row with weight, score, and score akhir */}
                                                            <TableRow className="bg-[#E4EFCF]/50 dark:bg-[#1B6131]/30">
                                                            </TableRow>
                                                        </React.Fragment>
                                                    );
                                                })}

                                                {paginatedData.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                                                            No results found. Try adjusting your filters.
                                                        </TableCell>
                                                    </TableRow>
                                                )}

                                                {/* Totals Row - Only show when we have data */}
                                                {paginatedData.length > 0 && (
                                                    <TableRow className="font-bold bg-[#1B6131] text-white dark:bg-[#1B6131]">
                                                        <TableCell colSpan={3}>Total</TableCell>
                                                        <TableCell>{totals.weight.toFixed(2)}%</TableCell>
                                                        <TableCell colSpan={6}></TableCell>
                                                        <TableCell>{totals.score.toFixed(2)}</TableCell>
                                                        <TableCell>{totals.endScore.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}

                                    {!loading && (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                                            itemsPerPage={itemsPerPage}
                                            totalItems={filteredData.length}
                                            onPageChange={handlePageChange}
                                            onItemsPerPageChange={handleItemsPerPageChange}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default BSCDashboard;