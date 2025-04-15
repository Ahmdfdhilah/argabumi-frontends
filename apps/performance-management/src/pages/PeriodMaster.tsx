import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { CheckCircle, XCircle, Search, Plus, BarChart2Icon } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import Footer from '@/components/Footer';

type PeriodStatus = 'All' | 'Draft' | 'Active' | 'Closed';

interface Period {
    id: string;
    year: number;
    startDate: string;
    endDate: string;
    status: PeriodStatus;
    createdBy: string;
    createdAt: string;
}

// Enhanced dummy data
const initialPeriods: Period[] = [
    {
        id: '1',
        year: 2023,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        status: 'Closed',
        createdBy: 'Admin',
        createdAt: '2023-01-01T00:00:00Z'
    },
    {
        id: '2',
        year: 2024,
        startDate: '2024-01-01',
        endDate: '2023-12-30',
        status: 'Closed',
        createdBy: 'Admin',
        createdAt: '2023-04-01T00:00:00Z'
    },
    {
        id: '3',
        year: 2025,
        startDate: '2025-01-01',
        endDate: '2025-12-30',
        status: 'Active',
        createdBy: 'Admin',
        createdAt: '2023-07-01T00:00:00Z'
    }
];

const PeriodMaster = () => {
    // Layout state
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');

    // Period management state
    const [periods, setPeriods] = useState<Period[]>(initialPeriods);
    const [filteredPeriods, setFilteredPeriods] = useState<Period[]>(initialPeriods);
    const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false);
    const [newPeriod, setNewPeriod] = useState({
        year: new Date().getFullYear(),
        period: '',
        startDate: '',
        endDate: '',
    });

    // Filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState<string>('All');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Check if there's any active period
    const hasActivePeriod = periods.some(p => p.status === 'Active');

    // Apply filters whenever search term, status filter, or year filter changes
    useEffect(() => {
        let result = periods;

        if (searchTerm) {
            result = result.filter(period =>
                period.year.toString().includes(searchTerm) ||
                period.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'All') {
            result = result.filter(period => period.status === statusFilter);
        }

        if (yearFilter !== 'All') {
            result = result.filter(period => period.year === parseInt(yearFilter));
        }

        setFilteredPeriods(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, statusFilter, yearFilter, periods]);


    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPeriods.slice(indexOfFirstItem, indexOfLastItem);

    const getStatusColor = (status: PeriodStatus) => {
        switch (status) {
            case 'Active':
                return 'bg-green-500 text-white';
            case 'Closed':
                return 'bg-gray-500 text-white';
            case 'Draft':
                return 'bg-yellow-500 text-white';
        }
    };

    const handleCreatePeriod = () => {
        const periodExists = periods.some(p =>
            p.year === newPeriod.year
        );

        if (periodExists) {
            alert('A period with these parameters already exists');
            return;
        }

        const newPeriodEntry: Period = {
            id: `${Date.now()}`,
            year: newPeriod.year,
            startDate: newPeriod.startDate,
            endDate: newPeriod.endDate,
            status: 'Draft',
            createdBy: 'Admin User',
            createdAt: new Date().toISOString(),
        };

        setPeriods(prev => [...prev, newPeriodEntry]);
        setShowNewPeriodDialog(false);
        setNewPeriod({
            year: new Date().getFullYear(),
            period: '',
            startDate: '',
            endDate: '',
        });
    };

    const handleStatusChange = (periodId: string, newStatus: PeriodStatus) => {
        if (newStatus === 'Active' && hasActivePeriod) {
            alert('Another period is already active. Please close it first.');
            return;
        }

        setPeriods(prev => prev.map(period => {
            if (period.id === periodId) {
                return { ...period, status: newStatus };
            }
            return period;
        }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
    };

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
                                currentPage="Period Master Management"
                                showHomeIcon={true}
                            />
                            <Filtering
                                handlePeriodChange={setYearFilter}
                                selectedPeriod={yearFilter}
                            >
                                {/* Search Input */}
                                <div className="space-y-3  md:col-span-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search Periods</span>
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search periods..."
                                            className="pl-10 w-full bg-white dark:bg-gray-800 border border-[#46B749] dark:border-[#1B6131]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Status</span>
                                    </label>
                                    <Select
                                        onValueChange={(value: PeriodStatus | 'All') => setStatusFilter(value)}
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
                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md pb-8">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <CardTitle className="text-gray-700 dark:text-gray-200  flex p-0">
                                            Period Table
                                        </CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={() => setShowNewPeriodDialog(true)}
                                                className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create New Period
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="dark:bg-gray-900 m-0 p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-[#1B6131] text-white">
                                                <tr>
                                                    <th className="p-4 text-left border-b">Period</th>
                                                    <th className="p-4 text-left border-b">Start Date</th>
                                                    <th className="p-4 text-left border-b">End Date</th>
                                                    <th className="p-4 text-left border-b">Status</th>
                                                    <th className="p-4 text-left border-b">Created By</th>
                                                    <th className="p-4 text-left border-b">Created At</th>
                                                    <th className="p-4 text-left border-b">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.length > 0 ? (
                                                    currentItems.map((period) => (
                                                        <tr
                                                            key={period.id}
                                                            className="border-b hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"
                                                        >
                                                            <td className="p-4">{period.year}</td>
                                                            <td className="p-4">{new Date(period.startDate).toLocaleDateString()}</td>
                                                            <td className="p-4">{new Date(period.endDate).toLocaleDateString()}</td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(period.status)}`}>
                                                                    {period.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">{period.createdBy}</td>
                                                            <td className="p-4">
                                                                {new Date(period.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-4 space-x-2">
                                                                {period.status === 'Draft' && (
                                                                    <Button
                                                                        onClick={() => handleStatusChange(period.id, 'Active')}
                                                                        className="mr-2 bg-green-500 hover:bg-green-600 text-white"
                                                                        size="sm"
                                                                        title="Activate Period"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                {period.status === 'Active' && (
                                                                    <Button
                                                                        onClick={() => handleStatusChange(period.id, 'Closed')}
                                                                        className="bg-gray-500 hover:bg-gray-600 text-white"
                                                                        size="sm"
                                                                        title="Close Period"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={8} className="p-4 text-center text-gray-500">
                                                            No periods found matching your criteria
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={Math.ceil(filteredPeriods.length / itemsPerPage)}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredPeriods.length}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Create New Period Dialog */}
                        <AlertDialog open={showNewPeriodDialog} onOpenChange={setShowNewPeriodDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Create New Period</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Set up a new BSC period. Only one period can be active at a time.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label className="text-right">Year</label>
                                        <Input
                                            type="number"
                                            value={newPeriod.year}
                                            onChange={(e) => setNewPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                            className="col-span-3"
                                            min={new Date().getFullYear() - 1}
                                            max={new Date().getFullYear() + 5}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label className="text-right">Start Date</label>
                                        <Input
                                            type="date"
                                            value={newPeriod.startDate}
                                            onChange={(e) => setNewPeriod(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label className="text-right">End Date</label>
                                        <Input
                                            type="date"
                                            value={newPeriod.endDate}
                                            onChange={(e) => setNewPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleCreatePeriod}
                                        className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                        disabled={!newPeriod.period || !newPeriod.startDate || !newPeriod.endDate}
                                    >
                                        Create Period
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

export default PeriodMaster;