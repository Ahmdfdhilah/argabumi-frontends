import { useState } from 'react';
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
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import Sidebar from '@/components/Sidebar';
import { Edit, Plus } from 'lucide-react';
import Header from '@/components/Header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import Footer from '@/components/Footer';

// Types
type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
type Category = 'Max' | 'Min' | 'On Target';

type ActionPlanEntry = {
  id: string;
  kpi: string;
  kpiDefinition: string;
  weight: number;
  uom: string;
  category: Category;
  ytdCalculation: YTDCalculation;
  target: number;
  actionPlanTitle: string;
  pic: string;
  q1Target: number;
  q1Actual: number;
  q2Target: number;
  q2Actual: number;
  q3Target: number;
  q3Actual: number;
  q4Target: number;
  q4Actual: number;
  status: 'On Track' | 'At Risk' | 'Off Track';
};

const MPMActionPlan = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
 
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedActionPlan, setSelectedActionPlan] =
    useState<ActionPlanEntry | null>(null);

  // Sample data structure
  const [actionPlanData, setActionPlanData] = useState<ActionPlanEntry[]>([
    {
      id: '1',
      kpi: 'Profit/Loss',
      kpiDefinition: 'Rasio keuntungan',
      weight: 55,
      uom: '%',
      category: 'Max',
      ytdCalculation: 'Last Value',
      target: 2,
      actionPlanTitle: 'Action Plan 1: Menjaga rasio income',
      pic: 'Karyawan A',
      q1Target: 3,
      q1Actual: 2.8,
      q2Target: 3,
      q2Actual: 2.9,
      q3Target: 3,
      q3Actual: 0,
      q4Target: 3,
      q4Actual: 0,
      status: 'On Track',
    },
    {
      id: '2',
      kpi: 'Profit/Loss',
      kpiDefinition: 'Rasio keuntungan',
      weight: 50,
      uom: '%',
      category: 'Max',
      ytdCalculation: 'Last Value',
      target: 2,
      actionPlanTitle: 'Action Plan 2: Menjaga rasio expense',
      pic: 'Karyawan A',
      q1Target: 2,
      q1Actual: 1.7,
      q2Target: 2,
      q2Actual: 1.8,
      q3Target: 2,
      q3Actual: 0,
      q4Target: 2,
      q4Actual: 0,
      status: 'At Risk',
    },
  ]);

  // Form state for create/edit dialog
  const [formData, setFormData] = useState<Partial<ActionPlanEntry>>({
    kpi: '',
    kpiDefinition: '',
    weight: 0,
    uom: '%',
    category: 'Max',
    ytdCalculation: 'Last Value',
    target: 0,
    actionPlanTitle: '',
    pic: '',
    q1Target: 0,
    q1Actual: 0,
    q2Target: 0,
    q2Actual: 0,
    q3Target: 0,
    q3Actual: 0,
    q4Target: 0,
    q4Actual: 0,
    status: 'On Track',
  });

  // Create Dialog Component
  const CreateActionPlanDialog = () => {
    const handleCreate = () => {
      const newId = Date.now().toString();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _unused, ...formDataWithoutId } = formData;
      const newActionPlan: ActionPlanEntry = {
        id: newId,
        ...formDataWithoutId,
      } as ActionPlanEntry;

      setActionPlanData([...actionPlanData, newActionPlan]);
      setIsCreateDialogOpen(false);
      setFormData({
        kpi: '',
        kpiDefinition: '',
        weight: 0,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Last Value',
        target: 0,
        actionPlanTitle: '',
        pic: '',
        q1Target: 0,
        q1Actual: 0,
        q2Target: 0,
        q2Actual: 0,
        q3Target: 0,
        q3Actual: 0,
        q4Target: 0,
        q4Actual: 0,
        status: 'On Track',
      });
    };

    return (
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl  overflow-y-scroll max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Create New Action Plan</DialogTitle>
            <DialogDescription>
              Add a new action plan to track KPI performance
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>KPI</Label>
              <Input
                value={formData.kpi || ''}
                onChange={(e) =>
                  setFormData({ ...formData, kpi: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>KPI Definition</Label>
              <Input
                value={formData.kpiDefinition || ''}
                onChange={(e) =>
                  setFormData({ ...formData, kpiDefinition: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Weight (%)</Label>
              <Input
                type="number"
                value={formData.weight || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>UOM</Label>
              <Select
                value={formData.uom || '%'}
                onValueChange={(val) => setFormData({ ...formData, uom: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="%">%</SelectItem>
                  <SelectItem value="Number">Number</SelectItem>
                  <SelectItem value="Days">Days</SelectItem>
                  <SelectItem value="Kriteria">Kriteria</SelectItem>
                  <SelectItem value="Number (Ton)">Number (Ton)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category || 'Max'}
                onValueChange={(val: Category) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Max">Max</SelectItem>
                  <SelectItem value="Min">Min</SelectItem>
                  <SelectItem value="On Target">On Target</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>YTD Calculation</Label>
              <Select
                value={formData.ytdCalculation || 'Last Value'}
                onValueChange={(val: YTDCalculation) =>
                  setFormData({ ...formData, ytdCalculation: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select YTD Calculation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accumulative">Accumulative</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Last Value">Last Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target</Label>
              <Input
                type="number"
                value={formData.target || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Action Plan Title</Label>
              <Input
                value={formData.actionPlanTitle || ''}
                onChange={(e) =>
                  setFormData({ ...formData, actionPlanTitle: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>PIC (Person In Charge)</Label>
              <Input
                value={formData.pic || ''}
                onChange={(e) =>
                  setFormData({ ...formData, pic: e.target.value })
                }
              />
            </div>

            {/* Quarterly Targets and Actuals */}
            <div className="col-span-2">
              <h3 className="font-medium mb-2">
                Quarterly Targets and Actuals
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {(['q1', 'q2', 'q3', 'q4'] as const).map((quarter) => (
                  <div key={quarter} className="space-y-2">
                    <Label>{quarter.toUpperCase()}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Target</Label>
                        <Input
                          type="number"
                          value={
                            formData[
                            `${quarter}Target` as keyof typeof formData
                            ] || 0
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [`${quarter}Target`]: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Actual</Label>
                        <Input
                          type="number"
                          value={
                            formData[
                            `${quarter}Actual` as keyof typeof formData
                            ] || 0
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [`${quarter}Actual`]: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status || 'On Track'}
                onValueChange={(val: 'On Track' | 'At Risk' | 'Off Track') =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Off Track">Off Track</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Action Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  // Edit Dialog Component
  const EditActionPlanDialog = () => {
    if (!selectedActionPlan) return null;

    const handleSave = () => {
      if (selectedActionPlan) {
        setActionPlanData((prevData) =>
          prevData.map((item) =>
            item.id === selectedActionPlan.id ? selectedActionPlan : item
          )
        );
        setIsEditDialogOpen(false);
      }
    };

    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Action Plan</DialogTitle>
            <DialogDescription>
              Update action plan details and progress
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>KPI</Label>
              <Input
                value={selectedActionPlan.kpi}
                onChange={(e) =>
                  setSelectedActionPlan({
                    ...selectedActionPlan,
                    kpi: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Action Plan Title</Label>
              <Input
                value={selectedActionPlan.actionPlanTitle}
                onChange={(e) =>
                  setSelectedActionPlan({
                    ...selectedActionPlan,
                    actionPlanTitle: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>PIC</Label>
              <Input
                value={selectedActionPlan.pic}
                onChange={(e) =>
                  setSelectedActionPlan({
                    ...selectedActionPlan,
                    pic: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedActionPlan.status}
                onValueChange={(val: 'On Track' | 'At Risk' | 'Off Track') =>
                  setSelectedActionPlan({ ...selectedActionPlan, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Off Track">Off Track</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quarterly Targets and Actuals */}
            <div className="col-span-2">
              <h3 className="font-medium mb-2">
                Quarterly Targets and Actuals
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {(['q1', 'q2', 'q3', 'q4'] as const).map((quarter) => (
                  <div key={quarter} className="space-y-2">
                    <Label>{quarter.toUpperCase()}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Target</Label>
                        <Input
                          type="number"
                          value={
                            selectedActionPlan[
                            `${quarter}Target` as keyof typeof selectedActionPlan
                            ]
                          }
                          onChange={(e) =>
                            setSelectedActionPlan({
                              ...selectedActionPlan,
                              [`${quarter}Target`]: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Actual</Label>
                        <Input
                          type="number"
                          value={
                            selectedActionPlan[
                            `${quarter}Actual` as keyof typeof selectedActionPlan
                            ]
                          }
                          onChange={(e) =>
                            setSelectedActionPlan({
                              ...selectedActionPlan,
                              [`${quarter}Actual`]: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

  // Custom Table Component
  const CustomTable = ({ data }: { data: ActionPlanEntry[] }) => {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          {/* Table Header */}
          <thead className="bg-[#1B6131] text-white">
            <tr>
              <th className="p-3 text-center font-semibold">Action</th>
              <th className="p-3 text-left font-semibold">Action Plan</th>
              <th className="p-3 text-left font-semibold">KPI</th>
              <th className="p-3 text-center font-semibold">PIC</th>
              <th className="p-3 text-center font-semibold">Weight</th>
              <th className="p-3 text-center font-semibold">Target</th>
              {['Q1-23', 'Q2-23', 'Q3-23', 'Q4-23'].map((quarter) => (
                <th key={quarter} className="p-3 text-center font-semibold">
                  <div className="text-center mb-2">{quarter}</div>
                  <div className="grid grid-cols-2">
                    <div className="text-center text-sm">T</div>
                    <div className="text-center text-sm">A</div>
                  </div>
                </th>
              ))}
              <th className="p-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="bg-white dark:bg-gray-800">
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20"
              >
                <td className="p-3 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-[#1B6131]"
                    onClick={() => handleEditClick(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </td>
                <td className="p-3 font-medium">{item.actionPlanTitle}</td>
                <td className="p-3">{item.kpi}</td>
                <td className="p-3 text-center">{item.pic}</td>
                <td className="p-3 text-center">{item.weight}%</td>
                <td className="p-3 text-center">{item.target}</td>
                {/* Q1-Q4 Cells */}
                {(['q1', 'q2', 'q3', 'q4'] as const).map((quarter) => (
                  <td key={quarter} className="p-3">
                    <div className="grid grid-cols-2">
                      <div className="text-center">
                        {item[`${quarter}Target` as keyof typeof item]}
                      </div>
                      // Replace the comparison logic in the table body with:
                      <div
                        className={`text-center ${Number(
                          item[`${quarter}Actual` as keyof typeof item]
                        ) >=
                          Number(item[`${quarter}Target` as keyof typeof item])
                          ? 'text-green-600'
                          : Number(
                            item[`${quarter}Actual` as keyof typeof item]
                          ) >=
                            Number(
                              item[`${quarter}Target` as keyof typeof item]
                            ) *
                            0.8
                            ? 'text-amber-500'
                            : 'text-red-500'
                          }`}
                      >
                        {item[`${quarter}Actual` as keyof typeof item] || '-'}
                      </div>
                    </div>
                  </td>
                ))}
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'On Track'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'At Risk'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleEditClick = (item: ActionPlanEntry) => {
    setSelectedActionPlan(item);
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

        <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
          <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
            <div className="space-y-6 w-full">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 mt-4 space-y-4 sm:space-y-0">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1B6131] dark:text-[#46B749] w-full">
                  MPM Info - Action Plan
                </h1>
                <Button
                  className="w-full sm:w-auto bg-[#1B6131] hover:bg-[#0D4A1E] text-white"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Action Plan
                </Button>
              </div>

              {/* Main Card */}
              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                    Action Plan Management
                  </CardTitle>
                </CardHeader>
                <CardContent className='mt-4'>
                  <CustomTable data={actionPlanData} />
                </CardContent>
              </Card>

              {/* Quarterly Progress Card */}
              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                    Quarterly Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((quarter, index) => (
                      <Card key={quarter} className="shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {quarter} 2023
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Completion
                              </span>
                              <span className="text-sm font-bold">
                                {index < 2 ? '100%' : '0%'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-[#1B6131] h-2.5 rounded-full"
                                style={{ width: index < 2 ? '100%' : '0%' }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                                <span>On Track</span>
                              </div>
                              <span>{index < 2 ? '1' : '0'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                                <span>At Risk</span>
                              </div>
                              <span>{index < 2 ? '1' : '0'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                                <span>Off Track</span>
                              </div>
                              <span>0</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </div>

      <CreateActionPlanDialog
      />
      <EditActionPlanDialog />
    </div>
  );
}

export default MPMActionPlan;