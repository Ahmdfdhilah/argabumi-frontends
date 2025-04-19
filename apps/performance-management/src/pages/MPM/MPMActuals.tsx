import { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import Sidebar from '@/components/Sidebar';
import { Edit, Send, Eye, Users } from 'lucide-react';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import Filtering from '@/components/Filtering';
import React from 'react';
import Footer from '@/components/Footer';

// Types
type UOMType = 'Number' | '%' | 'Days' | 'Kriteria' | 'Number (Ton)';
type Category = 'Max' | 'Min' | 'On Target';
type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
type MonthType = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' |
  'July' | 'August' | 'September' | 'October' | 'November' | 'December';
type Perspective = 'Financial' | 'Customer' | 'Internal Process' | 'Learning and Growth';

type KPIEntry = {
  id: number;
  periodId: number;
  month: MonthType;
  perspective: Perspective;
  kpi: string;
  kpiDefinition: string;
  weight: number;
  uom: UOMType;
  category: Category;
  ytdCalculation: YTDCalculation;
  target: number;
  actual: number;
  achievement: number;
  score: number;
  problemIdentification: string;
  correctiveAction: string;
};

type Manager = {
  id: string;
  name: string;
  position: string;
  department: string;
};

const MPMActuals = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
 
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPIEntry | null>(null);
  const [sendToApproverOpen, setSendToApproverOpen] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('Monthly');
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month');
  const { mpmActualId } = useParams<{ mpmActualId: string }>();

  const approvers: Manager[] = [
    { id: 'app1', name: 'Budi Santoso', position: 'Manager', department: 'Performance Management' },
    { id: 'app2', name: 'Rina Wijaya', position: 'Senior Manager', department: 'Operations' },
    { id: 'app3', name: 'Agus Purnomo', position: 'Director', department: 'Business Development' },
    { id: 'app4', name: 'Dewi Kartika', position: 'VP', department: 'Human Resources' },
  ];

  const [kpiData, setKpiData] = useState<KPIEntry[]>([
    {
      id: 1,
      periodId: 1,
      month: 'January',
      perspective: 'Financial',
      kpi: 'Profit / Loss',
      kpiDefinition: 'Rasio keuntungan',
      weight: 15,
      uom: '%',
      category: 'Max',
      ytdCalculation: 'Last Value',
      target: 5,
      actual: 4.5,
      achievement: 90.0,
      score: 2,
      problemIdentification: '',
      correctiveAction: '',
    },
    {
      id: 2,
      periodId: 1,
      month: 'January',
      perspective: 'Customer',
      kpi: 'Total Penjualan',
      kpiDefinition: 'Total penjualan',
      weight: 40,
      uom: 'Number (Ton)',
      category: 'Max',
      ytdCalculation: 'Accumulative',
      target: 10,
      actual: 10,
      achievement: 100.0,
      score: 2,
      problemIdentification: '',
      correctiveAction: '',
    },
    {
      id: 3,
      periodId: 1,
      month: 'January',
      perspective: 'Internal Process',
      kpi: 'Efisiensi Proses',
      kpiDefinition: 'Persentase efisiensi proses produksi',
      weight: 25,
      uom: '%',
      category: 'Max',
      ytdCalculation: 'Average',
      target: 95,
      actual: 92,
      achievement: 96.8,
      score: 3,
      problemIdentification: 'Beberapa mesin perlu maintenance',
      correctiveAction: 'Jadwalkan maintenance rutin',
    },
    {
      id: 4,
      periodId: 1,
      month: 'January',
      perspective: 'Learning and Growth',
      kpi: 'Training Karyawan',
      kpiDefinition: 'Jam training per karyawan',
      weight: 20,
      uom: 'Days',
      category: 'Max',
      ytdCalculation: 'Accumulative',
      target: 3,
      actual: 2.5,
      achievement: 83.3,
      score: 2,
      problemIdentification: 'Keterbatasan waktu karyawan',
      correctiveAction: 'Implementasi program e-learning',
    },
  ]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    return kpiData.filter(item => {
      // Filter by perspective if selected
      if (selectedPerspective && item.perspective !== selectedPerspective) {
        return false;
      }

      // Filter by date range if provided
      if (startDate) {
        const itemDate = new Date(`${item.month} 1, 2024`);
        const filterStart = new Date(startDate);
        if (itemDate < filterStart) {
          return false;
        }
      }

      if (endDate) {
        const itemDate = new Date(`${item.month} 1, 2024`);
        const filterEnd = new Date(endDate);
        if (itemDate > filterEnd) {
          return false;
        }
      }

      // Filter by period if selected
      if (selectedPeriod && selectedPeriod !== 'All') {
        // Assuming period is year, would need adjustment for actual implementation
        return true; // Placeholder for period filtering
      }

      return true;
    });
  }, [kpiData, selectedPerspective, startDate, endDate, selectedPeriod]);

  // Group data by perspective
  const groupedData = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      if (!acc[curr.perspective]) {
        acc[curr.perspective] = [];
      }
      acc[curr.perspective].push(curr);
      return acc;
    }, {} as Record<Perspective, KPIEntry[]>);
  }, [filteredData]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const result: Record<Perspective, KPIEntry[]> = {} as Record<Perspective, KPIEntry[]>;

    // This is a simplified approach - in a real implementation you might need 
    // to handle pagination differently for grouped data
    let count = 0;
    let itemsAdded = 0;

    for (const [perspective, items] of Object.entries(groupedData)) {
      if (count >= startIndex && count < endIndex) {
        result[perspective as Perspective] = items;
        itemsAdded += items.length;
      }
      count += items.length;

      if (count >= endIndex) break;
    }

    return result;
  }, [groupedData, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleRowClick = (item: KPIEntry) => {
    navigate(`/performance-management/mpm/actual/${item.periodId}/entri/${item.id}/teams?month=${item.month}`);
  };

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

  // Edit Dialog Component
  const EditKPIDialog = () => {
    if (!selectedKPI) return null;

    const handleSave = () => {
      if (selectedKPI) {
        setKpiData((prevData) =>
          prevData.map((kpi) =>
            kpi.id === selectedKPI.id ? selectedKPI : kpi
          )
        );
        setIsEditDialogOpen(false);
      }
    };

    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl overflow-y-scroll max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Edit KPI Actual Data</DialogTitle>
            <DialogDescription>
              Update actual values and corrective actions
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>KPI</Label>
              <Input value={selectedKPI.kpi} disabled />
            </div>

            <div className="space-y-2">
              <Label>Target</Label>
              <Input value={selectedKPI.target} disabled />
            </div>

            <div className="space-y-2">
              <Label>Actual</Label>
              <Input
                type="number"
                value={selectedKPI.actual}
                onChange={(e) => {
                  const actual = parseFloat(e.target.value);
                  const achievement = (actual / selectedKPI.target) * 100;
                  setSelectedKPI({
                    ...selectedKPI,
                    actual,
                    achievement,
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Achievement (%)</Label>
              <Input value={selectedKPI.achievement.toFixed(2)} disabled />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Problem Identification</Label>
              <Input
                value={selectedKPI.problemIdentification}
                onChange={(e) =>
                  setSelectedKPI({
                    ...selectedKPI,
                    problemIdentification: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Corrective Action</Label>
              <Input
                value={selectedKPI.correctiveAction}
                onChange={(e) =>
                  setSelectedKPI({
                    ...selectedKPI,
                    correctiveAction: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const SendToApproverDialog = () => (
    <Dialog open={sendToApproverOpen} onOpenChange={setSendToApproverOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send to Manager</DialogTitle>
          <DialogDescription>
            Select an approver and send this MPM target for approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="approver-select">Select Manager</Label>
            <Select
              value={selectedApprover}
              onValueChange={setSelectedApprover}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an approver" />
              </SelectTrigger>
              <SelectContent>
                {approvers.map((approver) => (
                  <SelectItem key={approver.id} value={approver.id}>
                    {approver.name} - {approver.position}, {approver.department}
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
              // Handle send to approver logic here
              if (selectedApprover) {
                // Process the submission with the selected approver
                console.log(`Sending to approver: ${selectedApprover}`);
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

  // Handle edit button click
  const handleEditClick = (item: KPIEntry) => {
    setSelectedKPI(item);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        
        
        
      />

      <div className="flex flex-col md:flex-row">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          
          
        />

        <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full  overflow-hidden`}>
          <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
            <div className="space-y-6 w-full">
              <Breadcrumb
                items={[{
                  label: 'MPM Target List',
                  path: '/performance-management/mpm/target'
                }]}
                currentPage={`MPM Actual - ${month}`}
                showHomeIcon={true}
                subtitle={`MPM Actual ID : ${mpmActualId}`}
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
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      KPI Actuals Table
                    </CardTitle>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-[#1B6131] text-[#1B6131] hover:bg-[#E4EFCF]"
                      onClick={() => setSendToApproverOpen(true)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send to Manager
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='m-0 p-0 pb-8'>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-[#1B6131] text-white">
                        <tr>
                          {[
                            'Actions', 'KPI', 'KPI Definition', 'Weight', 'UOM',
                            'Category', 'YTD Calculation', 'Target', 'Actual',
                            'Achievement', 'Score', 'Problem Identification',
                            'Corrective Action'
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
                        {Object.entries(paginatedData).map(([perspective, items]) => (
                          <React.Fragment key={perspective}>
                            <tr className="bg-[#E4EFCF] dark:bg-[#1B6131]/30">
                              <td colSpan={13} className="p-4 font-medium text-[#1B6131] dark:text-[#46B749]">
                                {perspective}
                              </td>
                            </tr>
                            {items.map((item) => (
                              <tr
                                key={item.id}
                                className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20 cursor-pointer"
                              >
                                <td className="p-4 text-center flex items-center justify-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-[#1B6131]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRowClick(item);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-[#1B6131]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(item);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                                <td className="p-4">{item.kpi}</td>
                                <td className="p-4">{item.kpiDefinition}</td>
                                <td className="p-4 text-center">{item.weight}%</td>
                                <td className="p-4 text-center">{item.uom}</td>
                                <td className="p-4 text-center">{item.category}</td>
                                <td className="p-4 text-center">
                                  {item.ytdCalculation}
                                </td>
                                <td className="p-4 text-center">{item.target}</td>
                                <td className="p-4 text-center">{item.actual}</td>
                                <td className="p-4 text-center">
                                  {item.achievement.toFixed(2)}%
                                </td>
                                <td className="p-4 text-center">{item.score}</td>
                                <td className="p-4">{item.problemIdentification}</td>
                                <td className="p-4">{item.correctiveAction}</td>
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

      <EditKPIDialog />
      <SendToApproverDialog />
    </div>
  );
}

export default MPMActuals;