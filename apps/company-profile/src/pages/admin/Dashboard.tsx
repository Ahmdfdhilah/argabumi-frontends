// src/pages/dashboard/Dashboard.tsx
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@workspace/ui/components/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@workspace/ui/components/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@workspace/ui/components/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@workspace/ui/components/tabs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import {
    Activity,
    Search,
    UserCircle2,
    Database,
    Calendar,
    Clock,
    BarChart3,
    LogIn,
    FileEdit,
    Trash2,
    Eye,
    FileOutput,
    FileInput,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    InfoIcon
} from "lucide-react";
import { activityLogService } from "@/services/activityLogs";
import { formatDistance } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import Pagination from "@/components/admin/Pagination";
import Filtering from "@/components/admin/Filtering";
import { useDebounce } from "@/hooks/useDebounce";
import { Separator } from "@workspace/ui/components/separator";
import { WebsiteLivePreview } from "@/components/admin/WebsiteLivePreview";

// Add these type definitions based on your data structure
export enum ActivityType {
    CREATE = "ActivityType.CREATE",
    UPDATE = "ActivityType.UPDATE",
    DELETE = "ActivityType.DELETE",
    VIEW = "ActivityType.VIEW",
    LOGIN = "ActivityType.LOGIN",
    LOGOUT = "ActivityType.LOGOUT",
    EXPORT = "ActivityType.EXPORT",
    IMPORT = "ActivityType.IMPORT",
    APPROVE = "ActivityType.APPROVE",
    REJECT = "ActivityType.REJECT",
    OTHER = "ActivityType.OTHER"
}

interface RecentActivity {
    id: number;
    user_id: number;
    type: string;
    table: string;
    description: string;
    timestamp: string;
    user_name: string;
    user_email: string;
}

interface ActivityLogStats {
    total_activities: number;
    activities_by_type: Record<string, number>;
    activities_by_user: Record<string, number>;
    activities_by_table: Record<string, number>;
    recent_activities: RecentActivity[];
}

interface ActivityLogRecord {
    activity_id: number;
    activity_user_id: number;
    activity_type: ActivityType;
    activity_table_code: string;
    activity_record_id: number;
    activity_description: string;
    activity_timestamp: string;
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
    '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'
];

const ActivityBadge = ({ type }: { type: ActivityType }) => {
    const badgeStyles = {
        [ActivityType.CREATE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        [ActivityType.UPDATE]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        [ActivityType.DELETE]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        [ActivityType.VIEW]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        [ActivityType.LOGIN]: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100",
        [ActivityType.LOGOUT]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        [ActivityType.EXPORT]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
        [ActivityType.IMPORT]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
        [ActivityType.APPROVE]: "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-100",
        [ActivityType.REJECT]: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100",
        [ActivityType.OTHER]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    };

    const icons = {
        [ActivityType.CREATE]: <FileEdit size={14} className="mr-1" />,
        [ActivityType.UPDATE]: <FileEdit size={14} className="mr-1" />,
        [ActivityType.DELETE]: <Trash2 size={14} className="mr-1" />,
        [ActivityType.VIEW]: <Eye size={14} className="mr-1" />,
        [ActivityType.LOGIN]: <LogIn size={14} className="mr-1" />,
        [ActivityType.LOGOUT]: <LogIn size={14} className="mr-1" />,
        [ActivityType.EXPORT]: <FileOutput size={14} className="mr-1" />,
        [ActivityType.IMPORT]: <FileInput size={14} className="mr-1" />,
        [ActivityType.APPROVE]: <CheckCircle2 size={14} className="mr-1" />,
        [ActivityType.REJECT]: <XCircle size={14} className="mr-1" />,
        [ActivityType.OTHER]: <MoreHorizontal size={14} className="mr-1" />,
    };

    return (
        <Badge variant="outline" className={`flex items-center px-2 py-1 rounded-md ${badgeStyles[type]}`}>
            {icons[type]}
            {type.replace('ActivityType.', '')}
        </Badge>
    );
};

export function DashboardAdmin() {
    // State variables
    const [recentLogs, setRecentLogs] = useState<ActivityLogRecord[]>([]);
    const [statistics, setStatistics] = useState<ActivityLogStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterTable, setFilterTable] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Debounced search term
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const stats = await activityLogService.getActivityStatistics();
                const transformedStats: ActivityLogStats = {
                    ...stats,
                    recent_activities: stats.recent_activities.map(activity => ({
                        ...activity,
                        user_id: activity.user_id || 0,
                        user_name: activity.user?.name || '',
                        user_email: activity.user?.email || ''
                    }))
                };
                setStatistics(transformedStats);

                // Transform recent activities into the expected format
                if (transformedStats && transformedStats.recent_activities) {
                    const formattedLogs = transformedStats.recent_activities.map(activity => ({
                        activity_id: activity.id,
                        activity_user_id: activity.user_id,
                        activity_type: activity.type as ActivityType,
                        activity_table_code: activity.table,
                        activity_record_id: activity.id,
                        activity_description: activity.description,
                        activity_timestamp: activity.timestamp
                    }));
                    setRecentLogs(formattedLogs);
                }
            } catch (error) {
                console.error("Failed to fetch activity logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter logs based on search term and filter options
    const filteredLogs = recentLogs.filter(log => {
        const matchesSearch = debouncedSearchTerm === "" ||
            log.activity_description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            log.activity_table_code.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

        const matchesType = filterType === "all" || log.activity_type === filterType;
        const matchesTable = filterTable === "all" || log.activity_table_code === filterTable;

        return matchesSearch && matchesType && matchesTable;
    });

    // Calculate pagination
    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // Get unique tables for filter options
    const uniqueTables = Array.from(new Set(recentLogs.map(log => log.activity_table_code)));

    // Handler for changing page
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Handler for changing items per page
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setPage(1); // Reset to first page
    };

    // Prepare data for charts
    const activityTypeChartData = statistics && statistics.activities_by_type
        ? Object.entries(statistics.activities_by_type).map(([type, count]) => ({
            name: type.replace('ActivityType.', ''),
            value: count
        }))
        : [];

    const activityTableChartData = statistics && statistics.activities_by_table
        ? Object.entries(statistics.activities_by_table).map(([table, count]) => ({
            name: table,
            value: count
        }))
        : [];

    const userActivityChartData = statistics && statistics.activities_by_user
        ? Object.entries(statistics.activities_by_user).map(([userId, count]) => ({
            name: `User ${userId}`,
            value: count
        }))
        : [];

    // Get activity icon based on type
    const getActivityIcon = (type: ActivityType) => {
        switch (type) {
            case ActivityType.CREATE:
                return <FileEdit className="text-primary-600" />;
            case ActivityType.UPDATE:
                return <FileEdit className="text-blue-500" />;
            case ActivityType.DELETE:
                return <Trash2 className="text-red-500" />;
            case ActivityType.VIEW:
                return <Eye className="text-gray-500" />;
            case ActivityType.LOGIN:
                return <LogIn className="text-primary-500" />;
            case ActivityType.LOGOUT:
                return <LogIn className="text-orange-500" />;
            case ActivityType.EXPORT:
                return <FileOutput className="text-purple-500" />;
            case ActivityType.IMPORT:
                return <FileInput className="text-indigo-500" />;
            case ActivityType.APPROVE:
                return <CheckCircle2 className="text-secondary-500" />;
            case ActivityType.REJECT:
                return <XCircle className="text-rose-500" />;
            default:
                return <Activity className="text-gray-500" />;
        }
    };

    return (
        <div className="container mx-auto">
            <div className="px-4 py-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-white dark:bg-gray-800 rounded-md shadow-md">
                <div>
                    <h1 className="text-3xl font-bold text-primary-600">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Monitor and analyze user activities and website performance across the system</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6 shadow-md rounded-md bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                                <h3 className="text-2xl font-bold">{statistics?.total_activities || 0}</h3>
                            </div>
                            <div className="p-2 bg-primary-50 rounded-full">
                                <Activity className="h-6 w-6 text-primary-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 shadow-md rounded-md bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                                <h3 className="text-2xl font-bold">
                                    {statistics?.activities_by_user ? Object.keys(statistics.activities_by_user).length : 0}
                                </h3>
                            </div>
                            <div className="p-2 bg-secondary-50 rounded-full">
                                <UserCircle2 className="h-6 w-6 text-secondary-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 shadow-md rounded-md bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Data Tables</p>
                                <h3 className="text-2xl font-bold">
                                    {statistics?.activities_by_table ? Object.keys(statistics.activities_by_table).length : 0}
                                </h3>
                            </div>
                            <div className="p-2 bg-lime-50 rounded-full">
                                <Database className="h-6 w-6 text-primary-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 shadow-md rounded-md bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Recent Period</p>
                                <h3 className="text-2xl font-bold">Today</h3>
                            </div>
                            <div className="p-2 bg-lime-50 rounded-full">
                                <Calendar className="h-6 w-6 text-primary-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="pb-8">
                <WebsiteLivePreview url="https://argabumi-frontends-company-profile.vercel.app" />
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="activity-log" className="mb-8 w-full">
                <div className="rounded-lg bg-accent/30 dark:bg-sidebar-accent/10 p-1 w-full pb-12 md:pb-3">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 bg-transparent">
                        <TabsTrigger
                            value="activity-log"
                            className="flex items-center justify-center py-2 px-3"
                        >
                            <Activity className="mr-2 h-4 w-4" />
                            <span>Activity Log</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="statistics"
                            className="flex items-center justify-center py-2 px-3"
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Statistics</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="by-user"
                            className="flex items-center justify-center py-2 px-3"
                        >
                            <UserCircle2 className="mr-2 h-4 w-4" />
                            <span>By User</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="by-table"
                            className="flex items-center justify-center py-2 px-3"
                        >
                            <Database className="mr-2 h-4 w-4" />
                            <span>By Table</span>
                        </TabsTrigger>
                    </TabsList>
                </div>


                {/* Activity Log Tab */}
                <TabsContent value="activity-log" className="shadow-md rounded-md pb-8 bg-white dark:bg-gray-800">
                    <Card>
                        <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                            <CardTitle>Recent Activity Logs</CardTitle>
                            <CardDescription>
                                View and filter recent user activities across the system
                            </CardDescription>
                            <Separator className="border-primary-600 dark:border-primary-400" />
                        </CardHeader>

                        <CardContent className="p-0">
                            <Filtering>
                                <div className="w-full space-y-2">
                                    <label className="text-sm font-medium text-foreground dark:text-foreground">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search activities..."
                                            className="pl-8 border-primary-200 dark:border-primary-800"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="w-full space-y-2">
                                    <label className="text-sm font-medium text-foreground dark:text-foreground">
                                        Activity Type
                                    </label>
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="border-primary-200 dark:border-primary-800">
                                            <SelectValue placeholder="Filter by type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {Object.values(ActivityType).map((type) => (
                                                <SelectItem key={type} value={type}>{type.replace('ActivityType.', '')}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-full space-y-2">
                                    <label className="text-sm font-medium text-foreground dark:text-foreground">
                                        Data Table
                                    </label>
                                    <Select value={filterTable} onValueChange={setFilterTable}>
                                        <SelectTrigger className="border-primary-200 dark:border-primary-800">
                                            <SelectValue placeholder="Filter by table" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Tables</SelectItem>
                                            {uniqueTables.map((table) => (
                                                <SelectItem key={table} value={table}>{table}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Empty div to maintain grid layout */}
                                <div className="w-full"></div>
                            </Filtering>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Type</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Table</TableHead>
                                                    <TableHead>Record ID</TableHead>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Time</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedLogs.length > 0 ? (
                                                    paginatedLogs.map((log) => (
                                                        <TableRow key={log.activity_id}>
                                                            <TableCell>
                                                                <ActivityBadge type={log.activity_type} />
                                                            </TableCell>
                                                            <TableCell className="font-medium">{log.activity_description}</TableCell>
                                                            <TableCell><Badge variant="outline">{log.activity_table_code}</Badge></TableCell>
                                                            <TableCell>{log.activity_record_id}</TableCell>
                                                            <TableCell>
                                                                {log.activity_user_id ? (
                                                                    <div className="flex items-center">
                                                                        <UserCircle2 className="mr-2 h-4 w-4 text-primary-500" />
                                                                        User {log.activity_user_id}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">System</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center text-muted-foreground text-sm">
                                                                    <Clock className="mr-1 h-3 w-3" />
                                                                    {formatDistance(new Date(log.activity_timestamp), new Date(), { addSuffix: true })}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="h-24 text-center">
                                                            No results found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={totalItems}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="statistics">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-md bg-white dark:bg-gray-800 rounded-md">
                            <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                                <CardTitle>Activities by Type</CardTitle>
                                <CardDescription>Distribution of activities by action type</CardDescription>
                                <Separator className="border-primary-600 dark:border-primary-400" />
                            </CardHeader>

                            <CardContent className="h-80">
                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : activityTypeChartData.length > 0 ? (
                                    <PieChart width={400} height={300}>
                                        <Pie
                                            data={activityTypeChartData}
                                            cx={200}
                                            cy={150}
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {activityTypeChartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                ) : (
                                    <div className="flex justify-center items-center h-64">
                                        <p className="text-muted-foreground">No data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-md bg-white dark:bg-gray-800 rounded-md">
                            <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                                <CardTitle>Activities by Table</CardTitle>
                                <CardDescription>Distribution of activities by data table</CardDescription>
                                <Separator className="border-primary-600 dark:border-primary-400" />
                            </CardHeader>
                            <CardContent className="h-80 mt-4">
                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : activityTableChartData.length > 0 ? (
                                    <BarChart
                                        width={400}
                                        height={300}
                                        data={activityTableChartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Count" fill="#1B6131" />
                                    </BarChart>
                                ) : (
                                    <div className="flex justify-center items-center h-64">
                                        <p className="text-muted-foreground">No data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 mt-4 shadow-md bg-white dark:bg-gray-800 rounded-md">
                            <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                                <CardTitle>User Activity</CardTitle>
                                <CardDescription>Number of activities performed by each user</CardDescription>
                                <Separator className="border-primary-600 dark:border-primary-400" />
                            </CardHeader>
                            <CardContent className="h-80 mt-4">
                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : userActivityChartData.length > 0 ? (
                                    <BarChart
                                        width={800}
                                        height={300}
                                        data={userActivityChartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Activities" fill="#46B749">
                                            {userActivityChartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                ) : (
                                    <div className="flex justify-center items-center h-64">
                                        <p className="text-muted-foreground">No data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* By User Tab */}
                <TabsContent value="by-user" className="shadow-md rounded-md pb-8 bg-white dark:bg-gray-800">
                    <Card>
                        <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                            <CardTitle>Activity by User</CardTitle>
                            <CardDescription>
                                View and filter recent user activities across the system
                            </CardDescription>
                            <Separator className="border-primary-600 dark:border-primary-400" />
                        </CardHeader>
                        <CardContent className="p-0 ">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                                </div>
                            ) : statistics?.activities_by_user ? (
                                <div className="space-y-8">
                                    {Object.entries(statistics.activities_by_user)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([userId, count]) => (
                                            <div key={userId} className="p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center">
                                                        <div className="bg-primary-100 p-3 rounded-full mr-4">
                                                            <UserCircle2 className="h-8 w-8 text-primary-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold">User {userId}</h3>
                                                            <p className="text-sm text-muted-foreground">{count} activities</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">View Details</Button>
                                                </div>

                                                {/* Sample activities for this user */}
                                                <div className="space-y-2">
                                                    {recentLogs
                                                        .filter(log => log.activity_user_id?.toString() === userId)
                                                        .slice(0, 3)
                                                        .map(log => (
                                                            <div key={log.activity_id} className="flex items-center text-sm p-2 hover:bg-muted rounded-md">
                                                                {getActivityIcon(log.activity_type)}
                                                                <span className="ml-2">{log.activity_description}</span>
                                                                <span className="ml-auto text-muted-foreground">
                                                                    {formatDistance(new Date(log.activity_timestamp), new Date(), { addSuffix: true })}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>

                                                {recentLogs.filter(log => log.activity_user_id?.toString() === userId).length > 3 && (
                                                    <Button variant="ghost" size="sm" className="w-full mt-2 text-primary">
                                                        View all activities
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <Alert variant="default" className="bg-muted">
                                    <InfoIcon className="h-4 w-4" />
                                    <AlertTitle>No user data available</AlertTitle>
                                    <AlertDescription>
                                        There is currently no user activity data to display.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* By Table Tab */}
                <TabsContent value="by-table" className="shadow-md rounded-md pb-8 bg-white dark:bg-gray-800">
                    <Card>
                        <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                            <CardTitle>Activity by Table</CardTitle>
                            <CardDescription>View activity logs grouped by data table</CardDescription>
                            <Separator className="border-primary-600 dark:border-primary-400" />
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                                </div>
                            ) : statistics?.activities_by_table ? (
                                <div className="space-y-6">
                                    {Object.entries(statistics.activities_by_table)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([table, count]) => (
                                            <Card key={table}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center">
                                                            <div className="bg-primary-50 p-2 rounded-full mr-3">
                                                                <Database className="h-6 w-6 text-primary-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold">{table}</h3>
                                                                <p className="text-sm text-muted-foreground">{count} activities</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm">View Details</Button>
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-2 mt-4">
                                                        {Object.values(ActivityType).map(type => {
                                                            const typeCount = recentLogs.filter(
                                                                log => log.activity_table_code === table && log.activity_type === type
                                                            ).length;

                                                            if (typeCount === 0) return null;

                                                            return (
                                                                <div key={type} className="flex items-center space-x-1 text-xs">
                                                                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                                                    <span>{type.replace('ActivityType.', '')}</span>
                                                                    <span className="font-bold">({typeCount})</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t">
                                                        <h4 className="text-sm font-medium mb-2">Most Recent Activities</h4>
                                                        <div className="space-y-2">
                                                            {recentLogs
                                                                .filter(log => log.activity_table_code === table)
                                                                .slice(0, 2)
                                                                .map(log => (
                                                                    <div key={log.activity_id} className="flex items-center text-sm p-2 hover:bg-muted rounded-md">
                                                                        {getActivityIcon(log.activity_type)}
                                                                        <span className="ml-2">{log.activity_description}</span>
                                                                        <span className="ml-auto text-muted-foreground">
                                                                            {formatDistance(new Date(log.activity_timestamp), new Date(), { addSuffix: true })}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            ) : (
                                <Alert variant="default" className="bg-muted">
                                    <InfoIcon className="h-4 w-4" />
                                    <AlertTitle>No table data available</AlertTitle>
                                    <AlertDescription>
                                        There is currently no table activity data to display.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Quick Activity Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="shadow-md bg-white dark:bg-gray-800 rounded-md">
                    <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                        <CardTitle>Activity Insights</CardTitle>
                        <CardDescription>System activity trends and insights</CardDescription>
                        <Separator className="border-primary-600 dark:border-primary-400" />
                    </CardHeader>
                    <CardContent className="mt-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Alert variant="default" className="bg-primary-50 border-primary-200 text-primary-800">
                                    <Activity className="h-4 w-4" />
                                    <AlertTitle>Activity Peak</AlertTitle>
                                    <AlertDescription>
                                        Highest activity was recorded {formatDistance(new Date(), new Date(), { addSuffix: true })}
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Most Active User</span>
                                        <span className="text-primary-600 font-semibold">
                                            {statistics?.activities_by_user && Object.keys(statistics.activities_by_user).length > 0
                                                ? `User ${Object.entries(statistics.activities_by_user)
                                                    .sort((a, b) => b[1] - a[1])[0][0]}`
                                                : 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Most Used Table</span>
                                        <span className="text-primary-600 font-semibold">
                                            {statistics?.activities_by_table && Object.keys(statistics.activities_by_table).length > 0
                                                ? Object.entries(statistics.activities_by_table)
                                                    .sort((a, b) => b[1] - a[1])[0][0]
                                                : 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Most Common Activity</span>
                                        <span className="text-primary-600 font-semibold">
                                            {statistics?.activities_by_type && Object.keys(statistics.activities_by_type).length > 0
                                                ? Object.entries(statistics.activities_by_type)
                                                    .sort((a, b) => b[1] - a[1])[0][0]
                                                    .replace('ActivityType.', '')
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-md bg-white dark:bg-gray-800 rounded-md">
                    <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                        <CardTitle>Recent Activities Timeline</CardTitle>
                        <CardDescription>Recent system activities by time</CardDescription>
                        <Separator className="border-primary-600 dark:border-primary-400" />
                    </CardHeader>
                    <CardContent className="mt-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                        ) : recentLogs.length > 0 ? (
                            <div className="space-y-4">
                                {recentLogs.slice(0, 5).map((log) => (
                                    <div key={log.activity_id} className="flex">
                                        <div className="mr-4 flex flex-col items-center">
                                            <div className="rounded-full p-2 bg-primary-100">
                                                {getActivityIcon(log.activity_type)}
                                            </div>
                                            <div className="h-full w-px bg-border mt-2"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium">{log.activity_description}</p>
                                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                                <UserCircle2 className="mr-1 h-3 w-3" />
                                                <span>User {log.activity_user_id}</span>
                                                <span className="mx-2">•</span>
                                                <Badge variant="outline">{log.activity_table_code}</Badge>
                                                <span className="mx-2">•</span>
                                                <Clock className="mr-1 h-3 w-3" />
                                                <span>{formatDistance(new Date(log.activity_timestamp), new Date(), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert variant="default" className="bg-muted">
                                <InfoIcon className="h-4 w-4" />
                                <AlertTitle>No recent activities</AlertTitle>
                                <AlertDescription>
                                    There are no recent activities to display at this time.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between py-4 mt-8 border-t">
                <div className="text-sm text-muted-foreground">
                    Activity data is refreshed every 5 minutes
                </div>
            </div>
        </div>
    );
}

export default DashboardAdmin;