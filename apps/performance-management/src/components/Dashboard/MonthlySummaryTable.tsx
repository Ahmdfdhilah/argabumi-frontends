import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from 'lucide-react';

import { departmentPerformanceByMonth, individualPerformersByMonth } from '@/lib/dashboardMocks';
import { TrendIndicator } from "./StatCard";

interface MonthlySummaryTableProps {
    periods: string[];
    onMonthClick: (period: string) => void;
    activePeriod: string | null;
}

// Monthly summary component with card-based mobile layout
export const MonthlySummaryTable = ({ periods, onMonthClick, activePeriod }: MonthlySummaryTableProps) => {
    return (
        <Card>
            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#1a3b24] dark:to-[#1a3b24] pb-4">
                <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                    Performance by Month
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">Click on a month to view detailed performance data</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-2 md:mt-0">
                {/* Desktop Layout - Table style */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-5 p-3 bg-[#1B6131] text-white font-medium px-8">
                        <div>Month</div>
                        <div className="text-center">Avg. Dept Score</div>
                        <div className="text-center">Avg. Emp Score</div>
                        <div className="text-center">Depts On Track</div>
                        <div className="text-center">Actions</div>
                    </div>
                    
                    <div className="divide-y border rounded-b-lg dark:divide-gray-700 dark:border-gray-700 ">
                        {periods.map((period) => {
                            const deptData = departmentPerformanceByMonth[period] || [];
                            const indivData = individualPerformersByMonth[period] || [];

                            const deptAvg = deptData.length > 0
                                ? deptData.reduce((sum, dept) => sum + dept.score, 0) / deptData.length
                                : 0;

                            const indivAvg = indivData.length > 0
                                ? indivData.reduce((sum, indiv) => sum + indiv.score, 0) / indivData.length
                                : 0;
                            const deptsOnTrack = deptData.filter((dept) => dept.status === 'On Track').length;

                            return (
                                <div 
                                    key={`desktop-${period}`} 
                                    className={`grid grid-cols-5 items-center p-3 px-6 ${period === activePeriod ? "bg-[#E4EFCF]/50 dark:bg-[#1B6131]/20" : "hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"}`}
                                >
                                    <div className="font-medium dark:text-gray-200">{period}</div>
                                    <div className="text-center"><TrendIndicator value={deptAvg}/></div>
                                    <div className="text-center"><TrendIndicator value={indivAvg}/></div>
                                    <div className="text-center dark:text-gray-200">{deptsOnTrack} of {deptData.length}</div>
                                    <div className="text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onMonthClick(period)}
                                            className="border-[#46B749] text-[#1B6131] hover:bg-[#e6f3e6] dark:border-[#46B749] dark:text-[#46B749] dark:hover:bg-[#1a3b24] dark:hover:text-[#46B749]"
                                        >
                                            {period === activePeriod ? "Hide Details" : "View Details"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Mobile Layout - Card style */}
                <div className="md:hidden space-y-4">
                    {periods.map((period) => {
                        const deptData = departmentPerformanceByMonth[period] || [];
                        const indivData = individualPerformersByMonth[period] || [];

                        const deptAvg = deptData.length > 0
                            ? deptData.reduce((sum, dept) => sum + dept.score, 0) / deptData.length
                            : 0;

                        const indivAvg = indivData.length > 0
                            ? indivData.reduce((sum, indiv) => sum + indiv.score, 0) / indivData.length
                            : 0;
                        const deptsOnTrack = deptData.filter((dept) => dept.status === 'On Track').length;

                        return (
                            <Card 
                                key={`mobile-${period}`} 
                                className={`shadow ${period === activePeriod ? "border-2 border-[#E4EFCF]/50" : "border dark:border-[#1B6131]/20"}`}
                            >
                                <CardHeader className="p-3 pb-2 bg-gray-50 dark:bg-gray-800">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="px-2 text-lg font-medium">{period}</CardTitle>
                                        <Button
                                            variant={period === activePeriod ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onMonthClick(period)}
                                            className={period === activePeriod 
                                                ? "bg-[#1B6131] hover:bg-[#164e28] text-white" 
                                                : "border-[#46B749] text-[#1B6131] hover:bg-[#e6f3e6]"}
                                        >
                                            {period === activePeriod ? "Hide Details" : "View Details"}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 dark:bg-gray-800">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#E4EFCF] dark:bg-[#1a3b24]/80 p-3 rounded-lg">
                                            <div className="text-gray-500 dark:text-gray-300 text-sm">Dept Score</div>
                                            <div className="text-lg font-semibold text-[#1B6131] dark:text-[#46B749]">{deptAvg.toFixed(1)}%</div>
                                        </div>
                                        <div className="bg-[#E4EFCF] dark:bg-[#1a3b24]/80 p-3 rounded-lg">
                                            <div className="text-gray-500 dark:text-gray-300 text-sm">Emp Score</div>
                                            <div className="text-lg font-semibold text-[#1B6131] dark:text-[#46B749]">{indivAvg.toFixed(1)}%</div>
                                        </div>
                                        <div className="bg-[#E4EFCF] dark:bg-[#1a3b24]/80 p-3 rounded-lg col-span-2">
                                            <div className="text-gray-500 dark:text-gray-300 text-sm">Departments On Track</div>
                                            <div className="text-lg font-semibold text-[#1B6131] dark:text-[#46B749]">{deptsOnTrack} of {deptData.length}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};