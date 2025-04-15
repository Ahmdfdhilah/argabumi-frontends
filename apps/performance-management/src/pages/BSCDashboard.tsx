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
import { dummyData } from '../lib/bscMocks';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import { BSCEntry } from '@/lib/types';

// Types
type Period = 'Jan-25' | 'Feb-25' | 'Mar-25' | 'Apr-25' | 'All' | '2022' | '2023' | '2024' | '2025';
type BSCType = 'Monthly' | 'Quarterly' | 'Yearly';
type Perspective = 'Financial' | 'Customer' | 'Internal Business Process' | 'Learning & Growth';

const BSCDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('Jan-25');
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');
    const [selectedType, setSelectedType] = useState<BSCType>('Monthly');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isEndDateDisabled, setIsEndDateDisabled] = useState<boolean>(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Search functionality
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPerspective, setSelectedPerspective] = useState<string>('All');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
        if (selectedType !== 'Yearly') {
            setIsEndDateDisabled(true);
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const handleTypeChange = (value: string) => {
        if (isBSCType(value)) {
            setSelectedType(value);
            if (value !== 'Yearly') {
                setIsEndDateDisabled(true);
                setEndDate('');
            } else {
                setIsEndDateDisabled(false);
            }
        }
    };

    const isBSCType = (value: string): value is BSCType => {
        return ['Monthly', 'Quarterly', 'Yearly'].includes(value);
    };

    const isPeriod = (value: string): value is Period => {
        return ['Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'All', '2022', '2023', '2024', '2025'].includes(value);
    };

    const handlePeriodChange = (value: string) => {
        if (isPeriod(value)) {
            setSelectedPeriod(value);
        }
    };

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
        return dummyData.filter(item => {
            // Search term filter
            const matchesSearch =
                searchTerm === '' ||
                item.kpi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.kpiDefinition.toLowerCase().includes(searchTerm.toLowerCase());

            // Perspective filter
            const matchesPerspective =
                selectedPerspective === 'All' ||
                item.perspective === selectedPerspective;

            // Category filter
            const matchesCategory =
                selectedCategory === 'All' ||
                item.category === selectedCategory;

            return matchesSearch && matchesPerspective && matchesCategory;
        });
    }, [dummyData, searchTerm, selectedPerspective, selectedCategory]);

    // Handle pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, itemsPerPage]);

    // Group paginated data by perspective for display
    const paginatedGroupedData = useMemo(() => {
        return paginatedData.reduce((acc, curr) => {
            if (!acc[curr.perspective]) {
                acc[curr.perspective] = [];
            }
            acc[curr.perspective].push(curr as BSCEntry);
            return acc;
        }, {} as Record<Perspective, BSCEntry[]>);
    }, [paginatedData]);

    // Reset to first page when items per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    // Status indicator component
    const StatusIndicator: React.FC<{ value?: number }> = ({ value }) => {
        if (value ? value > 100 : '') return <ChevronUp className="text-green-500" />;
        if (value ? value < 100 : '') return <ChevronDown className="text-red-500" />;
        return <Minus className="text-yellow-500" />;
    };

    // Calculate totals
    const totals = useMemo(() => {
        return filteredData.reduce((acc, curr) => ({
            weight: acc.weight + (curr.weight ?? 0),
            score: acc.score + (curr.score ?? 0),
            activeWeight: acc.activeWeight + (curr.activeWeight ?? 0),
            totalScore: acc.totalScore + (curr.totalScore ?? 0),
            endScore: acc.endScore + (curr.endScore ?? 0),
        }), {
            weight: 0,
            score: 0,
            activeWeight: 0,
            totalScore: 0,
            endScore: 0,
        });
    }, [filteredData]);

    // Calculate subtotals by perspective
    const perspectiveSubtotals = useMemo(() => {
        return filteredData.reduce((acc, curr) => {
            const perspective = curr.perspective;
            if (!acc[perspective]) {
                acc[perspective] = {
                    weight: 0,
                    score: 0,
                    endScore: 0
                };
            }
            
            acc[perspective].weight += (curr.weight ?? 0);
            acc[perspective].score += (curr.score ?? 0);
            acc[perspective].endScore += (curr.endScore ?? 0);
            
            return acc;
        }, {} as Record<string, { weight: number, score: number, endScore: number }>);
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
                <strong>KPI Definition:</strong> {item.kpiDefinition}
            </p>
            {item.problemIdentification && (
                <p className="text-[#1B6131] dark:text-[#46B749]">
                    <strong>Problem Identification:</strong> {item.problemIdentification}
                </p>
            )}
            {item.correctiveAction && (
                <p className="text-[#1B6131] dark:text-[#46B749]">
                    <strong>Corrective Action:</strong> {item.correctiveAction}
                </p>
            )}
        </div>
    );

    // Get unique perspectives for filter
    const perspectives = ['All', ...new Set(dummyData.map(item => item.perspective))];

    // Get unique categories for filter
    const categories = ['All', ...new Set(dummyData.map(item => item.category))];

    return (
        <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
                currentSystem='Performance Management System'
            />

            <div className="flex">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    role={currentRole}
                    system="performance-management"
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <div className="space-y-6">
                            <Breadcrumb
                                items={[]}
                                currentPage="BSC Dashboard"
                                showHomeIcon={true}
                            />

                            {/* Filter Section */}
                            <Filtering
                                startDate={startDate}
                                endDate={endDate}
                                handleStartDateChange={handleStartDateChange}
                                handleEndDateChange={handleEndDateChange}
                                isEndDateDisabled={isEndDateDisabled}
                                handlePeriodChange={handlePeriodChange}
                                selectedPeriod={selectedPeriod}
                                handleTypeChange={handleTypeChange}
                                selectedType={selectedType}
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
                                        {perspectives.map((perspective) => (
                                            <option key={perspective} value={perspective}>
                                                {perspective}
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
                                            {Object.entries(paginatedGroupedData).map(([perspective, items]) => {
                                                // Create an array to track which items have expanded content
                                                const itemsWithExpanded = items.map(item => ({
                                                    ...item,
                                                    isExpanded: expandedRow === item.id
                                                }));

                                                // Get the subtotals for this perspective
                                                const perspectiveSubtotal = perspectiveSubtotals[perspective] || { 
                                                    weight: 0, 
                                                    score: 0, 
                                                    endScore: 0 
                                                };

                                                return (
                                                    <React.Fragment key={perspective}>
                                                        {/* Render each item row */}
                                                        {itemsWithExpanded.map((item, index) => {
                                                            const isFirstInGroup = index === 0;
                                                            const totalRowsInPerspective = items.length +
                                                                itemsWithExpanded.filter(i => i.isExpanded).length + 1;
                                                            return (
                                                                <React.Fragment key={item.id}>
                                                                    <TableRow
                                                                        onClick={() => handleRowClick(item.id)}
                                                                        className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"
                                                                    >
                                                                        {isFirstInGroup && (
                                                                            <TableCell
                                                                                rowSpan={totalRowsInPerspective}
                                                                                className="bg-[#E4EFCF] dark:bg-[#1B6131]/30 font-medium text-[#1B6131] dark:text-[#46B749]"
                                                                            >
                                                                                {perspective}
                                                                            </TableCell>
                                                                        )}
                                                                        <TableCell className="flex items-center gap-2 text-[#1B6131] dark:text-[#46B749]">
                                                                            {expandedRow === item.id ? (
                                                                                <ChevronDown size={16} />
                                                                            ) : (
                                                                                <ChevronRight size={16} />
                                                                            )}
                                                                            {item.code}
                                                                        </TableCell>
                                                                        <TableCell>{item.kpi}</TableCell>
                                                                        <TableCell>{item.weight}%</TableCell>
                                                                        <TableCell>{item.uom}</TableCell>
                                                                        <TableCell>{item.category}</TableCell>
                                                                        <TableCell>{item.target}</TableCell>
                                                                        <TableCell>{item.actual}</TableCell>
                                                                        <TableCell>{item.achievement}%</TableCell>
                                                                        <TableCell>
                                                                            <StatusIndicator value={item.achievement} />
                                                                        </TableCell>
                                                                        <TableCell>{item.score?.toFixed(2)}</TableCell>
                                                                        <TableCell>{item.endScore?.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                    {expandedRow === item.id && (
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
                                                            <TableCell colSpan={2} className="font-medium">
                                                                {perspective} Subtotal
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {perspectiveSubtotal.weight.toFixed(2)}%
                                                            </TableCell>
                                                            <TableCell colSpan={6}></TableCell>
                                                            <TableCell className="font-medium">
                                                                {perspectiveSubtotal.score.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {perspectiveSubtotal.endScore.toFixed(2)}
                                                            </TableCell>
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

        </div>
    );
};

export default BSCDashboard;