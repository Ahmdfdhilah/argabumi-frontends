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
    User,
    ArrowLeft,
    Users,
    ChevronRight,
    Search,
    ChevronUp,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle
} from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@workspace/ui/components/alert";

import { Input } from "@workspace/ui/components/input";
import Footer from '@/components/Footer';
import employeeService, { 
    Employee,
} from '@/services/employeeService';
import { useParams, useNavigate } from 'react-router-dom';

interface HierarchyNode {
    employee: Employee;
    level: number;
    isExpanded?: boolean;
    isHighlighted?: boolean;
}

const EmployeeHierarchyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [hierarchyNodes, setHierarchyNodes] = useState<HierarchyNode[]>([]);
    const [supervisorChain, setSupervisorChain] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [expandAll, setExpandAll] = useState(false);

    // Fetch employee details and build hierarchy
    useEffect(() => {
        const fetchHierarchyData = async () => {
            if (id && !isNaN(Number(id))) {
                setIsLoading(true);
                setError(null);
                try {
                    // Fetch the employee details
                    const employeeDetails = await employeeService.getEmployeeWithDetails(Number(id));
                    setEmployee(employeeDetails);
                    
                    // Fetch supervisor chain
                    await fetchSupervisorChain(employeeDetails);
                    
                    // Fetch subordinates
                    await fetchSubordinates(employeeDetails);
                    
                } catch (error) {
                    console.error('Failed to fetch employee hierarchy:', error);
                    setError('Failed to fetch employee hierarchy data. The employee might have been deleted or you do not have access.');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchHierarchyData();
    }, [id]);

    // Fetch supervisor chain recursively
    const fetchSupervisorChain = async (employee: Employee) => {
        if (!employee.employee_supervisor_id) {
            setSupervisorChain([]);
            return;
        }

        const chain: Employee[] = [];
        let currentSupervisorId = employee.employee_supervisor_id;
        
        try {
            while (currentSupervisorId) {
                const supervisor = await employeeService.getEmployeeById(currentSupervisorId);
                chain.push(supervisor);
                currentSupervisorId = supervisor.employee_supervisor_id || 0;
            }
            
            // Reverse to get top-down order
            setSupervisorChain(chain.reverse());
        } catch (error) {
            console.error('Error fetching supervisor chain:', error);
            setSupervisorChain([]);
        }
    };

    // Fetch subordinates and build hierarchy tree
    const fetchSubordinates = async (employee: Employee) => {
        try {
            const employeeWithSubs = await employeeService.getEmployeeWithSubordinates(employee.employee_id);
            
            // Initialize hierarchy with current employee
            const hierarchy: HierarchyNode[] = [
                { 
                    employee: employee, 
                    level: 0, 
                    isExpanded: true,
                    isHighlighted: true 
                }
            ];
            
            // Add subordinates recursively with initial depth of 1
            if (employeeWithSubs.subordinates && employeeWithSubs.subordinates.length > 0) {
                await addSubordinatesToHierarchy(employeeWithSubs.subordinates, hierarchy, 1, true);
            }
            
            setHierarchyNodes(hierarchy);
        } catch (error) {
            console.error('Error building hierarchy:', error);
            setHierarchyNodes([{ employee: employee, level: 0, isHighlighted: true }]);
        }
    };

    // Recursively add subordinates to hierarchy
    const addSubordinatesToHierarchy = async (
        subordinates: Employee[], 
        hierarchy: HierarchyNode[], 
        level: number,
        expanded: boolean
    ) => {
        for (const subordinate of subordinates) {
            // Add the subordinate to the hierarchy
            hierarchy.push({ 
                employee: subordinate, 
                level: level,
                isExpanded: expanded 
            });
            
            // Fetch this subordinate's subordinates
            try {
                const employeeWithSubs = await employeeService.getEmployeeWithSubordinates(subordinate.employee_id);
                if (employeeWithSubs.subordinates && employeeWithSubs.subordinates.length > 0) {
                    // Add next level of subordinates (not expanded by default)
                    await addSubordinatesToHierarchy(
                        employeeWithSubs.subordinates, 
                        hierarchy, 
                        level + 1,
                        false
                    );
                }
            } catch (error) {
                console.error(`Error fetching subordinates for employee ${subordinate.employee_id}:`, error);
            }
        }
    };

    // Toggle a node's expanded state
    const toggleNode = (index: number) => {
        // Find the node to toggle
        const node = hierarchyNodes[index];
        if (!node) return;
        
        // Find all direct children of this node
        const nodeLevel = node.level;
        let i = index + 1;
        
        // Create a new hierarchy array
        const newHierarchy = [...hierarchyNodes];
        
        // Toggle this node's expanded state
        newHierarchy[index] = { ...node, isExpanded: !node.isExpanded };
        
        // Toggle visibility of all direct and indirect children
        while (i < newHierarchy.length && newHierarchy[i].level > nodeLevel) {
            if (newHierarchy[i].level === nodeLevel + 1) {
                // Direct children - toggle visibility
                newHierarchy[i] = { 
                    ...newHierarchy[i], 
                    isExpanded: newHierarchy[i].isExpanded && !node.isExpanded 
                };
            }
            i++;
        }
        
        setHierarchyNodes(newHierarchy);
    };

    // Toggle expand/collapse all nodes
    const toggleExpandAll = () => {
        const newExpanded = !expandAll;
        setExpandAll(newExpanded);
        
        const newHierarchy = hierarchyNodes.map(node => ({
            ...node,
            isExpanded: newExpanded
        }));
        
        setHierarchyNodes(newHierarchy);
    };

    // Filter hierarchy by search term
    const filteredHierarchy = searchTerm 
        ? hierarchyNodes.filter(node => 
            node.employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.employee.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (node.employee.employee_position && 
             node.employee.employee_position.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : hierarchyNodes;

    // Determine if a node should be visible in the hierarchy
    const isNodeVisible = (index: number, nodes: HierarchyNode[]): boolean => {
        // If searching, all matched nodes are visible
        if (searchTerm) return true;
        
        const node = nodes[index];
        
        // Root node is always visible
        if (node.level === 0) return true;
        
        // Check if all parent nodes are expanded
        let currentLevel = node.level;
        let i = index - 1;
        
        while (i >= 0) {
            if (nodes[i].level < currentLevel) {
                // Found a parent
                if (!nodes[i].isExpanded) {
                    return false;
                }
                currentLevel = nodes[i].level;
            }
            i--;
        }
        
        return true;
    };

    // Navigate to employee details
    const viewEmployeeDetails = (employeeId: number) => {
        navigate(`/performance-management/employees/${employeeId}/details`);
    };

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

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        {/* <Breadcrumb
                            items={[{ name: 'Employees', href: '/performance-management/employees' }]}
                            currentPage="Employee Hierarchy"
                            showHomeIcon={true}
                        /> */}

                        {error ? (
                            <Alert variant="destructive" className="mt-8">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <p>Loading employee hierarchy...</p>
                            </div>
                        ) : employee ? (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8">
                                    <div className="flex items-center">
                                        <Users className="h-8 w-8 mr-3 text-[#1B6131] dark:text-[#46B749]" />
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {employee.employee_name} - Hierarchy View
                                            </h1>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {employee.employee_number} · {employee.employee_position || 'No Position'} · {employee.org_unit_name || 'No Department'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            className="border-[#1B6131] text-[#1B6131] hover:bg-[#f0f9f0] dark:border-[#46B749] dark:text-[#46B749] dark:hover:bg-[#0a2e14]"
                                            onClick={() => navigate(-1)}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-[#1B6131] text-[#1B6131] hover:bg-[#f0f9f0] dark:border-[#46B749] dark:text-[#46B749] dark:hover:bg-[#0a2e14]"
                                            onClick={() => navigate(`/performance-management/employees/${employee.employee_id}/details`)}
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>

                                {/* Supervisor Chain */}
                                {supervisorChain.length > 0 && (
                                    <Card className="mt-6 border-[#46B749] dark:border-[#1B6131] shadow-md">
                                        <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                            <CardTitle className="text-gray-700 dark:text-gray-200 flex items-center">
                                                <ArrowUpRight className="h-5 w-5 mr-2" />
                                                Supervisor Chain
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                {supervisorChain.map((supervisor, index) => (
                                                    <div 
                                                        key={supervisor.employee_id}
                                                        className="flex items-center pl-6 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                        style={{ marginLeft: `${index * 24}px` }}
                                                    >
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e6f3e6] dark:bg-[#0a3419] flex items-center justify-center">
                                                            <User className="h-6 w-6 text-[#1B6131] dark:text-[#46B749]" />
                                                        </div>
                                                        <div className="ml-4 flex-grow">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {supervisor.employee_name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {supervisor.employee_position || 'No Position'} · {supervisor.org_unit_name || 'No Department'}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-[#1B6131] hover:text-[#144d27] dark:text-[#46B749] dark:hover:text-[#3da33f]"
                                                            onClick={() => viewEmployeeDetails(supervisor.employee_id)}
                                                        >
                                                            View <ChevronRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                
                                                {/* Current employee in supervisor chain */}
                                                <div className="flex items-center pl-6 py-2 rounded-md bg-[#f0f9f0] dark:bg-[#0a2e14] transition-colors"
                                                    style={{ marginLeft: `${supervisorChain.length * 24}px` }}
                                                >
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1B6131] dark:bg-[#46B749] flex items-center justify-center">
                                                        <User className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div className="ml-4 flex-grow">
                                                        <p className="font-bold text-gray-900 dark:text-white">
                                                            {employee.employee_name} (Current)
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {employee.employee_position || 'No Position'} · {employee.org_unit_name || 'No Department'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-[#1B6131] hover:text-[#144d27] dark:text-[#46B749] dark:hover:text-[#3da33f]"
                                                        onClick={() => viewEmployeeDetails(employee.employee_id)}
                                                    >
                                                        View <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Subordinates Hierarchy */}
                                <Card className="mt-6 border-[#46B749] dark:border-[#1B6131] shadow-md">
                                    <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-gray-700 dark:text-gray-200 flex items-center">
                                                <ArrowDownRight className="h-5 w-5 mr-2" />
                                                Organization Hierarchy
                                            </CardTitle>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={toggleExpandAll}
                                                    className="border-[#1B6131] text-[#1B6131] hover:bg-[#f0f9f0] dark:border-[#46B749] dark:text-[#46B749] dark:hover:bg-[#0a2e14]"
                                                >
                                                    {expandAll ? (
                                                        <>
                                                            <ChevronUp className="h-4 w-4 mr-1" />
                                                            Collapse All
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-4 w-4 mr-1" />
                                                            Expand All
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="mb-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Search employees..."
                                                    className="pl-10"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            {filteredHierarchy.length > 0 ? (
                                                filteredHierarchy.map((node, index) => (
                                                    isNodeVisible(index, filteredHierarchy) && (
                                                        <div 
                                                            key={`${node.employee.employee_id}-${index}`}
                                                            className={`flex items-center py-2 pl-2 rounded-md 
                                                                ${node.isHighlighted ? 'bg-[#f0f9f0] dark:bg-[#0a2e14]' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} 
                                                                transition-colors`}
                                                            style={{ paddingLeft: `${(node.level * 24) + 8}px` }}
                                                        >
                                                            {/* Toggle expand/collapse button */}
                                                            <div className="w-6">
                                                                {node.employee.employee_id !== employee.employee_id && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0"
                                                                        onClick={() => toggleNode(index)}
                                                                    >
                                                                        {node.isExpanded ? (
                                                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                                                        ) : (
                                                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e6f3e6] dark:bg-[#0a3419] flex items-center justify-center ml-2">
                                                                <User className={`h-6 w-6 ${node.isHighlighted ? 'text-[#1B6131] dark:text-[#46B749]' : 'text-gray-600 dark:text-gray-300'}`} />
                                                            </div>
                                                            
                                                            <div className="ml-4 flex-grow">
                                                                <p className={`font-medium text-gray-900 dark:text-white ${node.isHighlighted ? 'font-bold' : ''}`}>
                                                                    {node.employee.employee_name} {node.isHighlighted ? '(Current)' : ''}
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {node.employee.employee_position || 'No Position'} · {node.employee.org_unit_name || 'No Department'}
                                                                </p>
                                                            </div>
                                                            
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-[#1B6131] hover:text-[#144d27] dark:text-[#46B749] dark:hover:text-[#3da33f]"
                                                                onClick={() => viewEmployeeDetails(node.employee.employee_id)}
                                                            >
                                                                View <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </div>
                                                    )
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500 dark:text-gray-400">No employees found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <div className="flex justify-center items-center h-64">
                                <p>Employee not found</p>
                            </div>
                        )}
                    </main>
                    
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default EmployeeHierarchyPage;