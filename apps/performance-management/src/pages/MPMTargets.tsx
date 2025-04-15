import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

import {
  Perspective,
  MPMEntry,
  Manager
} from '../lib/types';
import {
  mpmTargetsDataMock
}
  from '../lib/mpmTargetsMock';

import { Label } from '@workspace/ui/components/label';
import Sidebar from '@/components/Sidebar';
import { Edit, Eye, Send, Users } from 'lucide-react';
import Header from '@/components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import EditMonthlyTargetDialog from '@/components/MPM/EditMonthlyTargetDialog';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import React from 'react';
import Footer from '@/components/Footer';

const MPMTargets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentRole, setCurrentRole] = useState('admin');

  const [isEditMonthlyTargetOpen, setIsEditMonthlyTargetOpen] = useState(false);
  const [sendToApproverOpen, setSendToApproverOpen] = useState(false);

  const [selectedKPI, setSelectedKPI] = useState<MPMEntry | null>(null);
  const [selectedApprover, setSelectedApprover] = useState<string>('');

  // Filtering states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('Monthly');
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sample data untuk approvers
  const approvers: Manager[] = [
    { id: 'app1', name: 'Budi Santoso', position: 'Manager', department: 'Performance Management' },
    { id: 'app2', name: 'Rina Wijaya', position: 'Senior Manager', department: 'Operations' },
    { id: 'app3', name: 'Agus Purnomo', position: 'Director', department: 'Business Development' },
    { id: 'app4', name: 'Dewi Kartika', position: 'VP', department: 'Human Resources' },
  ];

  // Sample data structure matching the image
  const [mpmData, setMpmData] = useState(mpmTargetsDataMock.targets);
  const { mpmTargetId } = useParams<{ mpmTargetId: string }>();

  const handleEditMonthlyTarget = (item: MPMEntry) => {
    setSelectedKPI(item);
    setIsEditMonthlyTargetOpen(true);
  };

  const handleSaveMonthlyTarget = (updatedKPI: MPMEntry) => {
    setMpmData(prev =>
      prev?.map(kpi =>
        kpi.kpiNumber === updatedKPI.kpiNumber &&
          kpi.perspective === updatedKPI.perspective
          ? updatedKPI
          : kpi
      )
    );
    setIsEditMonthlyTargetOpen(false);
  };

  // Filtering functions
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  const handlePerspectiveChange = (value: string) => {
    setSelectedPerspective(value);
  };

  // Apply filters to data
  const filteredData = useMemo(() => {
    return mpmData?.filter(item => {
      // Filter by perspective if selected
      if (selectedPerspective && selectedPerspective !== 'all' && item.perspective !== selectedPerspective) {
        return false;
      }

      // Filter by date range if provided
      // Note: This is a simplified example - actual implementation would depend on your data structure
      if (startDate || endDate) {
        // Implement date filtering based on your data structure
        // For example, if your data has a date field:
        // const itemDate = new Date(item.date);
        // if (startDate && itemDate < new Date(startDate)) return false;
        // if (endDate && itemDate > new Date(endDate)) return false;
      }

      // Filter by period if selected
      if (selectedPeriod && selectedPeriod !== 'All') {
        // Implement period filtering based on your data structure
      }

      return true;
    });
  }, [mpmData, selectedPerspective, startDate, endDate, selectedPeriod]);

  // Group data by perspective
  const groupedData = useMemo(() => {
    return filteredData?.reduce((acc, curr) => {
      if (!acc[curr.perspective]) {
        acc[curr.perspective] = [];
      }
      acc[curr.perspective].push(curr);
      return acc;
    }, {} as Record<Perspective, MPMEntry[]>);
  }, [filteredData]);

  // Pagination calculation
  const totalItems = filteredData?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // For grouped data, paginate the whole set rather than individual perspectives
    let currentIdx = 0;
    const result: Record<Perspective, MPMEntry[]> = {} as Record<Perspective, MPMEntry[]>;

    if (groupedData) {
      for (const [perspective, items] of Object.entries(groupedData)) {
        const typedPerspective = perspective as Perspective;

        // Check if any items in this perspective should be included in current page
        if (currentIdx < endIndex && currentIdx + items.length > startIndex) {
          const perspectiveStartIdx = Math.max(0, startIndex - currentIdx);
          const perspectiveEndIdx = Math.min(items.length, endIndex - currentIdx);
          result[typedPerspective] = items.slice(perspectiveStartIdx, perspectiveEndIdx);
        }

        currentIdx += items.length;
      }
    }

    return result;
  }, [groupedData, currentPage, itemsPerPage]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Dialog for sending to manager
  const SendToApproverDialog = () => (
    <Dialog open={sendToApproverOpen} onOpenChange={setSendToApproverOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send to Manager</DialogTitle>
          <DialogDescription>
            Select an manager and send this MPM target for approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="manager-select">Select Manager</Label>
            <Select
              value={selectedApprover}
              onValueChange={setSelectedApprover}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an manager" />
              </SelectTrigger>
              <SelectContent>
                {approvers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name} - {manager.position}, {manager.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedApprover && (
            <div className="p-4 bg-[#E4EFCF]/50 rounded-md">
              <p className="font-medium text-[#1B6131]">Selected Manager:</p>
              <p>{approvers.find(a => a.id === selectedApprover)?.name}</p>
              <p className="text-sm text-gray-600">
                {approvers.find(a => a.id === selectedApprover)?.position},
                {approvers.find(a => a.id === selectedApprover)?.department}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSendToApproverOpen(false);
              setSelectedApprover('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Handle send to manager logic here
              if (selectedApprover) {
                // Process the submission with the selected manager
                console.log(`Sending to manager: ${selectedApprover}`);
                setSendToApproverOpen(false);
                setSelectedApprover('');
              }
            }}
            disabled={!selectedApprover}
            className="bg-[#1B6131] hover:bg-[#46B749]"
          >
            <Send className="mr-2 h-4 w-4" />
            Send for Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const navigate = useNavigate();

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

      <div className="flex flex-col md:flex-row">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          role={currentRole}
          system="performance-management"
        />

        <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
          <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
            <div className="space-y-6 w-full">
              {/* Header Section */}
              <Breadcrumb
                items={[{
                  label: 'MPM Target List',
                  path: '/performance-management/mpm/target'
                }]}
                currentPage="MPM Targets"
                showHomeIcon={true}
                subtitle={`MPM Targets ID : ${mpmTargetId}`}
              />

              {/* Filter Section */}
              <Filtering
                startDate={startDate}
                endDate={endDate}
                handleStartDateChange={handleStartDateChange}
                handleEndDateChange={handleEndDateChange}
                handlePeriodChange={handlePeriodChange}
                selectedPeriod={selectedPeriod}
                handleTypeChange={handleTypeChange}
                selectedType={selectedType}
              >
                {/* Custom filter for perspective */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Users className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
                    <span>Perspective</span>
                  </label>
                  <Select
                    onValueChange={handlePerspectiveChange}
                    value={selectedPerspective}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                      <SelectValue placeholder="Select Perspective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Perspectives</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Internal Process">Internal Process</SelectItem>
                      <SelectItem value="Learning and Growth">Learning and Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Filtering>

              {/* Main Card */}
              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      KPI Targets Table
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF] flex items-center justify-center dark:text-white"
                        onClick={() => setSendToApproverOpen(true)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send to Manager
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='m-0 p-0 pb-8'>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-[#1B6131] text-white">
                        <tr>
                          {[
                            'Action', 'KPI', 'KPI Definition', 'Weight', 'UOM',
                            'Category', 'YTD Calculation', 'Jan-25', 'Feb-25', 'Mar-25'
                          ].map((header) => (
                            <th
                              key={header}
                              className="p-4 text-center whitespace-nowrap"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData && Object.entries(paginatedData).map(([perspective, items]) => (
                          <React.Fragment key={perspective}>
                            <tr className="bg-[#E4EFCF] dark:bg-[#1B6131]/30">
                              <td colSpan={10} className="p-4 font-medium text-[#1B6131] dark:text-[#46B749]">
                                {perspective}
                              </td>
                            </tr>
                            {items.map((item) => (
                              <tr key={`${item.perspective}-${item.kpiNumber}`} className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20">
                                <td className="p-4 text-center flex gap-2 justify-center">
                                  {/* Tombol Create */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-[#1B6131]"
                                    onClick={() => navigate(`/performance-management/mpm/target/${mpmTargetsDataMock.id}/entri/${item.id}/teams`)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {/* Tombol Edit */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-[#1B6131]"
                                    onClick={() => handleEditMonthlyTarget(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                                <td className="p-4">{item.kpi}</td>
                                <td className="p-4">{item.kpiDefinition}</td>
                                <td className="p-4 text-center">{item.weight}%</td>
                                <td className="p-4 text-center">{item.uom}</td>
                                <td className="p-4 text-center">{item.category}</td>
                                <td className="p-4 text-center">{item.ytdCalculation}</td>
                                <td className="p-4 text-center">{item.targets['Jan-25']}</td>
                                <td className="p-4 text-center">{item.targets['Feb-25']}</td>
                                <td className="p-4 text-center">{item.targets['Mar-25']}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Component */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                   
                  />
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </div>

      <EditMonthlyTargetDialog
        isOpen={isEditMonthlyTargetOpen}
        onClose={() => setIsEditMonthlyTargetOpen(false)}
        kpi={selectedKPI}
        onSave={handleSaveMonthlyTarget}
      />

      <SendToApproverDialog />
    </div>
  );
}

export default MPMTargets;