import { useRef, useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Plus, Save, Trash2, FileSpreadsheet, Edit, Search, Layers, EyeIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import KPIFormDialog from '@/components/BSC/KPIFormDialog';
import { BSCEntry } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';

const BSCEntryPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');
    const [allEntries, setAllEntries] = useState<BSCEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<BSCEntry[]>([]);
    const [displayedEntries, setDisplayedEntries] = useState<BSCEntry[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPerspective, setSelectedPerspective] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // State for dialog management
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentEditingEntry, setCurrentEditingEntry] = useState<Partial<BSCEntry> | undefined>(undefined);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate total pages whenever filtered entries change
    useEffect(() => {
        setTotalPages(Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage)));

        // Reset to page 1 when filters change
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            // Apply pagination
            updateDisplayedEntries();
        }
    }, [filteredEntries, itemsPerPage]);

    // Update displayed entries based on pagination
    useEffect(() => {
        updateDisplayedEntries();
    }, [currentPage, filteredEntries]);

    // Apply filters whenever search term or filter selections change
    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedPerspective, selectedCategory, allEntries]);

    const updateDisplayedEntries = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedEntries(filteredEntries.slice(startIndex, endIndex));
    };

    const applyFilters = () => {
        let filtered = [...allEntries];

        // Apply search filter across multiple fields
        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(entry =>
                (entry.kpi?.toLowerCase().includes(lowercasedSearch)) ||
                (entry.code?.toLowerCase().includes(lowercasedSearch)) ||
                (entry.relatedPIC?.toLowerCase().includes(lowercasedSearch))
            );
        }

        // Apply perspective filter
        if (selectedPerspective) {
            filtered = filtered.filter(entry => entry.perspective === selectedPerspective);
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(entry => entry.category === selectedCategory);
        }

        setFilteredEntries(filtered);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    // Transform the Excel data to match KPIEntry format
                    const newEntries: BSCEntry[] = jsonData.map((row: any, index: number) => ({
                        id: Date.now() + index, // Generate unique IDs
                        perspective: row.Perspective,
                        code: row.code,
                        kpiNumber: 0,
                        kpi: row.KPI,
                        kpiDefinition: row['KPI Definition'],
                        weight: Number(row.Weight),
                        uom: row.UOM,
                        category: row.Category,
                        ytdCalculation: row['YTD Calculation'],
                        relatedPIC: row['Related PIC'],
                        target: Number(row.Target)
                    }));

                    setAllEntries(prev => [...prev, ...newEntries]);
                    // Reset file input
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                } catch (error) {
                    console.error('Error parsing Excel file:', error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleOpenCreateDialog = () => {
        setCurrentEditingEntry(undefined);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (entry: BSCEntry) => {
        setCurrentEditingEntry({ ...entry });
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    const handleSaveKPI = (kpi: BSCEntry) => {
        if (dialogMode === 'create') {
            // Add new entry
            const newEntry = { ...kpi, id: Date.now() };
            setAllEntries(prev => [...prev, newEntry]);
        } else {
            // Edit existing entry
            setAllEntries(prev =>
                prev.map(entry =>
                    entry.id === currentEditingEntry?.id ? { ...kpi, id: entry.id } : entry
                )
            );
        }
        setIsDialogOpen(false);
    };

    const handleDeleteEntry = (id: number) => {
        setAllEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const handleSaveAll = () => {
        console.log('Saving entries:', allEntries);
        // Implement your save logic here
    };

    // Get unique perspectives and categories for filters
    const perspectives = Array.from(new Set(allEntries.map(entry => entry.perspective))).filter(Boolean);
    const categories = Array.from(new Set(allEntries.map(entry => entry.category))).filter(Boolean);

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
                        <div className="space-y-6 max-w-full">
                            <Breadcrumb
                                items={[]}
                                currentPage="BSC Input Data"
                                showHomeIcon={true}
                            />

                            {/* Filter Section */}
                            <Filtering>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Search className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Search</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Search KPI, Code, or PIC..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <EyeIcon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Perspective</span>
                                    </label>
                                    <Select
                                        onValueChange={setSelectedPerspective}
                                        value={selectedPerspective}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                            <SelectValue placeholder="Select Perspective" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Perspectives</SelectItem>
                                            {perspectives.map((perspective) => (
                                                <SelectItem key={perspective} value={perspective}>{perspective}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Layers className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                                        <span>Category</span>
                                    </label>
                                    <Select
                                        onValueChange={setSelectedCategory}
                                        value={selectedCategory}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </Filtering>

                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md pb-8">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <CardTitle className="text-gray-700 dark:text-gray-200  flex p-0">
                                            KPI Entries
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                accept=".xlsx,.xls"
                                                className="hidden"
                                            />
                                            <Button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f] w-full sm:w-auto"
                                                size="sm"
                                            >
                                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                Import Excel
                                            </Button>
                                            <Button
                                                onClick={handleSaveAll}
                                                className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f] w-full sm:w-auto"
                                                size="sm"
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                Save All
                                            </Button>
                                            <Button
                                                onClick={handleOpenCreateDialog}
                                                className="bg-[#1B6131] hover:bg-[#144d27] dark:bg-[#46B749] dark:hover:bg-[#3da33f] w-full sm:w-auto"
                                                size="sm"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add KPI
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="dark:bg-gray-900 m-0 p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-[#1B6131] text-white">
                                                <tr>
                                                    <th className="p-4 text-left">Perspective</th>
                                                    <th className="p-4 text-left">Code</th>
                                                    <th className="p-4 text-left">KPI</th>
                                                    <th className="p-4 text-left">Weight</th>
                                                    <th className="p-4 text-left">UOM</th>
                                                    <th className="p-4 text-left">Category</th>
                                                    <th className="p-4 text-left">Target</th>
                                                    <th className="p-4 text-left">Related PIC</th>
                                                    <th className="p-4 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayedEntries.map((entry) => (
                                                    <tr key={entry.id} className="border-b hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20">
                                                        <td className="p-4">{entry.perspective}</td>
                                                        <td className="p-4">{entry.code}</td>
                                                        <td className="p-4">{entry.kpi}</td>
                                                        <td className="p-4">{entry.weight}%</td>
                                                        <td className="p-4">{entry.uom}</td>
                                                        <td className="p-4">{entry.category}</td>
                                                        <td className="p-4">{entry.target}</td>
                                                        <td className="p-4">{entry.relatedPIC}</td>
                                                        <td className="p-4 flex space-x-2">
                                                            <Button
                                                                onClick={() => handleOpenEditDialog(entry)}
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDeleteEntry(entry.id!)}
                                                                variant="destructive"
                                                                size="sm"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {displayedEntries.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                {allEntries.length === 0
                                                    ? "No KPI entries added yet. Click \"Add KPI\" to create an entry."
                                                    : "No entries match your search criteria. Try adjusting your filters."}
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination Controls */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredEntries.length}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                       
                                    />
                                </CardContent>
                            </Card>

                            {/* KPI Form Dialog */}
                            <KPIFormDialog
                                isOpen={isDialogOpen}
                                onClose={() => {
                                    setIsDialogOpen(false);
                                    setCurrentEditingEntry(undefined);
                                }}
                                onSave={handleSaveKPI}
                                initialData={currentEditingEntry || {}}
                                mode={dialogMode}
                            />
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default BSCEntryPage;