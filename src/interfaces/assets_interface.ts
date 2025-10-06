export interface AssetOverview {
  totalAssets: number;
  activeAssets: number;
  totalValue: number;
  assetsNeedingMaintenance: number;
  lastMonthAssetPercentage: number;
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
  status: "active" | "retired" | "in_repair";
  createdAt: string;
}

export type WorkOrderPriority = "low" | "medium" | "high" | "critical";
export type WorkOrderStatus = "open" | "in_progress" | "completed" | "closed";
export type WorkOrderType =
  | "corrective"
  | "preventive"
  | "emergency"
  | "inspection";

export interface WorkOrder {
  id: string;
  org_id?: string;
  site_id: string;
  asset_id?: string | null;
  space_id?: string | null;
  request_id?: string | null;
  title: string;
  description?: string | null;
  priority: WorkOrderPriority;
  type?: WorkOrderType;
  status: WorkOrderStatus;
  due_at?: string | null;
  assigned_to?: string | null;
  sla?: Record<string, any> | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  asset_name?: string | null; // For display purposes
}

export interface WorkOrderOverview {
  total: number;
  open: number;
  in_progress: number;
  overdue: number;
}
