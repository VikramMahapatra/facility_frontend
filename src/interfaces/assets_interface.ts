export interface AssetOverview {
    totalAssets: number
    activeAssets: number
    totalValue: number
    assetsNeedingMaintenance: number
    lastMonthAssetPercentage: number
}

export interface AssetCategory {
    id: string;
    orgId: string;
    name: string;
    code: string;
    parentId?: string;
    attributes?: any;
}

export interface Asset {
    id: string;
    org_id: string;
    site_id: string;
    space_id?: string;
    category_id: string;
    category_name: string;
    tag: string;
    name: string;
    serial_no: string;
    model: string;
    manufacturer: string;
    purchase_date: string;
    warranty_expiry: string;
    cost: number;
    attributes?: any;
    status: 'active' | 'retired' | 'in_repair';
    createdAt: string;
}

