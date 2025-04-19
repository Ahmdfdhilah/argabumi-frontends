import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
    Search,
    Plus,
    BarChart2,
    CheckCircle,
    XCircle,
    Edit
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';
import { useToast } from "@workspace/ui/components/sonner";
import { periodService, Period } from '@/services/periodService';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@workspace/ui/components/alert-dialog";
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import Pagination from '@/components/Pagination';
import Loader from '@workspace/ui/components/ui/loading';

const PeriodMasterPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Layout state
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Period management state
    const [periods, setPeriods] = useState<Period[]>([]);
    const [filteredPeriods, setFilteredPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState<string>('All');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Confirmation dialog state - Updated the type to match required types
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'Active' | 'Closed' | 'Draft';
        periodId: number;
        periodName: string;
    } | null>(null);

    // Load periods from API
    useEffect(() => {
        fetchPeriods();
    }, [currentPage, itemsPerPage]);

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            const skip = (currentPage - 1) * itemsPerPage;
            const data = await periodService.getPeriods(skip, itemsPerPage,
                statusFilter !== 'All' ? statusFilter : undefined);
            console.log(data);
            
            setPeriods(data);
            setFilteredPeriods(data);
            setTotalItems(data.length > itemsPerPage ? data.length : itemsPerPage * 2); // This is a placeholder until we have proper pagination from API
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching periods:", error);
            toast({
                title: "Error",
                description: "Failed to fetch periods. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Apply filters whenever search term, status filter, or year filter changes
    useEffect(() => {
        let result = periods;

        if (searchTerm) {
            result = result.filter(period =>
                period.period_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                period.period_year.toString().includes(searchTerm) ||
                period.period_status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'All') {
            result = result.filter(period => period.period_status === statusFilter);
        }

        if (yearFilter !== 'All') {
            result = result.filter(period => period.period_year === parseInt(yearFilter));
        }

        setFilteredPeriods(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, statusFilter, yearFilter, periods]);

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        try {
            switch (confirmAction.type) {
                case 'Active':
                    await periodService.activatePeriod(confirmAction.periodId);
                    toast({
                        title: "Success",
                        description: `Period "${confirmAction.periodName}" has been activated.`,
                    });
                    break;
                case 'Closed':
                    await periodService.closePeriod(confirmAction.periodId);
                    toast({
                        title: "Success",
                        description: `Period "${confirmAction.periodName}" has been closed.`,
                    });
                    break;
            }

            // Refresh periods after action
            fetchPeriods();
        } catch (error) {
            console.error(`Error performing ${confirmAction.type} action:`, error);
            toast({
                title: "Error",
                description: `Failed to ${confirmAction.type} period. Please try again.`,
                variant: "destructive",
            });
        } finally {
            setShowConfirmDialog(false);
            setConfirmAction(null);
        }
    };

    const handleCreatePeriod = () => {
        navigate('/performance-management/periods/add');
    };

    const handleEditPeriod = (periodId: number) => {
        navigate(`/performance-management/periods/${periodId}/edit`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Collect unique years for the year filter

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
            case 'Closed':
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Closed</Badge>;
            case 'Draft':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Draft</Badge>;
            default:
                return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
        }
    };

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
                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        <div className="space-y-6">
                            <Filtering
                                handlePeriodChange={setYearFilter}
                                selectedPeriod={yearFilter}
                            >
                                {/* Search Input */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search Periods</span>
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by name, year or status..."
                                            className="pl-10 w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <BarChart2 className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Status</span>
                                    </label>
                                    <Select
                                        onValueChange={(value) => setStatusFilter(value)}
                                        value={statusFilter}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Statuses</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </Filtering>

                            {/* Period Management Card */}
                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <CardTitle className="text-gray-700 dark:text-gray-200 flex p-0">
                                            Period Master Management
                                        </CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={handleCreatePeriod}
                                                className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create New Period
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 pb-8">
                                    {loading ? (
                                        <div className="flex justify-center items-center p-12">
                                            <Loader text="Loading Periods..." />
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-gray-200 dark:border-gray-700">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Period Name</TableHead>
                                                        <TableHead>Year</TableHead>
                                                        <TableHead>Start Date</TableHead>
                                                        <TableHead>End Date</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Created At</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredPeriods.length > 0 ? (
                                                        filteredPeriods.map((period) => (
                                                            <TableRow key={period.period_id}>
                                                                <TableCell>{period.period_name}</TableCell>
                                                                <TableCell>{period.period_year}</TableCell>
                                                                <TableCell>{new Date(period.period_start_date).toLocaleDateString()}</TableCell>
                                                                <TableCell>{new Date(period.period_end_date).toLocaleDateString()}</TableCell>
                                                                <TableCell>{getStatusBadge(period.period_status)}</TableCell>
                                                                <TableCell>{new Date(period.created_at).toLocaleDateString()}</TableCell>
                                                                <TableCell>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                                <span className="sr-only">Open menu</span>
                                                                                <Edit className="h-4 w-4 text-[#1B6131] dark:text-[#46B749]" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            {period.period_status === 'Draft' && (
                                                                                <>
                                                                                    <DropdownMenuItem onClick={() => handleEditPeriod(period.period_id)}>
                                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                                        Edit
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem onClick={() => {
                                                                                        setConfirmAction({
                                                                                            type: 'Active',
                                                                                            periodId: period.period_id,
                                                                                            periodName: period.period_name
                                                                                        });
                                                                                        setShowConfirmDialog(true);
                                                                                    }}>
                                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                                        Active
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuSeparator />

                                                                                </>
                                                                            )}
                                                                            {period.period_status === 'Active' && (
                                                                                <DropdownMenuItem onClick={() => {
                                                                                    setConfirmAction({
                                                                                        type: 'Closed',
                                                                                        periodId: period.period_id,
                                                                                        periodName: period.period_name
                                                                                    });
                                                                                    setShowConfirmDialog(true);
                                                                                }}>
                                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                                    Closed
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={7} className="h-24 text-center">
                                                                No periods found matching your criteria
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {filteredPeriods.length > 0 && (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={Math.ceil(filteredPeriods.length / itemsPerPage)}
                                            itemsPerPage={itemsPerPage}
                                            totalItems={totalItems}
                                            onPageChange={handlePageChange}
                                            onItemsPerPageChange={handleItemsPerPageChange}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Confirmation Dialog for actions */}
                        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {confirmAction?.type === 'Active' && 'Active Period'}
                                        {confirmAction?.type === 'Closed' && 'Closed Period'}
                                      
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {confirmAction?.type === 'Active' &&
                                            `Are you sure you want to Active "${confirmAction.periodName}"? This will set it as the active period and may deactivate any currently active period.`}
                                        {confirmAction?.type === 'Closed' &&
                                            `Are you sure you want to close "${confirmAction.periodName}"? This action cannot be undone.`}
                                        
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleConfirmAction}
                                        className={`
                                            ${confirmAction?.type === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            ${confirmAction?.type === 'Closed' ? 'bg-gray-500 hover:bg-gray-600' : ''}
                                           
                                            text-white
                                        `}
                                    >
                                        {confirmAction?.type === 'Active' && 'Active'}
                                        {confirmAction?.type === 'Closed' && 'Closed'}
                                      
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default PeriodMasterPage;