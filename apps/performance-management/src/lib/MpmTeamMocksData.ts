type MonthType = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' |
    'July' | 'August' | 'September' | 'October' | 'November' | 'December';


type TeamKPIActual = {
    id: string;
    teamId: number;
    teamName: string;
    month: MonthType;
    target: number;
    actual: number;
    achievement: number;
    weight: number;
    problemIdentification: string;
    rootCauseAnalysis: string;
    correctiveAction: string;
    status: 'On Track' | 'At Risk' | 'Off Track';
};


export const teamMpmActual: TeamKPIActual[] = [
    {
        id: '1',
        teamId: 1,
        teamName: 'Sales Team',
        month: 'January',
        target: 50000,
        actual: 45000,
        achievement: 90,
        weight: 20,
        problemIdentification: 'Lower sales in new market segments',
        rootCauseAnalysis: 'Limited market penetration and competitive pricing',
        correctiveAction: 'Develop targeted marketing strategy and adjust pricing',
        status: 'At Risk'
    },
    {
        id: '2',
        teamId: 2,
        teamName: 'Business Development',
        month: 'January',
        target: 25000,
        actual: 30000,
        achievement: 120,
        weight: 10,
        problemIdentification: '',
        rootCauseAnalysis: '',
        correctiveAction: '',
        status: 'On Track'
    },
    {
        id: '3',
        teamId: 3,
        teamName: 'Marketing',
        month: 'January',
        target: 15000,
        actual: 12000,
        achievement: 80,
        weight: 15,
        problemIdentification: 'Campaign underperformance',
        rootCauseAnalysis: 'Poor targeting and messaging',
        correctiveAction: 'Refine messaging and audience targeting',
        status: 'At Risk'
    },
    {
        id: '4',
        teamId: 4,
        teamName: 'Product Development',
        month: 'January',
        target: 10000,
        actual: 5000,
        achievement: 50,
        weight: 25,
        problemIdentification: 'Product launch delays',
        rootCauseAnalysis: 'Technical issues and resource constraints',
        correctiveAction: 'Increase development team capacity',
        status: 'Off Track'
    },
    {
        id: '5',
        teamId: 5,
        teamName: 'Customer Success',
        month: 'January',
        target: 30000,
        actual: 32000,
        achievement: 107,
        weight: 15,
        problemIdentification: '',
        rootCauseAnalysis: '',
        correctiveAction: '',
        status: 'On Track'
    },
    {
        id: '6',
        teamId: 6,
        teamName: 'Strategic Partnerships',
        month: 'January',
        target: 20000,
        actual: 18000,
        achievement: 90,
        weight: 15,
        problemIdentification: 'Partner engagement issues',
        rootCauseAnalysis: 'Insufficient partner incentives',
        correctiveAction: 'Restructure partner program benefits',
        status: 'At Risk'
    }
]