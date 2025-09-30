// services/Leasing_Tenants/leasechargeapi.ts
import { apiService } from "../api";

/**
 * IMPORTANT:
 * Backend router prefix = /api/lease-charges  (hyphen)
 * VITE_FACILITY_API_BASE_URL should end with /api
 * -> Frontend endpoints start with /lease-charges (no /api, and use hyphen)
 */
const prefix = "/lease-charges";

const monthMap: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export interface LeaseChargeListResp {
  total: number;
  items: any[];
}

class LeaseChargeApiService {
  // Dashboard cards -> GET /api/lease-charges/dashboard
  async getDashboard() {
    return apiService.request(`${prefix}/dashboard`);
  }

  // List (paged/filter) -> GET /api/lease-charges/list
  // You can use this if you later prefer a single list API instead of by_type/by_month.
  async list(params?: {
    search?: string;
    charge_codes_csv?: string; // e.g. "RENT,CAM"
    monthNumber?: number;      // 1-12
    year?: number;
    site_ids_csv?: string;     // e.g. "uuid1,uuid2"
    skip?: number;
    limit?: number;
  }): Promise<LeaseChargeListResp> {
    const qs = new URLSearchParams();
    if (params?.search) qs.append("search", params.search);
    if (params?.charge_codes_csv) qs.append("charge_codes", params.charge_codes_csv);
    if (params?.monthNumber) qs.append("month", String(params.monthNumber));
    if (params?.year) qs.append("year", String(params.year));
    if (params?.site_ids_csv) qs.append("site_ids", params.site_ids_csv);
    qs.append("skip", String(params?.skip ?? 0));
    qs.append("limit", String(params?.limit ?? 50));
    return apiService.request(`${prefix}/list?${qs.toString()}`);
  }

  // Filter by TYPE(S) -> GET /api/lease-charges/by_type?types=RENT&types=CAM
  async getByType(types?: string[]): Promise<LeaseChargeListResp> {
    const qs = new URLSearchParams();
    if (types?.length) types.forEach((t) => qs.append("types", t));
    return apiService.request(`${prefix}/by_type${qs.toString() ? `?${qs}` : ""}`);
  }

  // Filter by MONTH name (Jan, February, etc.) -> converts to month=1..12
  // Backend: GET /api/lease-charges/by_month?month=1..12
  async getByMonth(monthName?: string): Promise<LeaseChargeListResp> {
    const qs = new URLSearchParams();
    if (monthName && monthName.toLowerCase() !== "all") {
      const key = monthName.slice(0, 3).toLowerCase();
      const num = monthMap[key];
      if (num) qs.append("month", String(num));
    }
    return apiService.request(`${prefix}/by_month${qs.toString() ? `?${qs}` : ""}`);
  }

  // Create -> POST /api/lease-charges/
  async create(payload: any) {
    return apiService.request(`${prefix}/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Update -> PUT /api/lease-charges/{id}
  async update(id: string, payload: any) {
    return apiService.request(`${prefix}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Delete -> DELETE /api/lease-charges/{id}
  async delete(id: string) {
    return apiService.request(`${prefix}/${id}`, { method: "DELETE" });
  }
}

export const leaseChargeApiService = new LeaseChargeApiService();
