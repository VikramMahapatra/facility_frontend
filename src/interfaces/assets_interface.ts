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
    orgId: string;
    siteId: string;
    spaceId?: string;
    categoryId: string;
    categoryName: string;
    tag: string;
    name: string;
    serialNo: string;
    model: string;
    manufacturer: string;
    purchaseDate: string;
    warrantyExpiry: string;
    cost: number;
    attributes?: any;
    status: 'active' | 'retired' | 'in_repair';
    createdAt: string;
}
