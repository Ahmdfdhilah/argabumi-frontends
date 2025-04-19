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
import { Plus, Save, Trash2, Edit, Search, Layers, EyeIcon } from 'lucide-react';
import KPIFormDialog from '@/components/BSC/KPIFormDialog';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import Filtering from '@/components/Filtering';
import Footer from '@/components/Footer';
import { useToast } from "@workspace/ui/components/sonner";

// Import services
import kpiDefinitionService, { KPIDefinitionResponse } from '@/services/kpiDefinitionService';
import { kpiPerspectiveService, KPIPerspective } from '@/services/kpiPerspectiveService';
import { periodService, Period } from '@/services/periodService';
import organizationUnitService, { OrganizationUnitResponse } from '@/services/organizationUnitService';
import { useAppSelector } from '@/redux/hooks';

const BSCEntryPage = () => {
    const { toast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
   
    const [allEntries, setAllEntries] = useState<KPIDefinitionResponse[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<KPIDefinitionResponse[]>([]);
    const [displayedEntries, setDisplayedEntries] = useState<KPIDefinitionResponse[]>([]);
    const { user } = useAppSelector((state) => state.auth);

    // States for dropdown options
    const [perspectives, setPerspectives] = useState<KPIPerspective[]>([]);
    const [_, setPeriods] = useState<Period[]>([]); //nanti filter by period
    const [organizationUnits, setOrganizationUnits] = useState<OrganizationUnitResponse[]>([]);
    const [activePeriod, setActivePeriod] = useState<Period | null>(null);

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
    const [currentEditingEntry, setCurrentEditingEntry] = useState<Partial<KPIDefinitionResponse> | undefined>(undefined);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch initial data on component mount
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // Get active period
            const activeP = await periodService.getActivePeriod();
            setActivePeriod(activeP);
            
            // Load data based on active period
            if (activeP) {
                loadBSCEntries(activeP.period_id);
                loadPerspectives();
                loadOrganizationUnits();
                loadPeriods();
            }
        } catch (error) {
            console.error("Error loading initial data:", error);
            toast({
                title: "Error",
                description: "Failed to load initial data",
                variant: "destructive",
            });
        }
    };

    const loadBSCEntries = async (periodId: number) => {
        try {
            // Get BSC type KPIs only
            const bscEntries = await kpiDefinitionService.getKPIsByType('BSC', periodId);
            // Filter out entries that have parent (we only want top level BSC entries)
            const topLevelBSC = bscEntries.filter(entry => !entry.kpi_parent_id);
            setAllEntries(topLevelBSC);
            setFilteredEntries(topLevelBSC);
        } catch (error) {
            console.error("Error loading BSC entries:", error);
            toast({
                title: "Error",
                description: "Failed to load BSC entries",
                variant: "destructive",
            });
        }
    };

    const loadPerspectives = async () => {
        try {
            const perspList = await kpiPerspectiveService.getPerspectives();
            setPerspectives(perspList);
        } catch (error) {
            console.error("Error loading perspectives:", error);
        }
    };

    const loadPeriods = async () => {
        try {
            const periodList = await periodService.getPeriods();
            setPeriods(periodList);
        } catch (error) {
            console.error("Error loading periods:", error);
        }
    };

    const loadOrganizationUnits = async () => {
        try {
            const orgUnits = await organizationUnitService.getOrganizationUnits();
            const topLevelOrgUnits = orgUnits.filter(ou => !ou.org_unit_parent_id);
            setOrganizationUnits(topLevelOrgUnits);
        } catch (error) {
            console.error("Error loading organization units:", error);
        }
    };

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
        console.log(user);
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
                (entry.kpi_name?.toLowerCase().includes(lowercasedSearch)) ||
                (entry.kpi_code?.toLowerCase().includes(lowercasedSearch))
            );
        }

        // Apply perspective filter
        if (selectedPerspective && selectedPerspective !== 'all') {
            filtered = filtered.filter(entry => entry.kpi_perspective_id.toString() === selectedPerspective);
        }

        // Apply category filter
        if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter(entry => entry.kpi_category === selectedCategory);
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

    const handleOpenCreateDialog = () => {
        setCurrentEditingEntry({
            kpi_code: '',
            kpi_name: '',
            kpi_definition: '',
            kpi_weight: 0,
            kpi_uom: '',
            kpi_category: '',
            kpi_calculation: '',
            kpi_target: 0,
            kpi_org_unit_id: undefined,
            kpi_perspective_id: 0,
            kpi_owner_id: user?.user_employee_id || 0 
        });
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (entry: KPIDefinitionResponse) => {
        setCurrentEditingEntry({ ...entry });
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    const handleSaveKPI = async (kpi: KPIDefinitionResponse) => {
        try {
         
            
            if (dialogMode === 'create') {
                // Create new BSC entry
                const createData = {
                    kpi_code: kpi.kpi_code,
                    kpi_name: kpi.kpi_name,
                    kpi_org_unit_id: kpi.kpi_org_unit_id,
                    kpi_period_id: activePeriod?.period_id || 0,
                    kpi_perspective_id: kpi.kpi_perspective_id,
                    kpi_owner_id: kpi.kpi_owner_id || user?.user_employee_id || 0,
                    kpi_definition: kpi.kpi_definition,
                    kpi_weight: kpi.kpi_weight,
                    kpi_uom: kpi.kpi_uom,
                    kpi_category: kpi.kpi_category,
                    kpi_calculation: kpi.kpi_calculation || '',
                    kpi_target: kpi.kpi_target,
                    kpi_is_action_plan: false,
                    kpi_is_ipm: false,
                    kpi_visibility_level: 'org_unit',
                    kpi_status: 'Active',
                    kpi_employee_id: null,
                    kpi_parent_id: null,
                };
                
                await kpiDefinitionService.createKPIDefinition(createData);
                // Refresh the list
                if (activePeriod) {
                    loadBSCEntries(activePeriod.period_id);
                }
            } else {
                // Update existing entry
                if (!kpi.kpi_id) {
                    throw new Error("KPI ID is required for update");
                }
                
                const updateData = {
                    kpi_code: kpi.kpi_code,
                    kpi_name: kpi.kpi_name,
                    kpi_org_unit_id: kpi.kpi_org_unit_id,
                    kpi_perspective_id: kpi.kpi_perspective_id,
                    kpi_owner_id: kpi.kpi_owner_id,
                    kpi_definition: kpi.kpi_definition,
                    kpi_weight: kpi.kpi_weight,
                    kpi_uom: kpi.kpi_uom,
                    kpi_category: kpi.kpi_category,
                    kpi_calculation: kpi.kpi_calculation,
                    kpi_target: kpi.kpi_target,
                    kpi_employee_id: null,
                    kpi_parent_id: null,
                };
                
                await kpiDefinitionService.updateKPIDefinition(kpi.kpi_id, updateData);
                // Refresh the list
                if (activePeriod) {
                    loadBSCEntries(activePeriod.period_id);
                }
            }
            
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving KPI:", error);
            toast({
                title: "Error",
                description: "Failed to save KPI",
                variant: "destructive",
            });
        }
    };

    const handleDeleteEntry = async (id: number) => {
        try {
            await kpiDefinitionService.deleteKPIDefinition(id);
            // Refresh the list after deletion
            if (activePeriod) {
                loadBSCEntries(activePeriod.period_id);
            }
        } catch (error) {
            console.error("Error deleting KPI:", error);
            toast({
                title: "Error",
                description: "Failed to delete KPI",
                variant: "destructive",
            });
        }
    };

    const handleSaveAll = () => {
        toast({
            title: "Information",
            description: "All changes are automatically saved when editing individual KPIs",
        });
    };

    // Get unique categories for filters
    const categories = Array.from(new Set(allEntries.map(entry => entry.kpi_category))).filter(Boolean);

    // Helper function to find perspective name by ID
    const getPerspectiveName = (perspectiveId: number) => {
        const perspective = perspectives.find(p => p.perspective_id === perspectiveId);
        return perspective ? perspective.perspective_name : '';
    };

    // Helper function to find organization unit name by ID
    const getOrgUnitName = (orgUnitId: number | null | undefined) => {
        if (!orgUnitId) return '';
        const orgUnit = organizationUnits.find(ou => ou.org_unit_id === orgUnitId);
        return orgUnit ? orgUnit.org_unit_name : '';
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
                                        placeholder="Search KPI, Code..."
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
                                                <SelectItem key={perspective.perspective_id} value={perspective.perspective_id.toString()}>
                                                    {perspective.perspective_name}
                                                </SelectItem>
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
                                        <CardTitle className="text-gray-700 dark:text-gray-200 flex p-0">
                                            KPI Entries {activePeriod && `- ${activePeriod.period_name} (${activePeriod.period_year})`}
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                            />
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
                                                    <tr key={entry.kpi_id} className="border-b hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20">
                                                        <td className="p-4">{getPerspectiveName(entry.kpi_perspective_id)}</td>
                                                        <td className="p-4">{entry.kpi_code}</td>
                                                        <td className="p-4">{entry.kpi_name}</td>
                                                        <td className="p-4">{entry.kpi_weight?.toString()}%</td>
                                                        <td className="p-4">{entry.kpi_uom}</td>
                                                        <td className="p-4">{entry.kpi_category}</td>
                                                        <td className="p-4">{entry.kpi_target?.toString()}</td>
                                                        <td className="p-4">{getOrgUnitName(entry.kpi_org_unit_id)}</td>
                                                        <td className="p-4 flex space-x-2">
                                                            <Button
                                                                onClick={() => handleOpenEditDialog(entry)}
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDeleteEntry(entry.kpi_id)}
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

                            {/* KPI Form Dialog - needs updating to use types from services */}
                            <KPIFormDialog
                                isOpen={isDialogOpen}
                                onClose={() => {
                                    setIsDialogOpen(false);
                                    setCurrentEditingEntry(undefined);
                                }}
                                onSave={handleSaveKPI}
                                initialData={currentEditingEntry || {}}
                                mode={dialogMode}
                                perspectives={perspectives}
                                organizationUnits={organizationUnits}
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