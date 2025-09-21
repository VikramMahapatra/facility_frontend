export interface Meter {
  id: string;
  orgId: string;
  siteId: string;
  kind: 'electricity' | 'water' | 'gas' | 'btuh' | 'people_counter';
  code: string;
  assetId?: string;
  spaceId?: string;
  unit: string;
  multiplier: number;
  siteName: string;
  spaceName?: string;
  assetName?: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastReading?: number;
  lastReadingDate?: string;
}

export interface MeterReading {
  id: string;
  meterId: string;
  meterCode: string;
  meterKind: string;
  ts: string;
  reading: number;
  delta?: number;
  source: 'manual' | 'iot';
  metadata?: any;
  unit: string;
}

export interface ConsumptionReport {
  id: string;
  siteName: string;
  meterKind: string;
  period: string;
  totalConsumption: number;
  averageDaily: number;
  peakUsage: number;
  cost: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export const mockMeters: Meter[] = [
  {
    id: "meter-1",
    orgId: "org-1",
    siteId: "site-1",
    kind: "electricity",
    code: "ELE-001",
    assetId: "asset-1",
    spaceId: "space-1",
    unit: "kWh",
    multiplier: 1.0,
    siteName: "Tech Park Mall",
    spaceName: "Ground Floor - Main",
    assetName: "Main Distribution Board",
    status: "active",
    lastReading: 15420.5,
    lastReadingDate: "2024-01-15T10:30:00Z"
  },
  {
    id: "meter-2",
    orgId: "org-1",
    siteId: "site-1",
    kind: "water",
    code: "WAT-002",
    spaceId: "space-2",
    unit: "m³",
    multiplier: 1.0,
    siteName: "Tech Park Mall",
    spaceName: "1st Floor - Retail",
    status: "active",
    lastReading: 1250.8,
    lastReadingDate: "2024-01-15T09:15:00Z"
  },
  {
    id: "meter-3",
    orgId: "org-1",
    siteId: "site-2",
    kind: "gas",
    code: "GAS-003",
    unit: "m³",
    multiplier: 1.0,
    siteName: "Residential Tower A",
    status: "active",
    lastReading: 890.2,
    lastReadingDate: "2024-01-14T18:45:00Z"
  },
  {
    id: "meter-4",
    orgId: "org-1",
    siteId: "site-1",
    kind: "people_counter",
    code: "PEO-004",
    spaceId: "space-3",
    unit: "count",
    multiplier: 1.0,
    siteName: "Tech Park Mall",
    spaceName: "Main Entrance",
    status: "active",
    lastReading: 2450,
    lastReadingDate: "2024-01-15T11:00:00Z"
  },
  {
    id: "meter-5",
    orgId: "org-1",
    siteId: "site-3",
    kind: "electricity",
    code: "ELE-005",
    unit: "kWh",
    multiplier: 1.0,
    siteName: "Hotel Paradise",
    status: "maintenance",
    lastReading: 8920.3,
    lastReadingDate: "2024-01-13T16:20:00Z"
  }
];

export const mockMeterReadings: MeterReading[] = [
  {
    id: "reading-1",
    meterId: "meter-1",
    meterCode: "ELE-001",
    meterKind: "electricity",
    ts: "2024-01-15T10:30:00Z",
    reading: 15420.5,
    delta: 125.8,
    source: "iot",
    unit: "kWh"
  },
  {
    id: "reading-2",
    meterId: "meter-1",
    meterCode: "ELE-001",
    meterKind: "electricity",
    ts: "2024-01-14T10:30:00Z",
    reading: 15294.7,
    delta: 118.2,
    source: "iot",
    unit: "kWh"
  },
  {
    id: "reading-3",
    meterId: "meter-2",
    meterCode: "WAT-002",
    meterKind: "water",
    ts: "2024-01-15T09:15:00Z",
    reading: 1250.8,
    delta: 15.3,
    source: "manual",
    unit: "m³"
  },
  {
    id: "reading-4",
    meterId: "meter-3",
    meterCode: "GAS-003",
    meterKind: "gas",
    ts: "2024-01-14T18:45:00Z",
    reading: 890.2,
    delta: 22.1,
    source: "iot",
    unit: "m³"
  },
  {
    id: "reading-5",
    meterId: "meter-4",
    meterCode: "PEO-004",
    meterKind: "people_counter",
    ts: "2024-01-15T11:00:00Z",
    reading: 2450,
    delta: 156,
    source: "iot",
    unit: "count"
  }
];

export const mockConsumptionReports: ConsumptionReport[] = [
  {
    id: "consumption-1",
    siteName: "Tech Park Mall",
    meterKind: "electricity",
    period: "January 2024",
    totalConsumption: 3580.5,
    averageDaily: 115.5,
    peakUsage: 145.8,
    cost: 28644.0,
    unit: "kWh",
    trend: "up",
    trendPercentage: 12.5
  },
  {
    id: "consumption-2",
    siteName: "Tech Park Mall",
    meterKind: "water",
    period: "January 2024",
    totalConsumption: 420.8,
    averageDaily: 13.6,
    peakUsage: 18.5,
    cost: 8416.0,
    unit: "m³",
    trend: "down",
    trendPercentage: 8.2
  },
  {
    id: "consumption-3",
    siteName: "Residential Tower A",
    meterKind: "gas",
    period: "January 2024",
    totalConsumption: 645.2,
    averageDaily: 20.8,
    peakUsage: 28.3,
    cost: 32260.0,
    unit: "m³",
    trend: "stable",
    trendPercentage: 2.1
  },
  {
    id: "consumption-4",
    siteName: "Hotel Paradise",
    meterKind: "electricity",
    period: "January 2024",
    totalConsumption: 8920.3,
    averageDaily: 287.7,
    peakUsage: 325.4,
    cost: 71362.4,
    unit: "kWh",
    trend: "up",
    trendPercentage: 15.8
  },
  {
    id: "consumption-5",
    siteName: "Tech Park Mall",
    meterKind: "people_counter",
    period: "January 2024",
    totalConsumption: 74500,
    averageDaily: 2403.2,
    peakUsage: 3200,
    cost: 0,
    unit: "count",
    trend: "up",
    trendPercentage: 18.5
  }
];