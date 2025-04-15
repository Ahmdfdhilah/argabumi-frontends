import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Info, TrendingUp, Award, BarChart4, Calendar, Target } from 'lucide-react';

// Define types for the component props
export type KPIDetailsProps = {
    title?: string;
    description?: string;
    kpi?: {
        name: string;
        perspective: string;
        number: number | string;
        definition?: string;
        weight?: number;
        uom?: string;
        category?: string;
        ytdCalculation?: string;
        target?: number;
        pic?: string;
        status?: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
    };
    targets?: Record<string, number>;
    actionButtonComponent?: React.ReactNode;
    className?: string;
};

const KPIDetailsCard: React.FC<KPIDetailsProps> = ({
    title = 'KPI Details',
    description = 'Overview of the Key Performance Indicator',
    kpi,
    targets,
    actionButtonComponent,
    className = '',
}) => {
    // Helper function to determine status color
    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'On Track':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'At Risk':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Behind':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // Determine perspective icon
    const getPerspectiveIcon = (perspective?: string) => {
        switch (perspective) {
            case 'Financial':
                return <TrendingUp className="h-4 w-4" />;
            case 'Customer':
                return <Award className="h-4 w-4" />;
            case 'Internal Business Process':
                return <BarChart4 className="h-4 w-4" />;
            case 'Learning & Growth':
                return <Calendar className="h-4 w-4" />;
            default:
                return <Target className="h-4 w-4" />;
        }
    };

    return (
        <Card className={`shadow-lg ${className}`}>
            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                    <div>
                        <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center text-xl">
                            <Info className="mr-2 h-5 w-5" />
                            {title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
                            {description}
                        </CardDescription>
                    </div>
                    {actionButtonComponent}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6 mt-4">
                    {kpi && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-[#1B6131] dark:text-[#46B749]">{kpi.name}</h3>
                                {kpi.status && (
                                    <Badge className={`${getStatusColor(kpi.status)} ml-2`}>
                                        {kpi.status}
                                    </Badge>
                                )}
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                {kpi.perspective && (
                                    <div className="flex items-center space-x-2 mb-3">
                                        {getPerspectiveIcon(kpi.perspective)}
                                        <span className="font-medium">{kpi.perspective}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {kpi.number !== undefined && (
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">KPI Number</span>
                                            <p className="font-medium">{kpi.number}</p>
                                        </div>
                                    )}

                                    {kpi.weight !== undefined && (
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Weight</span>
                                            <p className="font-medium">{kpi.weight}%</p>
                                        </div>
                                    )}

                                    {kpi.target !== undefined && (
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Target</span>
                                            <p className="font-medium">{kpi.target}</p>
                                        </div>
                                    )}

                                    {kpi.uom && (
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">UOM</span>
                                            <p className="font-medium">{kpi.uom}</p>
                                        </div>
                                    )}

                                    {kpi.category && (
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
                                            <p className="font-medium">{kpi.category}</p>
                                        </div>
                                    )}

                                    {kpi.pic && (
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Owner</span>
                                            <p className="font-medium">{kpi.pic}</p>
                                        </div>
                                    )}
                                    {kpi.ytdCalculation && (
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">YTD Calculation</span>
                                            <p className="text-sm">{kpi.ytdCalculation}</p>
                                        </div>
                                    )}
                                </div>

                                {kpi.definition && (
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mt-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Definition</span>
                                        <p className="text-sm">{kpi.definition}</p>
                                    </div>
                                )}


                            </div>
                        </div>
                    )}

                    {targets && Object.keys(targets).length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-[#1B6131] dark:text-[#46B749]">Monthly Targets</h3>
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {Object.entries(targets).map(([month, target]) => (
                                        <div
                                            key={month}
                                            className="bg-gray-50 dark:bg-gray-700 rounded p-3"
                                        >
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{month}</p>
                                            <p className="text-xl font-bold text-[#1B6131] dark:text-[#46B749]">
                                                {typeof target === 'number' ? target.toLocaleString() : target}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default KPIDetailsCard;