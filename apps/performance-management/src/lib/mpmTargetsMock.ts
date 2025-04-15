import { MPMEntry, MPMTargets } from "./types";

// Sample data structure matching the image
export const mpmTargetDataMock = <MPMEntry[]>([
  {
    id:1,
    perspective: 'Financial',
    kpiNumber: 1,
    kpi: 'Profit / Loss',
    kpiDefinition: 'Rasio keuntungan',
    weight: 15,
    uom: '%',
    category: 'Max',
    ytdCalculation: 'Last Value',
    targets: {
      'Jan-25': 5,
      'Feb-25': 5,
      'Mar-25': 5,
    },
  },
  {
    id:1,
    perspective: 'Financial',
    kpiNumber: 2,
    kpi: 'Total Penjualan',
    kpiDefinition: 'Total penjualan',
    weight: 40,
    uom: 'Number',
    category: 'Max',
    ytdCalculation: 'Accumulative',
    targets: {
      'Jan-25': 10,
      'Feb-25': 10,
      'Mar-25': 10,
    },

  },
  {
    id:1,
    perspective: 'Customer',
    kpiNumber: 1,
    kpi: 'Jumlah Customer',
    kpiDefinition: 'Jumlah customer',
    weight: 15,
    uom: 'Number',
    category: 'Max',
    ytdCalculation: 'Accumulative',
    targets: {
      'Jan-25': 10,
      'Feb-25': 10,
      'Mar-25': 10,
    },

  },
  {
    id:1,
    perspective: 'Internal Business Process',
    kpiNumber: 1,
    kpi: 'Jumlah Supplier',
    kpiDefinition: 'Jumlah supplier',
    weight: 15,
    uom: 'Number',
    category: 'Max',
    ytdCalculation: 'Accumulative',
    targets: {
      'Jan-25': 10,
      'Feb-25': 10,
      'Mar-25': 10,
    },
  },
  {
    id:1,
    perspective: 'Learning & Growth',
    kpiNumber: 1,
    kpi: 'Jumlah Training',
    kpiDefinition: 'Jumlah training',
    weight: 15,
    uom: 'Number',
    category: 'Max',
    ytdCalculation: 'Accumulative',
    targets: {
      'Jan-25': 5,
      'Feb-25': 5,
      'Mar-25': 5,
    },
  },
]);

export const mpmTargetsDataMock = <MPMTargets>{
  id: 1,
  targets: mpmTargetDataMock
};
