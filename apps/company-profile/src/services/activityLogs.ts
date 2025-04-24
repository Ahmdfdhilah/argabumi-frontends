// src/services/activityLogService.ts
import cpApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export enum ActivityType {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    VIEW = "VIEW",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    EXPORT = "EXPORT",
    IMPORT = "IMPORT",
    APPROVE = "APPROVE",
    REJECT = "REJECT",
    OTHER = "OTHER"
}

export interface ActivityLogBase {
    activity_type: ActivityType;
    activity_table_code: string;
    activity_record_id: number;
    activity_description: string;
    activity_ip_address?: string;
    activity_user_agent?: string;
}

export interface ActivityLogCreate extends ActivityLogBase {
    activity_user_id?: number;
}

export interface ActivityLogResponse extends ActivityLogBase {
    activity_id: number;
    activity_user_id?: number;
    activity_timestamp: string; // ISO timestamp
}

export interface ActivityLogListResponse {
    items: ActivityLogResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface ActivityLogStatisticsResponse {
    total_activities: number;
    activities_by_type: Record<string, number>;
    activities_by_user: Record<string, number>;
    activities_by_table: Record<string, number>;
    recent_activities: Array<{
        user: any;
        id: number;
        user_id?: number;
        type: string;
        table: string;
        description: string;
        timestamp: string;
    }>;
}

export interface StatusMessage {
    status: string;
    message: string;
}

const { toast } = useToast();

export const activityLogService = {
    // Get recent activity logs (admin only)
    getRecentLogs: async (limit: number = 50): Promise<ActivityLogResponse[]> => {
        try {
            const response = await cpApi.get("/activity-logs/", {
                params: { limit }
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch activity logs",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Get activity statistics (admin only)
    getActivityStatistics: async (): Promise<ActivityLogStatisticsResponse> => {
        try {
            const response = await cpApi.get("/activity-logs/statistics");
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch activity statistics",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Get a specific activity log by ID (admin only)
    getLogById: async (logId: number): Promise<ActivityLogResponse> => {
        try {
            const response = await cpApi.get(`/activity-logs/${logId}`);
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch activity log",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Get activity logs for a specific user (admin only)
    getLogsByUser: async (userId: number, limit: number = 50): Promise<ActivityLogResponse[]> => {
        try {
            const response = await cpApi.get(`/activity-logs/by-user/${userId}`, {
                params: { limit }
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch user activity logs",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Get activity logs for a specific table (admin only)
    getLogsByTable: async (tableCode: string, limit: number = 50): Promise<ActivityLogResponse[]> => {
        try {
            const response = await cpApi.get(`/activity-logs/by-table/${tableCode}`, {
                params: { limit }
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch table activity logs",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Get activity logs for a specific record (admin only)
    getLogsByRecord: async (tableCode: string, recordId: number): Promise<ActivityLogResponse[]> => {
        try {
            const response = await cpApi.get(`/activity-logs/by-record/${tableCode}/${recordId}`);
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch record activity logs",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Create a new activity log entry
    createLog: async (logData: ActivityLogCreate): Promise<ActivityLogResponse> => {
        try {
            const response = await cpApi.post("/activity-logs/", logData);
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create activity log",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Helper function to log activities without needing to manually construct the full payload
    logActivity: async (
        activityType: ActivityType,
        tableCode: string,
        recordId: number,
        description: string,
        userId?: number
    ): Promise<ActivityLogResponse> => {
        try {
            const logData: ActivityLogCreate = {
                activity_type: activityType,
                activity_table_code: tableCode,
                activity_record_id: recordId,
                activity_description: description,
                activity_user_id: userId
            };

            return await activityLogService.createLog(logData);
        } catch (error) {
            console.error("Failed to log activity:", error);
            throw error;
        }
    }
}

export default activityLogService;