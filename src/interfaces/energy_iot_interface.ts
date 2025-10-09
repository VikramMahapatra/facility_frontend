export interface Meter {
    id: string;
    org_id: string;
    site_id: string;
    kind: 'electricity' | 'water' | 'gas' | 'btuh' | 'people_counter';
    code: string;
    asset_id?: string;
    space_id?: string;
    unit: string;
    multiplier: number;
    site_name: string;
    space_name?: string;
    asset_name?: string;
    status: 'active' | 'inactive' | 'maintenance';
    last_reading?: number;
    last_reading_date?: string;
}

export interface MeterReading {
    id: string;
    meter_id: string;
    meter_code: string;
    meter_kind: string;
    ts: string;
    reading: number;
    delta?: number;
    source: 'manual' | 'iot';
    metadata?: any;
    unit: string;
}

export interface MeterReadingOverview {
    totalMeters?: number;
    activeMeters?: number;
    latestReadings?: number;
    iotConnected?: number;
}