import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    CardTitle
} from "@workspace/ui/components/card";
import { Collapsible, CollapsibleContent } from "@workspace/ui/components/collapsible";
import {
    Building,
    Users,
    Clock,
    User
} from 'lucide-react';
import { departmentPerformanceByMonth, individualPerformersByMonth } from '@/lib/dashboardMocks';
import { RankBadge } from "../RankBadge";
import { StatusIndicator } from "./StatusIndicator";
import { TrendIndicator } from "./StatCard";

interface MonthlyDataCollapsibleProps {
    period: string;
    isOpen: boolean;
    onToggle: () => void;
}

// Redesigned MonthlyDataCollapsible Component with Card-Based Layout
export const MonthlyDataCollapsible = ({ period, isOpen, onToggle }: MonthlyDataCollapsibleProps) => {
    return (
        <Collapsible open={isOpen} onOpenChange={onToggle} className="mb-6">
            <CollapsibleContent className="mt-8 ">
                {/* Department Performance Section */}
                <Card className="mb-6">
                    <CardHeader className="px-4 mb-2 bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#1a3b24] dark:to-[#1a3b24]">
                        <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                            <Building className="h-5 w-5 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                            {period} – Top Department Performance
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Highlighting departments with the highest performance scores during {period.toLowerCase()}.
                        </p>
                    </CardHeader>


                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-0">
                        {(departmentPerformanceByMonth[period] || [])
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 5)
                            .map((dept, index) => (
                                <Card
                                    key={`${period}-dept-${index}`}
                                    className="shadow-lg transition-shadow duration-200 dark:bg-gray-800"
                                >
                                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                        <div className="flex items-center">
                                            <RankBadge rank={index + 1} />
                                            <span className="ml-2 font-semibold">{dept.department}</span>
                                        </div>
                                        <StatusIndicator status={dept.status} />
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-500">Current Score</p>
                                                <p className="text-2xl font-bold text-[#1B6131] dark:text-[#46B749]">{dept.score.toFixed(1)}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Previous</p>
                                                <p className="text-lg font-medium">{dept.lastPeriod?.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 flex justify-between items-center border-t">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                            <span className="text-sm text-gray-500">Change</span>
                                        </div>
                                        <TrendIndicator value={dept.score - (dept.lastPeriod || 0)} />
                                    </CardFooter>
                                </Card>
                            ))}
                    </CardContent>
                </Card>

                {/* Top Performers Section */}
                <Card>
                    <CardHeader className="px-4 mt-8 mb-2 bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#1a3b24] dark:to-[#1a3b24]">
                        <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                            <User className="h-5 w-5 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                            {period} – Top Individual Performers
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Featuring the top 5 individuals with outstanding contributions and achievements in {period.toLowerCase()}.
                        </p>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-0">
                        {(individualPerformersByMonth[period] || []).map((person, index) => (
                            <Card
                                key={`${period}-person-${index}`}
                                className="shadow-lg transition-shadow duration-200 dark:bg-gray-800"
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <RankBadge rank={index + 1} />
                                            <span className="ml-2 font-semibold">{person.name}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500">Score</p>
                                            <p className="text-2xl font-bold text-[#1B6131] dark:text-[#46B749]">{person.score.toFixed(1)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Department</p>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1 text-gray-500" />
                                                <span className="font-medium">{person.department}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 flex justify-between items-center border-t">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                        <span className="text-sm text-gray-500">Change</span>
                                    </div>
                                    <TrendIndicator value={person.change} />
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </CollapsibleContent>
        </Collapsible>
    );
};