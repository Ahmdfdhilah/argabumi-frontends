import { TriangleAlert, User, Users, Wand } from 'lucide-react';
import { useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// Types
type UOMType = 'Number' | '%' | 'Days' | 'Kriteria' | 'Number (Ton)';
type Category = 'Max' | 'Min' | 'On Target';
type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
type Perspective = 'Financial' | 'Customer' | 'Internal Process' | 'Learning and Growth';

type MPMEntry = {
    id: number;
    perspective: Perspective;
    kpi: string;
    kpiDefinition: string;
    weight: number;
    uom: UOMType;
    category: Category;
    ytdCalculation: YTDCalculation;
    targets: Record<string, number>;
    actuals: Record<string, number>;
    achievements: Record<string, number>;
    problemIdentification?: string;
    correctiveAction?: string;
    pic?: string;
    teamId?: number; // Added teamId for navigation
};

// Expanded Row Content
export const ExpandedContent = ({ item }: { item: MPMEntry }) => {
    // const navigate = useNavigate();
    const [viewType, setViewType] = useState<'table' | 'chart' | 'cards'>('table');
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    // Navigation handlers
    const navigateToTeamKPI = () => {
        // navigate(`/teams/kpi/${item.id}?periodYear=${periodYear}`);
    };

    const navigateToActionPlan = () => {
        // navigate(`/teams/action-plan/${item.id}?periodYear=${periodYear}&teamId=${item.teamId || 0}`);
    };

    // Get all months in chronological order
    const months = useMemo(() => {
        return Object.entries(item.targets)
            .filter(([key]) => key.includes('-25') && !key.startsWith('Q') && !key.startsWith('20'))
            .map(([month]) => month)
            .sort((a, b) => {
                const monthA = a.split('-')[0];
                const monthB = b.split('-')[0];
                const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
            });
    }, [item.targets]);

    // Calculate trend data for chart
    const chartData = useMemo(() => {
        return months.map(month => ({
            name: month,
            target: item.targets[month] || 0,
            actual: item.actuals[month] || 0,
            achievement: item.achievements[month] || 0
        }));
    }, [months, item]);

    // Get status color based on achievement value
    const getStatusColor = (achievement: number) => {
        if (achievement >= 100) return 'bg-green-500';
        if (achievement >= 90) return 'bg-amber-500';
        return 'bg-red-500';
    };

    // Get detailed info for a specific month
    const getMonthDetails = (month: string) => {
        return {
            target: item.targets[month] || 0,
            actual: item.actuals[month] || 0,
            achievement: item.achievements[month] || 0,
            status: item.achievements[month] >= 100 ? 'On Track' : (item.achievements[month] >= 90 ? 'At Risk' : 'Off Track')
        };
    };

    return (
        <div className="p-4 space-y-4">
            {/* KPI Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="font-semibold text-[#1B6131] dark:text-[#46B749]">KPI Definition</h4>
                    <p className="text-sm">{item.kpiDefinition}</p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold text-[#1B6131] dark:text-[#46B749]">Calculation Method</h4>
                    <p className="text-sm">{item.ytdCalculation}</p>
                </div>
            </div>


            {/* Problem and Corrective Action */}
            {(item.problemIdentification || item.correctiveAction) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md">
                    {item.problemIdentification && (
                        <div className="space-y-1">
                            <h4 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center">
                                <span className="mr-2">
                                    <TriangleAlert /> </span> Problem Identification
                            </h4>
                            <p className="text-sm">{item.problemIdentification}</p>
                        </div>
                    )}
                    {item.correctiveAction && (
                        <div className="space-y-1">
                            <h4 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center">
                                <span className="mr-2">
                                    <Wand /> </span> Corrective Action
                            </h4>
                            <p className="text-sm">{item.correctiveAction}</p>
                        </div>
                    )}
                </div>
            )}
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-2">
                <button
                    onClick={navigateToTeamKPI}
                    className="px-4 py-2 bg-[#1B6131] hover:bg-[#124020] text-white rounded-md flex items-center justify-center text-sm transition-colors"
                >
                    <span className="mr-2">
                        <Users />
                    </span>
                    Team KPI Details
                </button>
                <button
                    onClick={navigateToActionPlan}
                    className="px-4 py-2 bg-[#46B749] hover:bg-[#37933A] text-white rounded-md flex items-center justify-center text-sm transition-colors"
                >
                    <span className="mr-2">
                        <User />
                    </span>
                    Action Plan Details
                </button>
            </div>

            {/* Monthly Details Section */}
            <div className="mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h4 className="font-semibold text-[#1B6131] dark:text-[#46B749] text-lg">Monthly Details</h4>

                    {/* View Type Toggle */}
                    <div className="mt-2 sm:mt-0 flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                        <button
                            className={`px-3 py-1 text-sm rounded-md ${viewType === 'table' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                            onClick={() => setViewType('table')}
                        >
                            Table
                        </button>
                        <button
                            className={`px-3 py-1 text-sm rounded-md ${viewType === 'chart' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                            onClick={() => setViewType('chart')}
                        >
                            Chart
                        </button>
                        <button
                            className={`px-3 py-1 text-sm rounded-md ${viewType === 'cards' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                            onClick={() => setViewType('cards')}
                        >
                            Cards
                        </button>
                    </div>
                </div>

                {/* Selected Month Detail View */}
                {selectedMonth && (
                    <div className="mb-4 p-3 border-l-4 border-[#1B6131] bg-white dark:bg-gray-700 rounded shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-lg">{selectedMonth} Details</h5>
                            <button
                                onClick={() => setSelectedMonth(null)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Target</div>
                                <div className="text-lg font-medium">{getMonthDetails(selectedMonth).target}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Actual</div>
                                <div className="text-lg font-medium">{getMonthDetails(selectedMonth).actual}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Achievement</div>
                                <div className="text-lg font-medium">{getMonthDetails(selectedMonth).achievement}%</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm
                        ${getMonthDetails(selectedMonth).status === 'On Track' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        getMonthDetails(selectedMonth).status === 'At Risk' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                    {getMonthDetails(selectedMonth).status}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table View */}
                {viewType === 'table' && (
                    <div className="bg-white dark:bg-gray-700 rounded-md shadow-sm overflow-hidden border border-gray-200 dark:border-gray-600">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actual</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Achievement</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                {months.map(month => (
                                    <tr
                                        key={month}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                                        onClick={() => setSelectedMonth(month)}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">{month}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{item.targets[month]}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{item.actuals[month]}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{item.achievements[month]}%</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(item.achievements[month])}`}></span>
                                            {item.achievements[month] >= 100 ? 'On Track' :
                                                (item.achievements[month] >= 90 ? 'At Risk' : 'Off Track')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Chart View */}
                {viewType === 'chart' && (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="target" stroke="#8884d8" name="Target" yAxisId="left" />
                                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" yAxisId="left" />
                                    <Line type="monotone" dataKey="achievement" stroke="#ff7300" name="Achievement %" yAxisId="right" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Cards View */}
                {viewType === 'cards' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {months.map(month => {
                            const achievement = item.achievements[month] || 0;
                            let statusClass = "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";

                            if (achievement < 90) {
                                statusClass = "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
                            } else if (achievement < 100) {
                                statusClass = "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20";
                            }

                            return (
                                <div
                                    key={month}
                                    className={`border rounded-md overflow-hidden shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedMonth === month ? 'ring-2 ring-[#1B6131] dark:ring-[#46B749]' : statusClass
                                        }`}
                                    onClick={() => setSelectedMonth(month)}
                                >
                                    <div className="border-b border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 text-center font-medium">
                                        {month}
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Target:</span>
                                            <span className="font-medium">{item.targets[month]}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Actual:</span>
                                            <span className="font-medium">{item.actuals[month]}</span>
                                        </div>
                                        <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Achievement:</span>
                                                <span className={`font-medium text-sm ${achievement >= 100 ? 'text-green-600 dark:text-green-400' :
                                                    achievement >= 90 ? 'text-amber-600 dark:text-amber-400' :
                                                        'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {achievement}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                                <div
                                                    className={`h-1.5 rounded-full ${getStatusColor(achievement)}`}
                                                    style={{ width: `${Math.min(achievement, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};