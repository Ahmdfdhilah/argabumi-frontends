// Types
type UOMType = 'Number' | '%' | 'Days' | 'Kriteria' | 'Number (Ton)';
type Category = 'Max' | 'Min' | 'On Target';
type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
type Perspective = 'Financial' | 'Customer' | 'Internal Process' | 'Learning and Growth';

type MPMEntry = {
    id: number;
    perspective: Perspective;
    kpi: string;
    kpiDefinition: string;
    weight: number;
    uom: UOMType;
    category: Category;
    ytdCalculation: YTDCalculation;
    targets: Record<string, number>;
    actuals: Record<string, number>;
    achievements: Record<string, number>;
    problemIdentification?: string;
    correctiveAction?: string;
};


export const mpmDataMock = <MPMEntry[]>([
    // Financial Perspective
    {
        id: 1,
        perspective: 'Financial',
        kpi: 'Revenue Growth',
        kpiDefinition: 'Percentage increase in total revenue compared to previous period',
        weight: 25,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Accumulative',
        targets: {
            'Jan-25': 8, 'Feb-25': 8.5, 'Mar-25': 9, 'Apr-25': 9.5, 'May-25': 10, 'Jun-25': 10.5,
            'Jul-25': 11, 'Aug-25': 11.5, 'Sep-25': 12, 'Oct-25': 12.5, 'Nov-25': 13, 'Dec-25': 13.5,
            'Q1-25': 8.5, 'Q2-25': 10, 'Q3-25': 11.5, 'Q4-25': 13,
            '2025': 12
        },
        actuals: {
            'Jan-25': 7.8, 'Feb-25': 8.3, 'Mar-25': 8.7, 'Apr-25': 9.2, 'May-25': 9.6, 'Jun-25': 10.1,
            'Jul-25': 10.5, 'Aug-25': 11, 'Sep-25': 11.4, 'Oct-25': 11.9, 'Nov-25': 12.3, 'Dec-25': 12.8,
            'Q1-25': 8.3, 'Q2-25': 9.6, 'Q3-25': 11, 'Q4-25': 12.3,
            '2025': 11.8
        },
        achievements: {
            'Jan-25': 102.5, 'Feb-25': 97.6, 'Mar-25': 96.7, 'Apr-25': 96.8, 'May-25': 96.0, 'Jun-25': 96.2,
            'Jul-25': 95.5, 'Aug-25': 95.7, 'Sep-25': 95.0, 'Oct-25': 95.2, 'Nov-25': 94.6, 'Dec-25': 94.8,
            'Q1-25': 97.3, 'Q2-25': 96.0, 'Q3-25': 95.7, 'Q4-25': 94.6,
            '2025': 95.8
        },
        problemIdentification: 'Q4 growth slowed due to seasonal factors and increased competition',
        correctiveAction: 'Develop targeted holiday promotions and loyalty programs',
    },
    {
        id: 2,
        perspective: 'Financial',
        kpi: 'Operating Profit Margin',
        kpiDefinition: 'Operating profit as a percentage of revenue',
        weight: 20,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Average',
        targets: {
            'Jan-25': 15, 'Feb-25': 15.5, 'Mar-25': 16, 'Apr-25': 16.5, 'May-25': 17, 'Jun-25': 17.5,
            'Jul-25': 18, 'Aug-25': 18.5, 'Sep-25': 19, 'Oct-25': 19.5, 'Nov-25': 20, 'Dec-25': 20.5,
            'Q1-25': 15.5, 'Q2-25': 17, 'Q3-25': 18.5, 'Q4-25': 20,
            '2025': 18
        },
        actuals: {
            'Jan-25': 14.8, 'Feb-25': 15.3, 'Mar-25': 15.7, 'Apr-25': 16.2, 'May-25': 16.6, 'Jun-25': 17.1,
            'Jul-25': 17.5, 'Aug-25': 18, 'Sep-25': 18.4, 'Oct-25': 18.9, 'Nov-25': 19.3, 'Dec-25': 19.8,
            'Q1-25': 15.3, 'Q2-25': 16.6, 'Q3-25': 18, 'Q4-25': 19.3,
            '2025': 17.8
        },
        achievements: {
            'Jan-25': 8.7, 'Feb-25': 98.7, 'Mar-25': 98.1, 'Apr-25': 98.2, 'May-25': 97.6, 'Jun-25': 97.7,
            'Jul-25': 97.2, 'Aug-25': 97.3, 'Sep-25': 96.8, 'Oct-25': 96.9, 'Nov-25': 96.5, 'Dec-25': 96.6,
            'Q1-25': 98.5, 'Q2-25': 97.6, 'Q3-25': 97.3, 'Q4-25': 96.5,
            '2025': 7.2
        },
        problemIdentification: 'Rising raw material costs impacting margins in Q3-Q4',
        correctiveAction: 'Negotiate better supplier contracts and optimize production processes',
    },

    // Customer Perspective
    {
        id: 3,
        perspective: 'Customer',
        kpi: 'Customer Satisfaction Index',
        kpiDefinition: 'Average score from customer satisfaction surveys (scale 1-10)',
        weight: 15,
        uom: 'Number',
        category: 'Max',
        ytdCalculation: 'Average',
        targets: {
            'Jan-25': 8.5, 'Feb-25': 8.6, 'Mar-25': 8.7, 'Apr-25': 8.8, 'May-25': 8.9, 'Jun-25': 9.0,
            'Jul-25': 9.1, 'Aug-25': 9.2, 'Sep-25': 9.3, 'Oct-25': 9.4, 'Nov-25': 9.5, 'Dec-25': 9.6,
            'Q1-25': 8.6, 'Q2-25': 8.9, 'Q3-25': 9.2, 'Q4-25': 9.5,
            '2025': 9.2
        },
        actuals: {
            'Jan-25': 8.4, 'Feb-25': 8.5, 'Mar-25': 8.6, 'Apr-25': 8.7, 'May-25': 8.8, 'Jun-25': 8.9,
            'Jul-25': 9.0, 'Aug-25': 9.1, 'Sep-25': 9.2, 'Oct-25': 9.3, 'Nov-25': 9.4, 'Dec-25': 9.5,
            'Q1-25': 8.5, 'Q2-25': 8.8, 'Q3-25': 9.1, 'Q4-25': 9.4,
            '2025': 9.2
        },
        achievements: {
            'Jan-25': 98.8, 'Feb-25': 98.8, 'Mar-25': 98.9, 'Apr-25': 98.9, 'May-25': 98.9, 'Jun-25': 98.9,
            'Jul-25': 98.9, 'Aug-25': 98.9, 'Sep-25': 98.9, 'Oct-25': 98.9, 'Nov-25': 98.9, 'Dec-25': 99.0,
            'Q1-25': 98.8, 'Q2-25': 98.9, 'Q3-25': 98.9, 'Q4-25': 98.9,
            '2025': 98.9
        },
        problemIdentification: 'Slight dip in Q1 satisfaction due to delivery delays',
        correctiveAction: 'Improve logistics coordination and implement better tracking systems',
    },
    {
        id: 4,
        perspective: 'Customer',
        kpi: 'Net Promoter Score (NPS)',
        kpiDefinition: 'Percentage of promoters minus percentage of detractors',
        weight: 10,
        uom: 'Number',
        category: 'Max',
        ytdCalculation: 'Last Value',
        targets: {
            'Jan-25': 45, 'Feb-25': 46, 'Mar-25': 47, 'Apr-25': 48, 'May-25': 49, 'Jun-25': 50,
            'Jul-25': 51, 'Aug-25': 52, 'Sep-25': 53, 'Oct-25': 54, 'Nov-25': 55, 'Dec-25': 56,
            'Q1-25': 46, 'Q2-25': 49, 'Q3-25': 52, 'Q4-25': 55,
            '2025': 52
        },
        actuals: {
            'Jan-25': 44, 'Feb-25': 45, 'Mar-25': 46, 'Apr-25': 47, 'May-25': 48, 'Jun-25': 49,
            'Jul-25': 50, 'Aug-25': 51, 'Sep-25': 52, 'Oct-25': 53, 'Nov-25': 54, 'Dec-25': 55,
            'Q1-25': 45, 'Q2-25': 48, 'Q3-25': 51, 'Q4-25': 54,
            '2025': 51
        },
        achievements: {
            'Jan-25': 97.8, 'Feb-25': 97.8, 'Mar-25': 97.9, 'Apr-25': 97.9, 'May-25': 98.0, 'Jun-25': 98.0,
            'Jul-25': 98.0, 'Aug-25': 98.1, 'Sep-25': 98.1, 'Oct-25': 98.1, 'Nov-25': 98.2, 'Dec-25': 98.2,
            'Q1-25': 97.8, 'Q2-25': 98.0, 'Q3-25': 98.1, 'Q4-25': 98.2,
            '2025': 98.1
        },
        problemIdentification: 'Need to improve customer advocacy programs',
        correctiveAction: 'Implement referral bonus program and enhance customer community',
    },

    // Internal Process Perspective
    {
        id: 5,
        perspective: 'Internal Process',
        kpi: 'Production Efficiency',
        kpiDefinition: 'Ratio of actual output to standard output',
        weight: 15,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Average',
        targets: {
            'Jan-25': 92, 'Feb-25': 92.5, 'Mar-25': 93, 'Apr-25': 93.5, 'May-25': 94, 'Jun-25': 94.5,
            'Jul-25': 95, 'Aug-25': 95.5, 'Sep-25': 96, 'Oct-25': 96.5, 'Nov-25': 97, 'Dec-25': 97.5,
            'Q1-25': 92.5, 'Q2-25': 94, 'Q3-25': 95.5, 'Q4-25': 97,
            '2025': 95
        },
        actuals: {
            'Jan-25': 91.5, 'Feb-25': 92, 'Mar-25': 92.5, 'Apr-25': 93, 'May-25': 93.5, 'Jun-25': 94,
            'Jul-25': 94.5, 'Aug-25': 95, 'Sep-25': 95.5, 'Oct-25': 96, 'Nov-25': 96.5, 'Dec-25': 97,
            'Q1-25': 92, 'Q2-25': 93.5, 'Q3-25': 95, 'Q4-25': 96.5,
            '2025': 94.5
        },
        achievements: {
            'Jan-25': 99.5, 'Feb-25': 99.5, 'Mar-25': 99.5, 'Apr-25': 99.5, 'May-25': 99.5, 'Jun-25': 99.5,
            'Jul-25': 99.5, 'Aug-25': 99.5, 'Sep-25': 99.5, 'Oct-25': 99.5, 'Nov-25': 99.5, 'Dec-25': 99.5,
            'Q1-25': 99.5, 'Q2-25': 99.5, 'Q3-25': 99.5, 'Q4-25': 99.5,
            '2025': 99.5
        },
        problemIdentification: 'Equipment maintenance causing minor delays',
        correctiveAction: 'Implement predictive maintenance program',
        pic: 'Operations Team'
    },
    {
        id: 6,
        perspective: 'Internal Process',
        kpi: 'Order Fulfillment Cycle Time',
        kpiDefinition: 'Average time from order receipt to delivery (in days)',
        weight: 10,
        uom: 'Days',
        category: 'Min',
        ytdCalculation: 'Average',
        targets: {
            'Jan-25': 5, 'Feb-25': 4.9, 'Mar-25': 4.8, 'Apr-25': 4.7, 'May-25': 4.6, 'Jun-25': 4.5,
            'Jul-25': 4.4, 'Aug-25': 4.3, 'Sep-25': 4.2, 'Oct-25': 4.1, 'Nov-25': 4, 'Dec-25': 3.9,
            'Q1-25': 4.9, 'Q2-25': 4.6, 'Q3-25': 4.3, 'Q4-25': 4,
            '2025': 4.5
        },
        actuals: {
            'Jan-25': 5.1, 'Feb-25': 5, 'Mar-25': 4.9, 'Apr-25': 4.8, 'May-25': 4.7, 'Jun-25': 4.6,
            'Jul-25': 4.5, 'Aug-25': 4.4, 'Sep-25': 4.3, 'Oct-25': 4.2, 'Nov-25': 4.1, 'Dec-25': 4,
            'Q1-25': 5, 'Q2-25': 4.7, 'Q3-25': 4.4, 'Q4-25': 4.1,
            '2025': 4.6
        },
        achievements: {
            'Jan-25': 98.0, 'Feb-25': 98.0, 'Mar-25': 98.0, 'Apr-25': 98.0, 'May-25': 98.0, 'Jun-25': 98.0,
            'Jul-25': 98.0, 'Aug-25': 98.0, 'Sep-25': 98.0, 'Oct-25': 98.0, 'Nov-25': 98.0, 'Dec-25': 98.0,
            'Q1-25': 98.0, 'Q2-25': 98.0, 'Q3-25': 98.0, 'Q4-25': 98.0,
            '2025': 98.0
        },
        problemIdentification: 'Warehouse bottlenecks in Q1-Q2',
        correctiveAction: 'Optimize warehouse layout and implement WMS upgrade',
        pic: 'Logistics Team'
    },

    // Learning and Growth Perspective
    {
        id: 7,
        perspective: 'Learning and Growth',
        kpi: 'Employee Training Hours',
        kpiDefinition: 'Average training hours per employee per year',
        weight: 10,
        uom: 'Number',
        category: 'Max',
        ytdCalculation: 'Accumulative',
        targets: {
            'Jan-25': 2, 'Feb-25': 4, 'Mar-25': 6, 'Apr-25': 8, 'May-25': 10, 'Jun-25': 12,
            'Jul-25': 14, 'Aug-25': 16, 'Sep-25': 18, 'Oct-25': 20, 'Nov-25': 22, 'Dec-25': 24,
            'Q1-25': 6, 'Q2-25': 12, 'Q3-25': 18, 'Q4-25': 24,
            '2025': 24
        },
        actuals: {
            'Jan-25': 1.8, 'Feb-25': 3.7, 'Mar-25': 5.6, 'Apr-25': 7.5, 'May-25': 9.4, 'Jun-25': 11.3,
            'Jul-25': 13.2, 'Aug-25': 15.1, 'Sep-25': 17, 'Oct-25': 18.9, 'Nov-25': 20.8, 'Dec-25': 22.7,
            'Q1-25': 5.6, 'Q2-25': 11.3, 'Q3-25': 17, 'Q4-25': 22.7,
            '2025': 22.7
        },
        achievements: {
            'Jan-25': 90.0, 'Feb-25': 92.5, 'Mar-25': 93.3, 'Apr-25': 93.8, 'May-25': 94.0, 'Jun-25': 94.2,
            'Jul-25': 94.3, 'Aug-25': 94.4, 'Sep-25': 94.4, 'Oct-25': 94.5, 'Nov-25': 94.5, 'Dec-25': 94.6,
            'Q1-25': 93.3, 'Q2-25': 94.2, 'Q3-25': 94.4, 'Q4-25': 94.6,
            '2025': 94.6
        },
        problemIdentification: 'Training participation lower than expected in Q1',
        correctiveAction: 'Implement mandatory training blocks and improve scheduling',
        pic: 'HR Development Team'
    },
    {
        id: 8,
        perspective: 'Learning and Growth',
        kpi: 'Employee Engagement Score',
        kpiDefinition: 'Score from annual employee engagement survey (scale 1-10)',
        weight: 5,
        uom: 'Number',
        category: 'Max',
        ytdCalculation: 'Last Value',
        targets: {
            'Jan-25': 7.5, 'Feb-25': 7.6, 'Mar-25': 7.7, 'Apr-25': 7.8, 'May-25': 7.9, 'Jun-25': 8.0,
            'Jul-25': 8.1, 'Aug-25': 8.2, 'Sep-25': 8.3, 'Oct-25': 8.4, 'Nov-25': 8.5, 'Dec-25': 8.6,
            'Q1-25': 7.6, 'Q2-25': 7.9, 'Q3-25': 8.2, 'Q4-25': 8.5,
            '2025': 8.2
        },
        actuals: {
            'Jan-25': 7.4, 'Feb-25': 7.5, 'Mar-25': 7.6, 'Apr-25': 7.7, 'May-25': 7.8, 'Jun-25': 7.9,
            'Jul-25': 8.0, 'Aug-25': 8.1, 'Sep-25': 8.2, 'Oct-25': 8.3, 'Nov-25': 8.4, 'Dec-25': 8.5,
            'Q1-25': 7.5, 'Q2-25': 7.8, 'Q3-25': 8.1, 'Q4-25': 8.4,
            '2025': 8.1
        },
        achievements: {
            'Jan-25': 98.7, 'Feb-25': 98.7, 'Mar-25': 98.7, 'Apr-25': 98.7, 'May-25': 98.7, 'Jun-25': 98.8,
            'Jul-25': 98.8, 'Aug-25': 98.8, 'Sep-25': 98.8, 'Oct-25': 98.8, 'Nov-25': 98.8, 'Dec-25': 98.8,
            'Q1-25': 98.7, 'Q2-25': 98.7, 'Q3-25': 98.8, 'Q4-25': 98.8,
            '2025': 98.8
        },
        problemIdentification: 'Need to improve recognition programs',
        correctiveAction: 'Launch peer recognition platform and quarterly awards',
        pic: 'HR & Culture Team'
    }
]);