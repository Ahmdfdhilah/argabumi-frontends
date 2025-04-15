import { BSCEntry } from "./types";

export const dummyData: BSCEntry[] = [
    {
        id:1,
        perspective: 'Financial',
        kpiNumber: 1,
        kpi: 'Revenue Growth',
        code: 'F.1.1',
        kpiDefinition: 'Year over year revenue growth',
        weight: 15,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Accumulative',
        target: 20,
        actual: 18,
        achievement: 90,
        score: 0.15,
        activeWeight: 0.30,
        totalScore: 0.05,
        endScore: 0.05,
        relatedPIC: 'Finance Director',
        problemIdentification: 'Slower market growth than expected',
        correctiveAction: 'Expand to new markets'
    },
    {
        id:2,
        perspective: 'Financial',
        kpiNumber: 2,
        kpi: 'Profit Margin',
        code: 'F.1.2',
        kpiDefinition: 'Net profit margin percentage',
        weight: 10,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Average',
        target: 15,
        actual: 16,
        achievement: 107,
        score: 0.10,
        activeWeight: 0.20,
        totalScore: 0.04,
        endScore: 0.04,
        relatedPIC: 'Finance Manager',
        problemIdentification: '',
        correctiveAction: ''
    },
    {
        id:3,
        perspective: 'Financial',
        kpiNumber: 3,
        kpi: 'Cost Reduction',
        code: 'F.1.3',
        kpiDefinition: 'Annual cost reduction target',
        weight: 8,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Accumulative',
        target: 5,
        actual: 3,
        achievement: 60,
        score: 0.08,
        activeWeight: 0.16,
        totalScore: 0.03,
        endScore: 0.03,
        relatedPIC: 'Operations Manager',
        problemIdentification: 'Limited cost-cutting opportunities',
        correctiveAction: 'Conduct detailed cost efficiency audit'
    },
    {
        id:4,
        perspective: 'Customer',
        kpiNumber: 1,
        kpi: 'Customer Satisfaction',
        code: 'C.1.1',
        kpiDefinition: 'Customer satisfaction score',
        weight: 12,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Average',
        target: 4.5,
        actual: 4.3,
        achievement: 96,
        score: 0.12,
        activeWeight: 0.24,
        totalScore: 0.05,
        endScore: 0.05,
        relatedPIC: 'Customer Service Manager',
        problemIdentification: 'Slight drop in customer satisfaction',
        correctiveAction: 'Implement customer feedback improvement program'
    },
    {
        id:5,
        perspective: 'Customer',
        kpiNumber: 2,
        kpi: 'Customer Retention',
        code: 'C.1.2',
        kpiDefinition: 'Customer retention rate',
        weight: 10,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Average',
        target: 95,
        actual: 92,
        achievement: 97,
        score: 0.10,
        activeWeight: 0.20,
        totalScore: 0.04,
        endScore: 0.04,
        relatedPIC: 'Sales Director',
        problemIdentification: 'Customer churn slightly above target',
        correctiveAction: 'Develop targeted retention strategies'
    },
    {
        id:6,
        perspective: 'Internal Business Process',
        kpiNumber: 1,
        kpi: 'Process Efficiency',
        code: 'I.1.1',
        kpiDefinition: 'Process cycle time reduction',
        weight: 8,
        uom: 'Days',
        category: 'Min',
        ytdCalculation: 'Accumulative',
        target: 5,
        actual: 4,
        achievement: 120,
        score: 0.08,
        activeWeight: 0.16,
        totalScore: 0.03,
        endScore: 0.03,
        relatedPIC: 'Operations Manager',
        problemIdentification: '',
        correctiveAction: ''
    },
    {
        id:7,
        perspective: 'Internal Business Process',
        kpiNumber: 2,
        kpi: 'Quality Rate',
        code: 'I.1.2',
        kpiDefinition: 'Product quality pass rate',
        weight: 7,
        uom: '%',
        category: 'Max',
        ytdCalculation: 'Average',
        target: 99,
        actual: 98.5,
        achievement: 99.5,
        score: 0.07,
        activeWeight: 0.14,
        totalScore: 0.03,
        endScore: 0.03,
        relatedPIC: 'Quality Control Manager',
        problemIdentification: 'Slight deviation from quality target',
        correctiveAction: 'Enhance quality control processes'
    },
    {
        id:8,
        perspective: 'Learning & Growth',
        kpiNumber: 1,
        kpi: 'Employee Training',
        code: 'L.1.1',
        kpiDefinition: 'Training hours per employee',
        weight: 5,
        uom: 'Days',
        category: 'Max',
        ytdCalculation: 'Average',
        target: 40,
        actual: 35,
        achievement: 87.5,
        score: 0.05,
        activeWeight: 0.10,
        totalScore: 0.02,
        endScore: 0.02,
        relatedPIC: 'HR Manager',
        problemIdentification: 'Insufficient training hours',
        correctiveAction: 'Develop comprehensive training program'
    },
    {
        id:9,
        perspective: 'Learning & Growth',
        kpiNumber: 2,
        kpi: 'Innovation Rate',
        code: 'L.1.2',
        kpiDefinition: 'New products/services launched',
        weight: 5,
        uom: 'Number',
        category: 'Max',
        ytdCalculation: 'Accumulative',
        target: 5,
        actual: 4,
        achievement: 80,
        score: 0.05,
        activeWeight: 0.10,
        totalScore: 0.02,
        endScore: 0.02,
        relatedPIC: 'Innovation Director',
        problemIdentification: 'Lower than expected innovation output',
        correctiveAction: 'Establish innovation incentive program'
    }, {
        id:10,
        perspective: 'Learning & Growth',
        kpiNumber: 2,
        kpi: 'Innovation Rate',
        code: 'L.1.22',
        kpiDefinition: 'New products/services launched',
        weight: 5,
        uom: 'Number',
        category: 'Max',
        ytdCalculation: 'Accumulative',
        target: 5,
        actual: 4,
        achievement: 80,
        score: 0.05,
        activeWeight: 0.10,
        totalScore: 0.02,
        endScore: 0.02,
        relatedPIC: 'Innovation Director',
        problemIdentification: 'Lower than expected innovation output',
        correctiveAction: 'Establish innovation incentive program'
    }, 
];