// Advanced analytics mock data for property management

export interface TimeSeriesData {
  date: string;
  [key: string]: number | string;
}

export interface KPIData {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  subtitle: string;
  color?: string;
}

export interface DistributionData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// Revenue Analytics
export const revenueAnalytics = {
  monthly: [
    { date: '2024-01', rental: 485000, cam: 72000, parking: 45000, utilities: 28000, total: 630000 },
    { date: '2024-02', rental: 492000, cam: 74500, parking: 46500, utilities: 29200, total: 642200 },
    { date: '2024-03', rental: 498000, cam: 76200, parking: 47200, utilities: 30100, total: 651500 },
    { date: '2024-04', rental: 506000, cam: 78900, parking: 48800, utilities: 31500, total: 665200 },
    { date: '2024-05', rental: 512000, cam: 80100, parking: 49200, utilities: 32000, total: 673300 },
    { date: '2024-06', rental: 518000, cam: 81500, parking: 50100, utilities: 32800, total: 682400 },
    { date: '2024-07', rental: 525000, cam: 83200, parking: 51000, utilities: 33600, total: 692800 },
    { date: '2024-08', rental: 532000, cam: 84800, parking: 52200, utilities: 34400, total: 703400 },
    { date: '2024-09', rental: 540000, cam: 86500, parking: 53100, utilities: 35200, total: 714800 }
  ],
  forecasted: [
    { date: '2024-10', rental: 547000, cam: 88000, parking: 54000, utilities: 36000, total: 725000 },
    { date: '2024-11', rental: 554000, cam: 89500, parking: 55000, utilities: 36800, total: 735300 },
    { date: '2024-12', rental: 562000, cam: 91000, parking: 56000, utilities: 37600, total: 746600 }
  ]
};

// Occupancy Analytics
export const occupancyAnalytics = {
  trend: [
    { date: '2024-01', occupancy: 72.5, available: 27.5, maintenance: 5.2 },
    { date: '2024-02', occupancy: 74.2, available: 25.8, maintenance: 4.8 },
    { date: '2024-03', occupancy: 76.8, available: 23.2, maintenance: 4.1 },
    { date: '2024-04', occupancy: 78.3, available: 21.7, maintenance: 3.9 },
    { date: '2024-05', occupancy: 79.1, available: 20.9, maintenance: 3.5 },
    { date: '2024-06', occupancy: 80.4, available: 19.6, maintenance: 2.8 },
    { date: '2024-07', occupancy: 81.2, available: 18.8, maintenance: 2.5 },
    { date: '2024-08', occupancy: 82.6, available: 17.4, maintenance: 2.1 },
    { date: '2024-09', occupancy: 83.4, available: 16.6, maintenance: 1.8 }
  ],
  bySpaceType: [
    { type: 'Apartments', occupancy: 89.2, total: 150, occupied: 134, available: 16 },
    { type: 'Shops', occupancy: 76.5, total: 85, occupied: 65, available: 20 },
    { type: 'Offices', occupancy: 92.8, total: 42, occupied: 39, available: 3 },
    { type: 'Hotel Rooms', occupancy: 78.3, total: 120, occupied: 94, available: 26 },
    { type: 'Parking', occupancy: 85.4, total: 200, occupied: 171, available: 29 }
  ],
  heatmap: [
    { floor: 'Ground', block: 'A', occupancy: 95 },
    { floor: 'Ground', block: 'B', occupancy: 88 },
    { floor: '1st', block: 'A', occupancy: 92 },
    { floor: '1st', block: 'B', occupancy: 85 },
    { floor: '2nd', block: 'A', occupancy: 78 },
    { floor: '2nd', block: 'B', occupancy: 82 },
    { floor: '3rd', block: 'A', occupancy: 76 },
    { floor: '3rd', block: 'B', occupancy: 79 }
  ]
};

// Financial Performance Analytics
export const financialAnalytics = {
  collection: [
    { month: '2024-01', collected: 92.5, pending: 7.5, overdue: 2.1 },
    { month: '2024-02', collected: 94.2, pending: 5.8, overdue: 1.8 },
    { month: '2024-03', collected: 95.8, pending: 4.2, overdue: 1.2 },
    { month: '2024-04', collected: 93.6, pending: 6.4, overdue: 2.3 },
    { month: '2024-05', collected: 96.1, pending: 3.9, overdue: 0.9 },
    { month: '2024-06', collected: 94.7, pending: 5.3, overdue: 1.6 },
    { month: '2024-07', collected: 97.2, pending: 2.8, overdue: 0.6 },
    { month: '2024-08', collected: 95.4, pending: 4.6, overdue: 1.4 },
    { month: '2024-09', collected: 96.8, pending: 3.2, overdue: 0.8 }
  ],
  profitability: [
    { site: 'Grand Plaza', revenue: 285000, expenses: 142500, profit: 142500, margin: 50.0 },
    { site: 'Tech Park', revenue: 245000, expenses: 147000, profit: 98000, margin: 40.0 },
    { site: 'Luxury Hotel', revenue: 184800, expenses: 129360, profit: 55440, margin: 30.0 }
  ]
};

// Operational Analytics
export const operationalAnalytics = {
  maintenance: [
    { month: '2024-01', completed: 45, pending: 12, overdue: 3, efficiency: 88.5 },
    { month: '2024-02', completed: 52, pending: 8, overdue: 2, efficiency: 92.1 },
    { month: '2024-03', completed: 48, pending: 10, overdue: 1, efficiency: 89.7 },
    { month: '2024-04', completed: 55, pending: 6, overdue: 2, efficiency: 94.2 },
    { month: '2024-05', completed: 61, pending: 9, overdue: 1, efficiency: 91.8 },
    { month: '2024-06', completed: 58, pending: 7, overdue: 0, efficiency: 96.3 },
    { month: '2024-07', completed: 63, pending: 5, overdue: 1, efficiency: 95.1 },
    { month: '2024-08', completed: 59, pending: 8, overdue: 2, efficiency: 90.4 },
    { month: '2024-09', completed: 64, pending: 4, overdue: 0, efficiency: 97.2 }
  ],
  energy: [
    { month: '2024-01', electricity: 45600, water: 12800, gas: 8900, cost: 185200 },
    { month: '2024-02', electricity: 44200, water: 12200, gas: 8600, cost: 178900 },
    { month: '2024-03', electricity: 46800, water: 13200, gas: 9200, cost: 192400 },
    { month: '2024-04', electricity: 48200, water: 13600, gas: 9500, cost: 198600 },
    { month: '2024-05', electricity: 49800, water: 14100, gas: 9800, cost: 205200 },
    { month: '2024-06', electricity: 52200, water: 14800, gas: 10200, cost: 215400 },
    { month: '2024-07', electricity: 54600, water: 15200, gas: 10600, cost: 225800 },
    { month: '2024-08', electricity: 53200, water: 14900, gas: 10400, cost: 219600 },
    { month: '2024-09', electricity: 51800, water: 14600, gas: 10100, cost: 212800 }
  ]
};

// Visitor & Access Analytics
export const accessAnalytics = {
  daily: [
    { date: '2024-09-10', visitors: 142, entries: 186, exits: 178, peak_hour: '10:00' },
    { date: '2024-09-11', visitors: 158, entries: 205, exits: 192, peak_hour: '09:30' },
    { date: '2024-09-12', visitors: 134, entries: 175, exits: 168, peak_hour: '11:00' },
    { date: '2024-09-13', visitors: 167, entries: 218, exits: 209, peak_hour: '10:30' },
    { date: '2024-09-14', visitors: 189, entries: 245, exits: 238, peak_hour: '09:00' },
    { date: '2024-09-15', visitors: 203, entries: 267, exits: 251, peak_hour: '10:00' },
    { date: '2024-09-16', visitors: 178, entries: 234, exits: 225, peak_hour: '09:45' }
  ],
  patterns: [
    { hour: '06:00', entries: 12, exits: 8 },
    { hour: '07:00', entries: 28, exits: 15 },
    { hour: '08:00', entries: 45, exits: 22 },
    { hour: '09:00', entries: 67, exits: 18 },
    { hour: '10:00', entries: 89, exits: 25 },
    { hour: '11:00', entries: 78, exits: 35 },
    { hour: '12:00', entries: 65, exits: 42 },
    { hour: '13:00', entries: 58, exits: 38 },
    { hour: '14:00', entries: 62, exits: 45 },
    { hour: '15:00', entries: 71, exits: 48 },
    { hour: '16:00', entries: 83, exits: 62 },
    { hour: '17:00', entries: 95, exits: 78 },
    { hour: '18:00', entries: 72, exits: 95 },
    { hour: '19:00', entries: 45, exits: 82 },
    { hour: '20:00', entries: 28, exits: 65 },
    { hour: '21:00', entries: 18, exits: 45 }
  ]
};

// Tenant & Lease Analytics
export const tenantAnalytics = {
  satisfaction: [
    { category: 'Maintenance Response', score: 4.2, trend: 0.3 },
    { category: 'Facility Quality', score: 4.5, trend: 0.1 },
    { category: 'Security', score: 4.7, trend: 0.2 },
    { category: 'Parking', score: 3.8, trend: -0.1 },
    { category: 'Communication', score: 4.1, trend: 0.4 }
  ],
  retention: [
    { year: 2020, renewals: 68, departures: 32, rate: 68.0 },
    { year: 2021, renewals: 72, departures: 28, rate: 72.0 },
    { year: 2022, renewals: 76, departures: 24, rate: 76.0 },
    { year: 2023, renewals: 78, departures: 22, rate: 78.0 },
    { year: 2024, renewals: 82, departures: 18, rate: 82.0 }
  ]
};

// Key Performance Indicators
export const kpiData: KPIData[] = [
  {
    title: "Total Revenue",
    value: "₹714.8K",
    change: 8.2,
    trend: "up",
    subtitle: "This month",
    color: "text-green-600"
  },
  {
    title: "Occupancy Rate",
    value: "83.4%",
    change: 2.1,
    trend: "up",
    subtitle: "Across all properties",
    color: "text-blue-600"
  },
  {
    title: "Collection Rate",
    value: "96.8%",
    change: 1.4,
    trend: "up",
    subtitle: "Payment collections",
    color: "text-purple-600"
  },
  {
    title: "Maintenance Efficiency",
    value: "97.2%",
    change: 6.8,
    trend: "up",
    subtitle: "Work order completion",
    color: "text-orange-600"
  },
  {
    title: "Energy Cost",
    value: "₹212.8K",
    change: -3.1,
    trend: "down",
    subtitle: "Monthly consumption",
    color: "text-red-600"
  },
  {
    title: "Tenant Satisfaction",
    value: "4.3/5",
    change: 0.2,
    trend: "up",
    subtitle: "Average rating",
    color: "text-teal-600"
  }
];

// Portfolio Distribution
export const portfolioDistribution: DistributionData[] = [
  { name: "Apartments", value: 150, percentage: 42.5, color: "#3b82f6" },
  { name: "Shops", value: 85, percentage: 24.1, color: "#10b981" },
  { name: "Offices", value: 42, percentage: 11.9, color: "#f59e0b" },
  { name: "Hotel Rooms", value: 120, percentage: 34.0, color: "#8b5cf6" },
  { name: "Parking", value: 200, percentage: 56.7, color: "#ef4444" }
];

// Comparative Analytics
export const comparativeAnalytics = {
  yearOverYear: {
    revenue: { current: 714800, previous: 658200, growth: 8.6 },
    occupancy: { current: 83.4, previous: 78.9, growth: 5.7 },
    expenses: { current: 428880, previous: 394920, growth: 8.6 },
    profit: { current: 285920, previous: 263280, growth: 8.6 }
  },
  siteComparison: [
    {
      site: "Grand Plaza",
      metrics: {
        occupancy: 89.2,
        revenue: 285000,
        satisfaction: 4.5,
        efficiency: 94.2
      }
    },
    {
      site: "Tech Park",
      metrics: {
        occupancy: 85.7,
        revenue: 245000,
        satisfaction: 4.2,
        efficiency: 91.8
      }
    },
    {
      site: "Luxury Hotel",
      metrics: {
        occupancy: 78.3,
        revenue: 184800,
        satisfaction: 4.7,
        efficiency: 96.3
      }
    }
  ]
};