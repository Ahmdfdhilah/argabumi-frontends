// src/services/employeeService.ts
import pmApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface EmployeeBase {
  employee_number: string;
  employee_name: string;
  employee_org_unit_id?: number | null;
  employee_email?: string | null;
  employee_phone?: string | null;
  employee_position?: string | null;
  employee_supervisor_id?: number | null;
  employee_metadata?: Record<string, any> | null;
  is_active: boolean;
}

export interface Employee extends EmployeeBase {
  employee_id: number;
  org_unit_name?: string | null;
  supervisor_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeWithSubordinates extends Employee {
  subordinates: Employee[];
}

export interface KPIDefinition {
  kpi_id: number;
  kpi_title: string;
  kpi_description?: string | null;
  kpi_target?: number | null;
  kpi_weight?: number | null;
}

export interface EmployeeWithKPIs extends Employee {
  individual_kpis: KPIDefinition[];
  owned_kpis: KPIDefinition[];
}

export interface Submission {
  submission_id: number;
  submission_title: string;
  submission_status: string;
  submission_date: string;
}

export interface EmployeeWithSubmissions extends Employee {
  submissions: Submission[];
}

export interface CreateEmployeeData {
  employee_number: string;
  employee_name: string;
  employee_org_unit_id?: number;
  employee_email?: string;
  employee_phone?: string;
  employee_position?: string;
  employee_supervisor_id?: number;
  employee_metadata?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateEmployeeData {
  employee_number?: string;
  employee_name?: string;
  employee_org_unit_id?: number;
  employee_email?: string;
  employee_phone?: string;
  employee_position?: string;
  employee_supervisor_id?: number;
  employee_metadata?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateSupervisorRequest {
  new_supervisor_id?: number | null;
}

const { toast } = useToast();

export const employeeService = {
  // Get all employees with pagination
  getEmployees: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<Employee[]> => {
    try {
      const response = await pmApi.get("/employees/", {
        params: { skip, limit },
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employees",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Search employees by term
  searchEmployees: async (term: string, limit: number = 10): Promise<Employee[]> => {
    try {
      const response = await pmApi.get(`/employees/search/${term}`, {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to search employees",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new employee
  createEmployee: async (employeeData: CreateEmployeeData): Promise<Employee> => {
    try {
      const response = await pmApi.post("/employees/", employeeData);
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create employee",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get employee by ID
  getEmployeeById: async (employeeId: number): Promise<Employee> => {
    try {
      const response = await pmApi.get(`/employees/${employeeId}`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employee",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get employee with details (organization unit and supervisor)
  getEmployeeWithDetails: async (employeeId: number): Promise<Employee> => {
    try {
      const response = await pmApi.get(`/employees/${employeeId}/details`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employee details",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get employee with subordinates
  getEmployeeWithSubordinates: async (employeeId: number): Promise<EmployeeWithSubordinates> => {
    try {
      const response = await pmApi.get(`/employees/${employeeId}/subordinates`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employee subordinates",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get employee KPIs
  getEmployeeKPIs: async (employeeId: number): Promise<EmployeeWithKPIs> => {
    try {
      const response = await pmApi.get(`/employees/${employeeId}/kpis`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employee KPIs",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get employee submissions
  getEmployeeSubmissions: async (employeeId: number): Promise<EmployeeWithSubmissions> => {
    try {
      const response = await pmApi.get(`/employees/${employeeId}/submissions`);
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employee submissions",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (
    employeeId: number,
    employeeData: UpdateEmployeeData
  ): Promise<Employee> => {
    try {
      const response = await pmApi.put(`/employees/${employeeId}`, employeeData);
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update employee",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update employee supervisor
  updateEmployeeSupervisor: async (
    employeeId: number,
    supervisorData: UpdateSupervisorRequest
  ): Promise<Employee> => {
    try {
      const response = await pmApi.put(
        `/employees/${employeeId}/supervisor`,
        supervisorData
      );
      toast({
        title: "Success",
        description: "Employee supervisor updated successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update employee supervisor",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete employee
  deleteEmployee: async (employeeId: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await pmApi.delete(`/employees/${employeeId}`);
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete employee",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get employees by organization unit
  getEmployeesByOrganizationUnit: async (
    orgUnitId: number,
    skip: number = 0,
    limit: number = 100
  ): Promise<Employee[]> => {
    try {
      const response = await pmApi.get(`/employees/organization-unit/${orgUnitId}`, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employees by organization unit",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get employees by supervisor
  getEmployeesBySupervisor: async (
    supervisorId: number,
    skip: number = 0,
    limit: number = 100
  ): Promise<Employee[]> => {
    try {
      const response = await pmApi.get(`/employees/supervisor/${supervisorId}`, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch employees by supervisor",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default employeeService;