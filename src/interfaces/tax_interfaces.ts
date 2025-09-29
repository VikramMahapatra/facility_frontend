export interface TaxCode {
    id: string;
    orgId: string;
    code: string;
    rate: number;
    jurisdiction: string;
    status: string;
    accounts?: any;
}

export interface TaxOverview {
    activeTaxCodes: number;
    totalTaxCollected: number;
    avgTaxRate: number;
    pendingReturns: number;
    lastMonthActiveTaxCodes: number;
}