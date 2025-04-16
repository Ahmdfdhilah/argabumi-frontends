// Types
export type Perspective =
    | 'Financial'
    | 'Customer'
    | 'Internal Business Process'
    | 'Learning & Growth';
export type Category = 'Max' | 'Min' | 'On Target';
export type YTDCalculation = 'Accumulative' | 'Average' | 'Last Value';
export type UOMType = 'Number' | '%' | 'Days' | 'Kriteria';

export type ActionPlan = {
    id: string;
    description: string;
    responsiblePerson: string;
    deadline: string;
};

export type MPMTargets  = {
    id?: number;
    targets?: MPMEntry[];
}

export type MPMEntry = {
    id?: number,
    perspective: Perspective;
    kpiNumber: number;
    kpi: string;
    kpiDefinition: string;
    weight: number;
    uom: UOMType;
    category: Category;
    ytdCalculation: YTDCalculation;
    targets: Record<string, number>;
};

export type BSCEntry = {
    id: number;
    perspective: Perspective;
    kpiNumber: number;
    kpi: string;
    code: string;
    kpiDefinition: string;
    weight: number;
    actual?: number;
    achievement?: number;
    uom: UOMType;
    category: Category;
    ytdCalculation: YTDCalculation;
    relatedPIC: string;
    target: number;
    score?: number,
    activeWeight?: number,
    totalScore?: number,
    endScore?: number,
    problemIdentification?: string,
    correctiveAction?: string
};


export type Manager = {
    id: string;
    name: string;
    position: string;
    department: string;
};