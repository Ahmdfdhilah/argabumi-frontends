import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Header from '@/components/Header';
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
import { BarChart2Icon } from 'lucide-react';
import Footer from '@/components/Footer';

type MPMTargetStatus = 'Pending' | 'Draft' | 'Submitted' | 'Approved by Senior Manager' | 'Rejected by Senior Manager';

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

type MpmTarget = {
  id: string;
  year: string;
  period: string;
  submittedBy: string;
  departmentId: number;
  departmentName: string;
  submittedAt: Date;
  status: MPMTargetStatus;
  approverComments?: ApproverComment[];
};

const MPMTargetList: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentRole, setCurrentRole] = useState('admin');

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
  const [currentPage, setCurrentPage] = useState(1); 0;
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [selectedMpmTarget, setSelectedMpmTarget] = useState<MpmTarget | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  const [mpmTargets, setMpmTargets] = useState<MpmTarget[]>([
    {
      id: '1',
      year: '2025',
      period: '2025',
      submittedBy: 'John Doe',
      departmentId: 1,
      departmentName: 'IT Department',
      submittedAt: new Date(2025, 0, 15),
      status: 'Approved by Senior Manager',
      approverComments: [{
        reviewer: 'Jane Smith',
        comment: 'Targets look good, approved',
        action: 'Approved',
        reviewedAt: new Date(2025, 0, 18)
      }]
    },
    {
      id: '2',
      year: '2026',
      period: '2026',
      submittedBy: 'John Doe',
      departmentId: 1,
      departmentName: 'IT Department',
      submittedAt: new Date(2025, 1, 16),
      status: 'Draft',
      approverComments: []
    },
    {
      id: '3',
      year: '2024',
      period: '2024',
      submittedBy: 'Sarah Johnson',
      departmentId: 2,
      departmentName: 'Marketing',
      submittedAt: new Date(2024, 2, 17),
      status: 'Submitted',
      approverComments: []
    },
    {
      id: '4',
      year: '2027',
      period: '2027',
      submittedBy: 'Robert Brown',
      departmentId: 3,
      departmentName: 'Human Resources',
      submittedAt: new Date(2025, 3, 15),
      status: 'Rejected by Senior Manager',
      approverComments: [{
        reviewer: 'Emily Wilson',
        comment: 'Need more detailed justification for targets',
        action: 'Rejected',
        reviewedAt: new Date(2025, 3, 18)
      }]
    },
    {
      id: '5',
      year: '2025',
      period: '2025',
      submittedBy: 'Michael Lee',
      departmentId: 4,
      departmentName: 'Finance',
      submittedAt: new Date(2025, 0, 10),
      status: 'Approved by Senior Manager',
      approverComments: [{
        reviewer: 'Jane Smith',
        comment: 'Well prepared targets',
        action: 'Approved',
        reviewedAt: new Date(2025, 0, 12)
      }]
    }
  ]);

  // Filtering and Pagination Logic
  const filteredMpmTargets = useMemo(() => {
    let result = mpmTargets;

    // Filter by role
    if (currentRole === 'manager' || currentRole === 'sm_dept') {
      result = result.filter(target => target.departmentId === currentUserDepartment);
    }

    // Apply other filters
    result = result.filter(target =>
      (!selectedPeriod || target.period === selectedPeriod) &&
      (!selectedStatus || target.status === selectedStatus) &&
      (!selectedDepartment || target.departmentId.toString() === selectedDepartment)
    );

    return result;
  }, [mpmTargets, selectedPeriod, selectedStatus, selectedDepartment, currentRole, currentUserDepartment]);

  const paginatedMpmTargets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMpmTargets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMpmTargets, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod, selectedStatus, selectedDepartment]);

  // Handlers
  const handleSubmitMpmTarget = () => {
    if (selectedMpmTarget) {
      const updatedTargets = mpmTargets.map(target =>
        target.id === selectedMpmTarget.id
          ? { ...target, status: 'Submitted' as MPMTargetStatus }
          : target
      );
      setMpmTargets(updatedTargets);
      setIsSubmitModalOpen(false);
    }
  };

  const handleReviewMpmTarget = (action: 'Approved by Senior Manager' | 'Rejected by Senior Manager') => {
    if (selectedMpmTarget) {
      const newComment: ApproverComment = {
        reviewer: 'Senior Manager',
        comment: reviewComment,
        action: action === 'Approved by Senior Manager' ? 'Approved' : 'Rejected',
        reviewedAt: new Date()
      };

      const updatedTargets = mpmTargets.map(target =>
        target.id === selectedMpmTarget.id
          ? {
            ...target,
            status: action,
            approverComments: [
              ...(target.approverComments || []),
              newComment
            ]
          }
          : target
      );
      setMpmTargets(updatedTargets);
      setIsReviewModalOpen(false);
      setReviewComment('');
    }
  };

  const getStatusColor = (status: MPMTargetStatus) => {
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

  // Navigate to individual MPM Target details
  const handleRowClick = (target: MpmTarget) => {
    navigate(`/performance-management/mpm/target/${target.id}`);
  };

  return (
    <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900 relative">
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
              <Breadcrumb
                items={[]}
                currentPage="MPM Targets List"
                showHomeIcon={true}
                subtitle={`Target MPM Value ${currentRole == 'admin' ? 'Company' : 'IT Department'}`}
              />

              <Filtering
                handlePeriodChange={setSelectedPeriod}
                selectedPeriod={selectedPeriod}
              >
                {/* Additional filters as children */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
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
                      <BarChart2Icon className="h-4 w-4 text-[#46B749] dark:text-[#1B6131]" />
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
                      MPM Targets Table
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='m-0 p-0 overflow-x-auto'>
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead className="bg-[#1B6131] text-white">
                      <tr>
                        {['Year', 'Department', 'Submitted By', 'Submitted At', 'Status', 'Actions'].map(header => (
                          <th key={header} className="p-4 text-left">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMpmTargets.length > 0 ? (
                        paginatedMpmTargets.map(target => (
                          <tr
                            key={target.id}
                            className="hover:bg-[#E4EFCF]/50 dark:hover:bg-[#1B6131]/20 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                            onClick={() => handleRowClick(target)}
                          >
                            <td className="p-4">{target.year}</td>
                            <td className="p-4">{target.departmentName}</td>
                            <td className="p-4">{target.submittedBy}</td>
                            <td className="p-4">
                              {target.submittedAt.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(target.status)}`}>
                                {target.status}
                              </span>
                            </td>
                            <td
                              className="p-4 space-x-2 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()} // Prevent row click when clicking action buttons
                            >
                              {currentRole === 'manager' && target.status === 'Draft' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMpmTarget(target);
                                    setIsSubmitModalOpen(true);
                                  }}
                                >
                                  Submit
                                </Button>
                              )}
                              {currentRole === 'sm_dept' && target.status === 'Submitted' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMpmTarget(target);
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
                                  onClick={() => handleRowClick(target)}
                                >
                                  View Details
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-gray-500">
                            No targets found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredMpmTargets.length / itemsPerPage)}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredMpmTargets.length}
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
            <DialogTitle>Submit MPM Target</DialogTitle>
            <DialogDescription>
              Submit your yearly performance management targets for review
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='space-y-4'>
            <div className="flex flex-col lg:flex-row gap-4">
              <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitMpmTarget}>
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
            <DialogTitle>Review MPM Target</DialogTitle>
            <DialogDescription>
              Review and take action on the submitted performance management targets
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
                onClick={() => handleReviewMpmTarget('Rejected by Senior Manager')}
              >
                Reject
              </Button>
              <Button onClick={() => handleReviewMpmTarget('Approved by Senior Manager')}>
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MPMTargetList;