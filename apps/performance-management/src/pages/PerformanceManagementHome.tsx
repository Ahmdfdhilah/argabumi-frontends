import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@workspace/ui/components/accordion";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Info, AlertTriangle, CheckCircle2, FileText, Users } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/redux/hooks';

const PerformanceManagementHome = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
   
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            console.log(user);
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat">
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
                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <Breadcrumb
                            items={[]}
                            currentPage="Home"
                            showHomeIcon={false}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8">
                            <DashboardCard
                                title="MPM"
                                description="Monthly Performance Management"
                                icon={<FileText className="h-8 w-8 text-[#1B6131] dark:text-[#46B749]" />}
                            />
                            <DashboardCard
                                title="IPM"
                                description="Individual Performance Management"
                                icon={<Users className="h-8 w-8 text-[#1B6131] dark:text-[#46B749]" />}
                            />
                            <DashboardCard
                                title="BSC"
                                description="Balanced Scorecard"
                                icon={<CheckCircle2 className="h-8 w-8 text-[#1B6131] dark:text-[#46B749]" />}
                            />
                        </div>

                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                    <Info className="mr-2 h-5 w-5" />
                                    User Guide
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pt-2 pb-8">
                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="my-12 md:my-4 p-0 bg-transparent ">
                                        <div className="flex flex-wrap gap-2 w-full md:w-auto p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <TabsTrigger value="overview">Overview</TabsTrigger>
                                            <TabsTrigger value="employee">Employee</TabsTrigger>
                                            <TabsTrigger value="manager">Manager</TabsTrigger>
                                            <TabsTrigger value="sm_dept">SM Department</TabsTrigger>
                                            <TabsTrigger value="admin">Admin</TabsTrigger>
                                        </div>
                                    </TabsList>

                                    <TabsContent value="overview" className="space-y-4">
                                        <h3 className="text-xl font-semibold text-[#1B6131] dark:text-[#46B749]">Performance Management System Overview</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div className="bg-[#f0f9f0] dark:bg-[#0a2e14] p-4 rounded-lg border border-[#46B749] dark:border-[#1B6131]">
                                                <h4 className="font-semibold mb-2 flex items-center">
                                                    <FileText className="h-5 w-5 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                                                    MPM (Monthly Performance Management)
                                                </h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    Track and manage monthly performance metrics. Set targets, input actual results, and monitor progress through a balanced scorecard approach.
                                                </p>
                                            </div>

                                            <div className="bg-[#f0f9f0] dark:bg-[#0a2e14] p-4 rounded-lg border border-[#46B749] dark:border-[#1B6131]">
                                                <h4 className="font-semibold mb-2 flex items-center">
                                                    <Users className="h-5 w-5 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                                                    IPM (Individual Performance Management)
                                                </h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    Manage individual performance with specific action plans. Track progress, achievements, and get approvals from supervisors.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-[#f0f9f0] dark:bg-[#0a2e14] p-4 rounded-lg border border-[#46B749] dark:border-[#1B6131]">
                                            <h4 className="font-semibold mb-2 flex items-center">
                                                <CheckCircle2 className="h-5 w-5 mr-2 text-[#1B6131] dark:text-[#46B749]" />
                                                BSC (Balanced Scorecard)
                                            </h4>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                A comprehensive performance measurement framework that adds strategic non-financial performance measures to traditional financial metrics. It's structured around four perspectives: Financial, Customer, Internal Business Process, and Learning & Growth.
                                            </p>
                                        </div>

                                        <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700 mt-4">
                                            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                Each role in the system has specific access and responsibilities. Please refer to the appropriate guide section for your role.
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="employee" className="space-y-4">
                                        <h3 className="text-xl font-semibold text-[#1B6131] dark:text-[#46B749]">Employee User Guide</h3>

                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="mpm-employee">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    MPM (Monthly Performance Management)
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>The MPM module allows you to manage and track monthly performance:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Navigate to the MPM menu item</li>
                                                        <li>Input targets for each KPI in the "MPM Input Target" section</li>
                                                        <li>Define specific action plans for each KPI</li>
                                                        <li>Send the targets to your manager using the "Send to manager" button</li>
                                                        <li>Input actual achievements in the "MPM Input Actual" section</li>
                                                        <li>Provide problem identification and corrective actions for KPIs that did not meet targets</li>
                                                        <li>Send actual results to your manager</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            You can recall submitted targets or actuals if they are not yet approved by clicking the "Recall" button.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="ipm-employee">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    IPM (Individual Performance Management)
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>The IPM module helps you track individual action plans and achievements:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Navigate to the IPM menu item</li>
                                                        <li>Create a new action plan by filling in the required fields:
                                                            <ul className="list-disc ml-5 mt-1">
                                                                <li>Title - The name of your action plan</li>
                                                                <li>Description - Detailed explanation of the action</li>
                                                                <li>Action Type - Select "Manual" or "Otomatis" (if linked to MPM)</li>
                                                                <li>Target Date - When the action plan should be completed</li>
                                                                <li>Achievement - Your current progress percentage</li>
                                                            </ul>
                                                        </li>
                                                        <li>Click "Save Action Plan" to create it</li>
                                                        <li>Submit to your manager by clicking the send button in the Actions column</li>
                                                        <li>Update achievement percentages as you progress</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            Action plans with "Otomatis" type are automatically generated from your MPM action plans.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="bsc-employee">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    BSC (Balanced Scorecard)
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>The BSC dashboard provides an overview of your performance from multiple perspectives:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Access the BSC Dashboard from the main menu</li>
                                                        <li>View performance across four key perspectives:
                                                            <ul className="list-disc ml-5 mt-1">
                                                                <li>Financial - Revenue, profit and financial metrics</li>
                                                                <li>Customer - Customer satisfaction and relationship metrics</li>
                                                                <li>Internal Business Process - Operational efficiency metrics</li>
                                                                <li>Learning & Growth - Development and innovation metrics</li>
                                                            </ul>
                                                        </li>
                                                        <li>Check your achievement scores based on the target vs. actual values</li>
                                                        <li>Review problem identifications and corrective actions</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            Score calculations are based on achievement percentage. Refer to the scoring table in the system guide for details.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TabsContent>

                                    <TabsContent value="manager" className="space-y-4">
                                        <h3 className="text-xl font-semibold text-[#1B6131] dark:text-[#46B749]">Manager User Guide</h3>

                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="mpm-manager">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    MPM Approval Process
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>As an manager, you review and approve MPM submissions from your team:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Check the "Sent to Manager" status items in the MPM section</li>
                                                        <li>Review the targets set by employees</li>
                                                        <li>Evaluate action plans for feasibility and alignment with department goals</li>
                                                        <li>Review actual achievements and problem identification</li>
                                                        <li>Approve submissions by clicking the approve button, or reject with comments</li>
                                                        <li>Approved items are sent to the SM Department for final validation</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            You can request revisions by adding comments and returning the submission to the employee.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="ipm-manager">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    IPM Approval Process
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>Manage and approve IPM action plans from your team members:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Review IPM action plans with "Sent to Manager" status</li>
                                                        <li>Assess if action plans are aligned with department objectives</li>
                                                        <li>Check if achievement percentages are accurate</li>
                                                        <li>Approve action plans by clicking the check button</li>
                                                        <li>Reject or request changes using the X button</li>
                                                        <li>Approved IPMs are forwarded to SM Department for validation</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            You should regularly check for new submissions to ensure timely progress on action plans.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="monitoring-manager">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    Performance Monitoring
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>As an manager, you can monitor your team's performance:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>View the BSC Dashboard to see overall department performance</li>
                                                        <li>Check the MPM Top 5 and IPM Top 5 for high-performing metrics and action plans</li>
                                                        <li>Review problem identification and corrective action sections</li>
                                                        <li>Identify performance trends across periods</li>
                                                        <li>Provide guidance to team members on improving underperforming areas</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            Regular monitoring helps identify issues early and provide timely support to your team.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TabsContent>

                                    <TabsContent value="sm_dept" className="space-y-4">
                                        <h3 className="text-xl font-semibold text-[#1B6131] dark:text-[#46B749]">SM Department User Guide</h3>

                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="mpm-sm">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    MPM Validation Process
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>As SM Department staff, you validate and finalize all performance submissions:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Review MPM submissions with "Sent to SM" status</li>
                                                        <li>Verify that KPIs and targets align with company objectives</li>
                                                        <li>Check that appropriate action plans are in place</li>
                                                        <li>Validate actual achievements against supporting data</li>
                                                        <li>Confirm problem identification and corrective actions are appropriate</li>
                                                        <li>Finalize validation by changing status to "Validate by SM"</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            You can request additional information or revisions from approvers if necessary.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="ipm-sm">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    IPM Validation Process
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>The SM Department validates IPM submissions:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Review IPM actions plans with "Sent to SM" status</li>
                                                        <li>Verify that action plans support departmental objectives</li>
                                                        <li>Check that achievement percentages are supported by evidence</li>
                                                        <li>Validate that action plans are properly categorized</li>
                                                        <li>Finalize by clicking the validation button</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            Maintain consistent validation criteria across all departments.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="bsc-sm">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    BSC Management
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>The SM Department manages the Balanced Scorecard system:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Oversee the BSC Dashboard and data updates</li>
                                                        <li>Manage KPI database and ensure consistency</li>
                                                        <li>Set up period settings for performance tracking</li>
                                                        <li>Generate reports for management review</li>
                                                        <li>Monitor strategic initiatives progress</li>
                                                        <li>Ensure proper scoring based on achievement levels</li>
                                                    </ol>
                                                    <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 mt-2">
                                                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Scoring Table Reference</h5>
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-100 dark:bg-gray-800">
                                                                    <tr>
                                                                        <th className="px-2 py-1 text-left">Category</th>
                                                                        <th className="px-2 py-1 text-left">Achievement Range</th>
                                                                        <th className="px-2 py-1 text-left">Score</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                    <tr>
                                                                        <td className="px-2 py-1">Max</td>
                                                                        <td className="px-2 py-1">0% - 40%</td>
                                                                        <td className="px-2 py-1">0</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-2 py-1">Max</td>
                                                                        <td className="px-2 py-1">40% - 80%</td>
                                                                        <td className="px-2 py-1">1</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-2 py-1">Max</td>
                                                                        <td className="px-2 py-1">80% - 100%</td>
                                                                        <td className="px-2 py-1">2</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-2 py-1">Max</td>
                                                                        <td className="px-2 py-1">100% - 125%</td>
                                                                        <td className="px-2 py-1">3</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-2 py-1">Max</td>
                                                                        <td className="px-2 py-1">{'>'}125%</td>
                                                                        <td className="px-2 py-1">4</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TabsContent>

                                    <TabsContent value="admin" className="space-y-4">
                                        <h3 className="text-xl font-semibold text-[#1B6131] dark:text-[#46B749]">Admin User Guide</h3>

                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="user-admin">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    User Management
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>As an admin, you manage user access and permissions:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Access the "Master User Access" menu item</li>
                                                        <li>Create new user accounts and assign roles</li>
                                                        <li>Manage role permissions (Employee, Manager, SM Dept, Admin)</li>
                                                        <li>Deactivate accounts when needed</li>
                                                        <li>Reset passwords and manage account recovery</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            Ensure that manager assignments match the organizational hierarchy.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="system-admin">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    System Configuration
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>Configure system settings and databases:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Manage the "Database KPI" to define available KPIs</li>
                                                        <li>Configure the "Master Period" settings for performance cycles</li>
                                                        <li>Set up reporting parameters and templates</li>
                                                        <li>Configure BSC dashboard settings</li>
                                                        <li>Manage system backups and maintenance</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            Regular system maintenance ensures reliable performance data tracking.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="report-admin">
                                                <AccordionTrigger className="text-[#1B6131] dark:text-[#46B749] font-medium">
                                                    Report Management
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm space-y-3">
                                                    <p>Generate and manage system reports:</p>
                                                    <ol className="list-decimal ml-5 space-y-2">
                                                        <li>Access the "Report" section to generate performance reports</li>
                                                        <li>Create custom report templates</li>
                                                        <li>Schedule automated report generation</li>
                                                        <li>Export reports in various formats (PDF, Excel, etc.)</li>
                                                        <li>Set up department-specific report access</li>
                                                    </ol>
                                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                                                            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            Reports are essential for management reviews and decision making.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                    </main>
                    <Footer
                        
                    />
                </div>
            </div>
        </div>
    );
};

interface DashboardCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const DashboardCard = ({ title, description, icon }: DashboardCardProps) => {
    return (
        <Card className="border border-[#46B749] dark:border-[#1B6131] shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-start">
                <div className="p-2 sm:p-3 bg-[#f0f9f0] dark:bg-[#0a2e14] rounded-full mr-3 sm:mr-4">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1B6131] dark:text-[#46B749]">{title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PerformanceManagementHome;