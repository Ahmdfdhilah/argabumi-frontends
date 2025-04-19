import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import {
    Building,
    ClockIcon,
    Award,
    Calendar,
} from 'lucide-react';
import Filtering from '@/components/Filtering';
import { PerformanceChart } from '@/components/Dashboard/LineChartDashboard';
import { StatCard } from '@/components/Dashboard/StatCard';
import { DistributionBar } from '@/components/Dashboard/DistributionBar';
import { availablePeriods, availableYears, departmentPerformanceByMonth, individualPerformersByMonth } from '@/lib/dashboardMocks';
import Footer from '@/components/Footer';
import { MonthlyDataCollapsible } from '@/components/Dashboard/MonthlyDataCollapsible';
import { MonthlySummaryTable } from '@/components/Dashboard/MonthlySummaryTable';

interface TrendData {
    month: string;
    mpm: number;
    ipm: number;
    target: number;
}
const PerformanceManagementDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
   
    const [startPeriod, setStartPeriod] = useState('January');
    const [endPeriod, setEndPeriod] = useState('June');
    const [selectedMonth, setSelectedMonth] = useState('January');
    const [selectedYear, setSelectedYear] = useState('2025');
    const [availableEndPeriods, setAvailableEndPeriods] = useState<string[]>([]);
    const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [useSingleMonth, setUseSingleMonth] = useState(false);
    const [activePeriod, setActivePeriod] = useState<string | null>(null);

    // Set available end periods based on start period
    useEffect(() => {
        const startIndex = availablePeriods.indexOf(startPeriod);
        // Show all months, not just 6
        const endOptions = availablePeriods.slice(startIndex);
        setAvailableEndPeriods(endOptions);

        // If current end period is not valid, set to max available
        if (!endOptions.includes(endPeriod)) {
            setEndPeriod(endOptions[endOptions.length - 1]);
        }
    }, [startPeriod]);

    const calculateAverageScore = () => {
        if (selectedPeriods.length === 0) return 0;

        const sum = selectedPeriods.reduce((acc, period) => {
            const deptData = departmentPerformanceByMonth[period];
            if (!deptData) return acc;

            const periodAvg = deptData.reduce((sum, dept) => sum + dept.score, 0) / deptData.length;
            return acc + periodAvg;
        }, 0);

        return (sum / selectedPeriods.length).toFixed(1);
    };

    const calculateTrend = () => {
        if (selectedPeriods.length < 2) return 0;

        const currentPeriod = selectedPeriods[selectedPeriods.length - 1];
        const previousPeriod = selectedPeriods[selectedPeriods.length - 2];

        const currentDeptData = departmentPerformanceByMonth[currentPeriod] || [];
        const prevDeptData = departmentPerformanceByMonth[previousPeriod] || [];

        if (currentDeptData.length === 0 || prevDeptData.length === 0) return 0;

        const currentAvg = currentDeptData.reduce((sum, dept) => sum + dept.score, 0) / currentDeptData.length;
        const prevAvg = prevDeptData.reduce((sum, dept) => sum + dept.score, 0) / prevDeptData.length;

        return ((currentAvg - prevAvg) / prevAvg) * 100;
    };

    useEffect(() => {
        if (useSingleMonth) {
            setSelectedPeriods([selectedMonth]);
            setActivePeriod(null);

            const deptData = departmentPerformanceByMonth[selectedMonth] || [];
            const indivData = individualPerformersByMonth[selectedMonth] || [];

            const deptAvg = deptData.length > 0
                ? deptData.reduce((sum, dept) => sum + dept.score, 0) / deptData.length
                : 0;

            const indivAvg = indivData.length > 0
                ? indivData.reduce((sum, indiv) => sum + indiv.score, 0) / indivData.length
                : 0;

            setTrendData([{
                month: selectedMonth,
                mpm: deptAvg,
                ipm: indivAvg,
                target: 85
            }]);
        } else {
            const startIndex = availablePeriods.indexOf(startPeriod);
            const endIndex = availablePeriods.indexOf(endPeriod);

            if (startIndex <= endIndex) {
                const periods = availablePeriods.slice(startIndex, endIndex + 1);
                setSelectedPeriods(periods);
                setActivePeriod(null);

                const newTrendData = periods.map(period => {
                    const deptData = departmentPerformanceByMonth[period] || [];
                    const indivData = individualPerformersByMonth[period] || [];

                    const deptAvg = deptData.length > 0
                        ? deptData.reduce((sum, dept) => sum + dept.score, 0) / deptData.length
                        : 0;

                    const indivAvg = indivData.length > 0
                        ? indivData.reduce((sum, indiv) => sum + indiv.score, 0) / indivData.length
                        : 0;

                    return {
                        month: period,
                        mpm: Number(deptAvg.toFixed(2)),
                        ipm: Number(indivAvg.toFixed(2)),
                        target: 85
                    };
                });
                setTrendData(newTrendData);
            }
        }
    }, [startPeriod, endPeriod, useSingleMonth, selectedMonth]);

    const handleMonthClick = (period: string) => {
        setActivePeriod(activePeriod === period ? null : period);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>        <div className="space-y-6">
                        <Breadcrumb
                            items={[]}
                            currentPage="Performance Management Dashboard"
                            showHomeIcon={true}
                        />

                        <Filtering>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="single-month-mode"
                                    checked={useSingleMonth}
                                    onCheckedChange={setUseSingleMonth}
                                />
                                <Label htmlFor="single-month-mode">Single Month View</Label>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <Calendar className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                    <span>Period Year</span>
                                </label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map((year) => (
                                            <SelectItem key={`year-${year}`} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {useSingleMonth ? (
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <ClockIcon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Select Month</span>
                                    </label>
                                    <Select
                                        value={selectedMonth}
                                        onValueChange={setSelectedMonth}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                            <SelectValue placeholder="Select Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePeriods.map((period) => (
                                                <SelectItem key={`month-${period}`} value={period}>
                                                    {period}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                            <ClockIcon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                            <span>Start Period</span>
                                        </label>
                                        <Select
                                            value={startPeriod}
                                            onValueChange={setStartPeriod}
                                        >
                                            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                                <SelectValue placeholder="Select Start Period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availablePeriods.map((period) => (
                                                    <SelectItem key={`start-${period}`} value={period}>
                                                        {period}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                            <ClockIcon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                            <span>End Period</span>
                                        </label>
                                        <Select
                                            value={endPeriod}
                                            onValueChange={setEndPeriod}
                                        >
                                            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                                <SelectValue placeholder="Select End Period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableEndPeriods.map((period) => (
                                                    <SelectItem key={`end-${period}`} value={period}>
                                                        {period}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </Filtering>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Overall Performance Score */}
                            <StatCard
                                title="Overall Performance"
                                value={calculateAverageScore()}
                                subtitle="out of 100"
                                trend={calculateTrend()}
                                icon={<Award />}
                                progress={Number(calculateAverageScore())}
                            />

                            {/* Departments On Track */}
                            <StatCard
                                title="Departments On Track"
                                value="3"
                                subtitle="of 6 departments"
                                icon={<Building />}
                            >
                                <DistributionBar
                                    data={[
                                        { value: 3, color: "bg-green-500", textColor: "text-green-600", label: "On Track" },
                                        { value: 2, color: "bg-yellow-500", textColor: "text-yellow-600", label: "At Risk" },
                                        { value: 1, color: "bg-red-500", textColor: "text-red-600", label: "Behind" },
                                    ]}
                                />
                            </StatCard>

                            {/* Employee On Track */}
                            <StatCard
                                title="Employees On Track"
                                value="50"
                                subtitle="of 100 departments"
                                icon={<Building />}
                            >
                                <DistributionBar
                                    data={[
                                        { value: 3, color: "bg-green-500", textColor: "text-green-600", label: "On Track" },
                                        { value: 2, color: "bg-yellow-500", textColor: "text-yellow-600", label: "At Risk" },
                                        { value: 1, color: "bg-red-500", textColor: "text-red-600", label: "Behind" },
                                    ]}
                                />
                            </StatCard>
                        </div>

                        {/* Performance Trends Chart - Only show when not in single month mode */}
                        {!useSingleMonth && (
                            <PerformanceChart
                                data={trendData}
                                title='Performance Trends'
                                description='Monthly progression of performance metrics compared to targets'
                            />
                        )}

                        {/* Single Month View */}
                        {useSingleMonth && (
                            <MonthlyDataCollapsible
                                period={selectedMonth}
                                isOpen={true}
                                onToggle={() => { }} // Empty function since don't need to toggle in single month view
                            />
                        )}

                        {/* Monthly data view for range mode */}
                        {!useSingleMonth && (
                            <>
                                {/* Summary table for all months in the range */}
                                <MonthlySummaryTable
                                    periods={selectedPeriods}
                                    onMonthClick={handleMonthClick}
                                    activePeriod={activePeriod}
                                />

                                {/* Collapsible content for the selected month */}
                                {activePeriod && (
                                    <MonthlyDataCollapsible
                                        period={activePeriod}
                                        isOpen={true}
                                        onToggle={() => setActivePeriod(null)}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default PerformanceManagementDashboard;