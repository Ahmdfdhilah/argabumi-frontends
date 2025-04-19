import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Filtering from '@/components/Filtering';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@workspace/ui/components/dialog';
import { DialogFooter, DialogHeader } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import Breadcrumb from '@/components/Breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

type MPMActualStatus = 'Pending' | 'Draft' | 'Submitted' | 'Approved by Senior Manager' | 'Rejected by Senior Manager';

type ApproverComment = {
  reviewer: string;
  comment: string;
  action: 'Approved' | 'Rejected';
  reviewedAt: Date;
};

type Department = {
  id: number;
  name: string;
  code: string;
};

type MpmActual = {
  id: string;
  month: string;
  period: string;
  year: string;
  submittedBy: string;
  departmentId: number;
  departmentName: string;
  submittedAt: Date;
  status: MPMActualStatus;
  approverComments?: ApproverComment[];
};

const MPMActualList: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentRole] = useState('admin');

  // Filtering States
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Departments data
  const [departments, _] = useState<Department[]>([
    { id: 1, name: 'IT Department', code: 'IT' },
    { id: 2, name: 'Marketing', code: 'MKT' },
    { id: 3, name: 'Human Resources', code: 'HRD' },
    { id: 4, name: 'Finance', code: 'FIN' },
  ]);

  // Current user department (for manager/sm)
  const [currentUserDepartment,] = useState<number | null>(1);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [selectedMpmActual, setSelectedMpmActual] = useState<MpmActual | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  const [mpmActuals, setMpmActuals] = useState<MpmActual[]>([
    {
      id: '1',
      month: 'January',
      period: 'Jan-25',
      year: '2025',
      submittedBy: 'John Doe',
      departmentId: 1,
      departmentName: 'IT Department',
      submittedAt: new Date(2025, 0, 15),
      status: 'Approved by Senior Manager',
      approverComments: [{
        reviewer: 'Jane Smith',
        comment: 'All KPIs look good, approved',
        action: 'Approved',
        reviewedAt: new Date(2025, 0, 18)
      }]
    },
    {
      id: '2',
      month: 'February',
      period: 'Feb-25',
      year: '2025',
      submittedBy: 'John Doe',
      departmentId: 1,
      departmentName: 'IT Department',
      submittedAt: new Date(2025, 1, 16),
      status: 'Approved by Senior Manager',
      approverComments: [{
        reviewer: 'Jane Smith',
        comment: 'Minor discrepancies noted but within acceptable range',
        action: 'Approved',
        reviewedAt: new Date(2025, 1, 19)
      }]
    },
    {
      id: '3',
      month: 'March',
      period: 'Mar-25',
      year: '2025',
      submittedBy: 'John Doe',
      departmentId: 1,
      departmentName: 'IT Department',
      submittedAt: new Date(2025, 2, 17),
      status: 'Rejected by Senior Manager',
      approverComments: [{
        reviewer: 'Jane Smith',
        comment: 'Incomplete documentation',
        action: 'Rejected',
        reviewedAt: new Date(2025, 2, 20)
      }]
    },
    {
      id: '4',
      month: 'April',
      period: 'Apr-25',
      year: '2025',
      submittedBy: 'John Doe',
      departmentId: 1,
      departmentName: 'IT Department',
      submittedAt: new Date(2025, 3, 15),
      status: 'Submitted',
      approverComments: []
    },
    {
      id: '5',
      month: 'May',
      period: 'May-25',
      year: '2025',
      submittedBy: 'John Doe',
      departmentId: 1,
      departmentName: 'IT Department',
      submittedAt: new Date(2025, 4, 16),
      status: 'Draft',
      approverComments: []
    },
    {
      id: '6',
      month: 'June',
      period: 'Jun-25',
      year: '2025',
      submittedBy: 'Sarah Johnson',
      departmentId: 2,
      departmentName: 'Marketing',
      submittedAt: new Date(2025, 5, 17),
      status: 'Approved by Senior Manager',
      approverComments: [{
        reviewer: 'Michael Chen',
        comment: 'Excellent performance this month',
        action: 'Approved',
        reviewedAt: new Date(2025, 5, 20)
      }]
    },
    {
      id: '7',
      month: 'July',
      period: 'Jul-25',
      year: '2025',
      submittedBy: 'Sarah Johnson',
      departmentId: 2,
      departmentName: 'Marketing',
      submittedAt: new Date(2025, 6, 15),
      status: 'Submitted',
      approverComments: []
    },
    {
      id: '8',
      month: 'August',
      period: 'Aug-25',
      year: '2025',
      submittedBy: 'Sarah Johnson',
      departmentId: 2,
      departmentName: 'Marketing',
      submittedAt: new Date(2025, 7, 16),
      status: 'Draft',
      approverComments: []
    },
    {
      id: '9',
      month: 'September',
      period: 'Sep-25',
      year: '2025',
      submittedBy: 'Robert Brown',
      departmentId: 3,
      departmentName: 'Human Resources',
      submittedAt: new Date(2025, 8, 17),
      status: 'Approved by Senior Manager',
      approverComments: [{
        reviewer: 'Emily Wilson',
        comment: 'Q3 results are satisfactory',
        action: 'Approved',
        reviewedAt: new Date(2025, 8, 21)
      }]
    },
    {
      id: '10',
      month: 'October',
      period: 'Oct-25',
      year: '2025',
      submittedBy: 'Robert Brown',
      departmentId: 3,
      departmentName: 'Human Resources',
      submittedAt: new Date(2025, 9, 15),
      status: 'Rejected by Senior Manager',
      approverComments: [{
        reviewer: 'Emily Wilson',
        comment: 'Missing documentation for several KPIs',
        action: 'Rejected',
        reviewedAt: new Date(2025, 9, 18)
      }]
    },
    {
      id: '11',
      month: 'November',
      period: 'Nov-25',
      year: '2025',
      submittedBy: 'Robert Brown',
      departmentId: 3,
      departmentName: 'Human Resources',
      submittedAt: new Date(2025, 10, 16),
      status: 'Submitted',
      approverComments: []
    },
    {
      id: '12',
      month: 'December',
      period: 'Dec-25',
      year: '2025',
      submittedBy: 'Robert Brown',
      departmentId: 3,
      departmentName: 'Human Resources',
      submittedAt: new Date(2025, 11, 15),
      status: 'Draft',
      approverComments: []
    }
  ]);

  // Filtering and Pagination Logic
  const filteredMpmActuals = useMemo(() => {
    let result = mpmActuals;

    // Filter by role
    if (currentRole === 'manager' || currentRole === 'sm_dept') {
      result = result.filter(actual => actual.departmentId === currentUserDepartment);
    }

    // Apply other filters
    result = result.filter(actual =>
      (!selectedPeriod || actual.period === selectedPeriod) &&
      (!selectedStatus || actual.status === selectedStatus) &&
      (!selectedDepartment || actual.departmentId.toString() === selectedDepartment)
    );

    return result;
  }, [mpmActuals, selectedPeriod, selectedStatus, selectedDepartment, currentRole, currentUserDepartment]);

  const paginatedMpmActuals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMpmActuals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMpmActuals, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod, selectedStatus, selectedDepartment]);

  // Handlers
  const handleSubmitMpmActual = () => {
    if (selectedMpmActual) {
      const updatedActuals = mpmActuals.map(actual =>
        actual.id === selectedMpmActual.id
          ? { ...actual, status: 'Submitted' as MPMActualStatus }
          : actual
      );
      setMpmActuals(updatedActuals);
      setIsSubmitModalOpen(false);
    }
  };

  const handleReviewMpmActual = (action: 'Approved by Senior Manager' | 'Rejected by Senior Manager') => {
    if (selectedMpmActual) {
      const newComment: ApproverComment = {
        reviewer: 'Senior Manager',
        comment: reviewComment,
        action: action === 'Approved by Senior Manager' ? 'Approved' : 'Rejected',
        reviewedAt: new Date()
      };

      const updatedActuals = mpmActuals.map(actual =>
        actual.id === selectedMpmActual.id
          ? {
            ...actual,
            status: action,
            approverComments: [
              ...(actual.approverComments || []),
              newComment
            ]
          }
          : actual
      );
      setMpmActuals(updatedActuals);
      setIsReviewModalOpen(false);
      setReviewComment('');
    }
  };

  const getStatusColor = (status: MPMActualStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
      case 'Submitted':
        return 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
      case 'Draft':
        return 'bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200';
      case 'Approved by Senior Manager':
        return 'bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-200';
      case 'Rejected by Senior Manager':
        return 'bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Navigate to individual MPM Actual details
  const handleRowClick = (actual: MpmActual) => {
    navigate(`/performance-management/mpm/actual/${actual.id}?month=${actual.month}`);
  };

  return (
    <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900 relative">
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

        <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
          <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
            <div className="space-y-6 w-full">
              <Breadcrumb
                items={[]}
                currentPage="MPM Actuals List"
                showHomeIcon={true}
                subtitle={`Actual MPM Value ${currentRole == 'admin' ? 'Company' : 'IT Department'}`}
              />

              {/* Enhanced Filter Section */}
              <Filtering
                handlePeriodChange={setSelectedPeriod}
                selectedPeriod={selectedPeriod}
              >

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <span>Status</span>
                  </label>
                  <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Approved by Senior Manager">Approved</SelectItem>
                      <SelectItem value="Rejected by Senior Manager">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentRole === 'admin' && (
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <span>Department</span>
                    </label>
                    <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                      <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-[#46B749] dark:border-[#1B6131] h-10">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </Filtering>

              <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md pb-4">
                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      MPM Actuals Table
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='m-0 p-0 overflow-x-auto pb-4'>
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead className="bg-[#1B6131] text-white">
                      <tr>
                        {['Month', 'Year', 'Department', 'Submitted By', 'Submitted At', 'Status', 'Actions'].map(header => (
                          <th key={header} className="p-4 text-left">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMpmActuals.length > 0 ? (
                        paginatedMpmActuals.map(actual => (
                          <tr
                            key={actual.id}
                            className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                            onClick={() => handleRowClick(actual)}
                          >
                            <td className="p-4">{actual.month}</td>
                            <td className="p-4">{actual.year}</td>
                            <td className="p-4">{actual.departmentName}</td>
                            <td className="p-4">{actual.submittedBy}</td>
                            <td className="p-4">
                              {actual.submittedAt.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(actual.status)}`}>
                                {actual.status}
                              </span>
                            </td>
                            <td
                              className="p-4 space-x-2 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()} // Prevent row click when clicking action buttons
                            >
                              {currentRole === 'manager' && actual.status === 'Draft' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMpmActual(actual);
                                    setIsSubmitModalOpen(true);
                                  }}
                                >
                                  Submit
                                </Button>
                              )}
                              {currentRole === 'sm_dept' && actual.status === 'Submitted' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMpmActual(actual);
                                    setIsReviewModalOpen(true);
                                  }}
                                >
                                  Review
                                </Button>
                              )}
                              {currentRole === 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRowClick(actual)}
                                >
                                  View Details
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-gray-500">
                            No actuals found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredMpmActuals.length / itemsPerPage)}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredMpmActuals.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  
                  />
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* Submit Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="max-w-md w-[95%] lg:max-w-lg rounded-lg overflow-y-scroll max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Submit MPM Actual</DialogTitle>
            <DialogDescription>
              Submit your monthly performance management actuals for review
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='space-y-4'>
            <div className="flex flex-col lg:flex-row gap-4">
              <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitMpmActual}>
                Confirm Submission
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md w-[95%] lg:max-w-lg rounded-lg overflow-y-scroll max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Review MPM Actual</DialogTitle>
            <DialogDescription>
              Review and take action on the submitted performance management actuals
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="review-comments">Review Comments</Label>
              <Input
                id="review-comments"
                placeholder="Enter your review comments"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className='space-y-4'>
            <div className="flex flex-col lg:flex-row gap-4">
              <Button
                variant="destructive"
                onClick={() => handleReviewMpmActual('Rejected by Senior Manager')}
              >
                Reject
              </Button>
              <Button onClick={() => handleReviewMpmActual('Approved by Senior Manager')}>
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MPMActualList;