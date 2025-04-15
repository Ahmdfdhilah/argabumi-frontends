export type StatusType = 'On Track' | 'At Risk' | 'Behind';

interface DepartmentPerformance {
    department: string;
    score: number;
    lastPeriod?: number;
    status: StatusType;
}

interface IndividualPerformer {
    name: string;
    department: string;
    score: number;
    lastPeriod?: number;
    change: number;
}

interface DashboardMocks {
    availablePeriods: string[];
    availableYears: string[];
    departmentPerformanceByMonth: Record<string, DepartmentPerformance[]>;
    individualPerformersByMonth: Record<string, IndividualPerformer[]>;
}

// Mock data for department performance by month
export const departmentPerformanceByMonth: Record<string, DepartmentPerformance[]> = {
    'January': [
        { department: 'Finance', score: 91.4, lastPeriod: 88.5, status: 'On Track' },
        { department: 'Marketing', score: 85.7, lastPeriod: 87.2, status: 'At Risk' },
        { department: 'Operations', score: 78.9, lastPeriod: 75.4, status: 'On Track' },
        { department: 'HR', score: 82.3, lastPeriod: 84.1, status: 'At Risk' },
        { department: 'IT', score: 88.6, lastPeriod: 81.9, status: 'On Track' },
        { department: 'Sales', score: 76.2, lastPeriod: 79.5, status: 'Behind' },
    ],
    'February': [
        { department: 'Finance', score: 92.1, lastPeriod: 91.4, status: 'On Track' },
        { department: 'Marketing', score: 84.3, lastPeriod: 85.7, status: 'At Risk' },
        { department: 'Operations', score: 80.2, lastPeriod: 78.9, status: 'On Track' },
        { department: 'HR', score: 83.7, lastPeriod: 82.3, status: 'On Track' },
        { department: 'IT', score: 89.4, lastPeriod: 88.6, status: 'On Track' },
        { department: 'Sales', score: 78.5, lastPeriod: 76.2, status: 'At Risk' },
    ],
    'March': [
        { department: 'Finance', score: 93.5, lastPeriod: 92.1, status: 'On Track' },
        { department: 'Marketing', score: 86.8, lastPeriod: 84.3, status: 'On Track' },
        { department: 'Operations', score: 81.7, lastPeriod: 80.2, status: 'On Track' },
        { department: 'HR', score: 82.9, lastPeriod: 83.7, status: 'At Risk' },
        { department: 'IT', score: 90.2, lastPeriod: 89.4, status: 'On Track' },
        { department: 'Sales', score: 80.1, lastPeriod: 78.5, status: 'On Track' },
    ],
    'April': [
        { department: 'Finance', score: 94.0, lastPeriod: 93.5, status: 'On Track' },
        { department: 'Marketing', score: 87.5, lastPeriod: 86.8, status: 'On Track' },
        { department: 'Operations', score: 82.4, lastPeriod: 81.7, status: 'On Track' },
        { department: 'HR', score: 83.2, lastPeriod: 82.9, status: 'On Track' },
        { department: 'IT', score: 91.0, lastPeriod: 90.2, status: 'On Track' },
        { department: 'Sales', score: 81.6, lastPeriod: 80.1, status: 'On Track' },
    ],
    'May': [
        { department: 'Finance', score: 94.5, lastPeriod: 94.0, status: 'On Track' },
        { department: 'Marketing', score: 88.1, lastPeriod: 87.5, status: 'On Track' },
        { department: 'Operations', score: 83.0, lastPeriod: 82.4, status: 'On Track' },
        { department: 'HR', score: 83.8, lastPeriod: 83.2, status: 'On Track' },
        { department: 'IT', score: 91.7, lastPeriod: 91.0, status: 'On Track' },
        { department: 'Sales', score: 82.9, lastPeriod: 81.6, status: 'On Track' },
    ],
    'June': [
        { department: 'Finance', score: 95.2, lastPeriod: 94.5, status: 'On Track' },
        { department: 'Marketing', score: 88.7, lastPeriod: 88.1, status: 'On Track' },
        { department: 'Operations', score: 83.8, lastPeriod: 83.0, status: 'On Track' },
        { department: 'HR', score: 84.3, lastPeriod: 83.8, status: 'On Track' },
        { department: 'IT', score: 92.3, lastPeriod: 91.7, status: 'On Track' },
        { department: 'Sales', score: 83.5, lastPeriod: 82.9, status: 'On Track' },
    ],
    'July': [
        { department: 'Finance', score: 95.8, lastPeriod: 95.2, status: 'On Track' },
        { department: 'Marketing', score: 89.3, lastPeriod: 88.7, status: 'On Track' },
        { department: 'Operations', score: 84.5, lastPeriod: 83.8, status: 'On Track' },
        { department: 'HR', score: 84.9, lastPeriod: 84.3, status: 'On Track' },
        { department: 'IT', score: 92.9, lastPeriod: 92.3, status: 'On Track' },
        { department: 'Sales', score: 84.2, lastPeriod: 83.5, status: 'On Track' },
    ],
    'August': [
        { department: 'Finance', score: 96.2, lastPeriod: 95.8, status: 'On Track' },
        { department: 'Marketing', score: 89.8, lastPeriod: 89.3, status: 'On Track' },
        { department: 'Operations', score: 85.1, lastPeriod: 84.5, status: 'On Track' },
        { department: 'HR', score: 85.4, lastPeriod: 84.9, status: 'On Track' },
        { department: 'IT', score: 93.4, lastPeriod: 92.9, status: 'On Track' },
        { department: 'Sales', score: 84.8, lastPeriod: 84.2, status: 'On Track' },
    ],
    'September': [
        { department: 'Finance', score: 96.7, lastPeriod: 96.2, status: 'On Track' },
        { department: 'Marketing', score: 90.2, lastPeriod: 89.8, status: 'On Track' },
        { department: 'Operations', score: 85.6, lastPeriod: 85.1, status: 'On Track' },
        { department: 'HR', score: 85.9, lastPeriod: 85.4, status: 'On Track' },
        { department: 'IT', score: 93.9, lastPeriod: 93.4, status: 'On Track' },
        { department: 'Sales', score: 85.3, lastPeriod: 84.8, status: 'On Track' },
    ],
    'October': [
        { department: 'Finance', score: 97.1, lastPeriod: 96.7, status: 'On Track' },
        { department: 'Marketing', score: 90.6, lastPeriod: 90.2, status: 'On Track' },
        { department: 'Operations', score: 86.0, lastPeriod: 85.6, status: 'On Track' },
        { department: 'HR', score: 86.3, lastPeriod: 85.9, status: 'On Track' },
        { department: 'IT', score: 94.3, lastPeriod: 93.9, status: 'On Track' },
        { department: 'Sales', score: 85.8, lastPeriod: 85.3, status: 'On Track' },
    ],
    'November': [
        { department: 'Finance', score: 97.5, lastPeriod: 97.1, status: 'On Track' },
        { department: 'Marketing', score: 91.0, lastPeriod: 90.6, status: 'On Track' },
        { department: 'Operations', score: 86.4, lastPeriod: 86.0, status: 'On Track' },
        { department: 'HR', score: 86.7, lastPeriod: 86.3, status: 'On Track' },
        { department: 'IT', score: 94.7, lastPeriod: 94.3, status: 'On Track' },
        { department: 'Sales', score: 86.2, lastPeriod: 85.8, status: 'On Track' },
    ],
    'December': [
        { department: 'Finance', score: 98.0, lastPeriod: 97.5, status: 'On Track' },
        { department: 'Marketing', score: 91.5, lastPeriod: 91.0, status: 'On Track' },
        { department: 'Operations', score: 86.9, lastPeriod: 86.4, status: 'On Track' },
        { department: 'HR', score: 87.1, lastPeriod: 86.7, status: 'On Track' },
        { department: 'IT', score: 95.2, lastPeriod: 94.7, status: 'On Track' },
        { department: 'Sales', score: 86.7, lastPeriod: 86.2, status: 'On Track' },
    ],
};

// Mock data for individual performers by month
export const individualPerformersByMonth: Record<string, IndividualPerformer[]> = {
    'January': [
        { name: 'Sarah J.', department: 'Finance', score: 96.4, change: 2.1 },
        { name: 'Michael T.', department: 'IT', score: 94.8, change: 1.5 },
        { name: 'Lisa R.', department: 'Marketing', score: 93.2, change: 3.2 },
        { name: 'Robert K.', department: 'Operations', score: 92.7, change: -0.5 },
        { name: 'Amanda P.', department: 'HR', score: 91.5, change: 1.2 },
    ],
    'February': [
        { name: 'Sarah J.', department: 'Finance', score: 97.1, lastPeriod: 96.4, change: 0.7 },
        { name: 'Michael T.', department: 'IT', score: 95.3, lastPeriod: 94.8, change: 0.5 },
        { name: 'Lisa R.', department: 'Marketing', score: 94.0, lastPeriod: 93.2, change: 0.8 },
        { name: 'Robert K.', department: 'Operations', score: 93.2, lastPeriod: 92.7, change: 0.5 },
        { name: 'Amanda P.', department: 'HR', score: 92.1, lastPeriod: 91.5, change: 0.6 },
    ],
    'March': [
        { name: 'Sarah J.', department: 'Finance', score: 97.8, lastPeriod: 97.1, change: 0.7 },
        { name: 'Michael T.', department: 'IT', score: 96.0, lastPeriod: 95.3, change: 0.7 },
        { name: 'Lisa R.', department: 'Marketing', score: 94.9, lastPeriod: 94.0, change: 0.9 },
        { name: 'Robert K.', department: 'Operations', score: 93.8, lastPeriod: 93.2, change: 0.6 },
        { name: 'Amanda P.', department: 'HR', score: 92.7, lastPeriod: 92.1, change: 0.6 },
    ],
    'April': [
        { name: 'Sarah J.', department: 'Finance', score: 98.2, lastPeriod: 97.8, change: 0.4 },
        { name: 'Michael T.', department: 'IT', score: 96.5, lastPeriod: 96.0, change: 0.5 },
        { name: 'Lisa R.', department: 'Marketing', score: 95.5, lastPeriod: 94.9, change: 0.6 },
        { name: 'Robert K.', department: 'Operations', score: 94.3, lastPeriod: 93.8, change: 0.5 },
        { name: 'Amanda P.', department: 'HR', score: 93.2, lastPeriod: 92.7, change: 0.5 },
    ],
    'May': [
        { name: 'Sarah J.', department: 'Finance', score: 98.5, lastPeriod: 98.2, change: 0.3 },
        { name: 'Michael T.', department: 'IT', score: 96.9, lastPeriod: 96.5, change: 0.4 },
        { name: 'Lisa R.', department: 'Marketing', score: 96.0, lastPeriod: 95.5, change: 0.5 },
        { name: 'Robert K.', department: 'Operations', score: 94.8, lastPeriod: 94.3, change: 0.5 },
        { name: 'Amanda P.', department: 'HR', score: 93.7, lastPeriod: 93.2, change: 0.5 },
    ],
    'June': [
        { name: 'Sarah J.', department: 'Finance', score: 98.8, lastPeriod: 98.5, change: 0.3 },
        { name: 'Michael T.', department: 'IT', score: 97.2, lastPeriod: 96.9, change: 0.3 },
        { name: 'Lisa R.', department: 'Marketing', score: 96.4, lastPeriod: 96.0, change: 0.4 },
        { name: 'Robert K.', department: 'Operations', score: 95.2, lastPeriod: 94.8, change: 0.4 },
        { name: 'Amanda P.', department: 'HR', score: 94.1, lastPeriod: 93.7, change: 0.4 },
    ],
    'July': [
        { name: 'Sarah J.', department: 'Finance', score: 99.0, lastPeriod: 98.8, change: 0.2 },
        { name: 'Michael T.', department: 'IT', score: 97.5, lastPeriod: 97.2, change: 0.3 },
        { name: 'Lisa R.', department: 'Marketing', score: 96.7, lastPeriod: 96.4, change: 0.3 },
        { name: 'Robert K.', department: 'Operations', score: 95.5, lastPeriod: 95.2, change: 0.3 },
        { name: 'Amanda P.', department: 'HR', score: 94.5, lastPeriod: 94.1, change: 0.4 },
    ],
    'August': [
        { name: 'Sarah J.', department: 'Finance', score: 99.2, lastPeriod: 99.0, change: 0.2 },
        { name: 'Michael T.', department: 'IT', score: 97.7, lastPeriod: 97.5, change: 0.2 },
        { name: 'Lisa R.', department: 'Marketing', score: 97.0, lastPeriod: 96.7, change: 0.3 },
        { name: 'Robert K.', department: 'Operations', score: 95.8, lastPeriod: 95.5, change: 0.3 },
        { name: 'Amanda P.', department: 'HR', score: 94.8, lastPeriod: 94.5, change: 0.3 },
    ],
    'September': [
        { name: 'Sarah J.', department: 'Finance', score: 99.4, lastPeriod: 99.2, change: 0.2 },
        { name: 'Michael T.', department: 'IT', score: 97.9, lastPeriod: 97.7, change: 0.2 },
        { name: 'Lisa R.', department: 'Marketing', score: 97.2, lastPeriod: 97.0, change: 0.2 },
        { name: 'Robert K.', department: 'Operations', score: 96.0, lastPeriod: 95.8, change: 0.2 },
        { name: 'Amanda P.', department: 'HR', score: 95.1, lastPeriod: 94.8, change: 0.3 },
    ],
    'October': [
        { name: 'Sarah J.', department: 'Finance', score: 99.5, lastPeriod: 99.4, change: 0.1 },
        { name: 'Michael T.', department: 'IT', score: 98.1, lastPeriod: 97.9, change: 0.2 },
        { name: 'Lisa R.', department: 'Marketing', score: 97.4, lastPeriod: 97.2, change: 0.2 },
        { name: 'Robert K.', department: 'Operations', score: 96.2, lastPeriod: 96.0, change: 0.2 },
        { name: 'Amanda P.', department: 'HR', score: 95.3, lastPeriod: 95.1, change: 0.2 },
    ],
    'November': [
        { name: 'Sarah J.', department: 'Finance', score: 99.6, lastPeriod: 99.5, change: 0.1 },
        { name: 'Michael T.', department: 'IT', score: 98.2, lastPeriod: 98.1, change: 0.1 },
        { name: 'Lisa R.', department: 'Marketing', score: 97.6, lastPeriod: 97.4, change: 0.2 },
        { name: 'Robert K.', department: 'Operations', score: 96.4, lastPeriod: 96.2, change: 0.2 },
        { name: 'Amanda P.', department: 'HR', score: 95.5, lastPeriod: 95.3, change: 0.2 },
    ],
    'December': [
        { name: 'Sarah J.', department: 'Finance', score: 99.7, lastPeriod: 99.6, change: 0.1 },
        { name: 'Michael T.', department: 'IT', score: 98.3, lastPeriod: 98.2, change: 0.1 },
        { name: 'Lisa R.', department: 'Marketing', score: 97.8, lastPeriod: 97.6, change: 0.2 },
        { name: 'Robert K.', department: 'Operations', score: 96.6, lastPeriod: 96.4, change: 0.2 },
        { name: 'Amanda P.', department: 'HR', score: 95.7, lastPeriod: 95.5, change: 0.2 },
    ],
};

export const availablePeriods: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const availableYears: string[] = ['2023', '2024', '2025'];

// Export the complete mock data object
export const dashboardMocks: DashboardMocks = {
    availablePeriods,
    availableYears,
    departmentPerformanceByMonth,
    individualPerformersByMonth
};