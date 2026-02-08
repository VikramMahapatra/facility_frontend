import { apiService } from "../api";

class TenantsApiService {
  async getTenants(params) {
    return await apiService.request(`/tenants/all?${params.toString()}`);
  }

  async getTenantOverview() {
    return await apiService.request(`/tenants/overview`);
  }

  async addTenant(tenantData: any) {
    return await apiService.request("/tenants/", {
      method: "POST",
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(tenantData: any) {
    return await apiService.request(`/tenants/`, {
      method: "PUT",
      body: JSON.stringify(tenantData),
    });
  }

  async deleteTenant(id: any) {
    return await apiService.request(`/tenants/${id}`, {
      method: "DELETE",
    });
  }

  async getTenantById(id: any) {
    const params = new URLSearchParams();
    params.append("tenant_id", id);
    return await apiService.request(`/tenants/detail?${params.toString()}`, {
      method: "POST",
    });
  }

  async getTenantLeases(tenantId: any) {
    return await apiService.request(`/tenants/${tenantId}/leases`);
  }

  async getTenantPaymentHistory(tenantId: any) {
    return await apiService.request(`/tenants/payment-history/${tenantId}`);
  }

  async getTenantStatusLookup() {
    return await apiService.request("/tenants/status-lookup");
  }

  async getTenantTypeLookup() {
    return await apiService.request("/tenants/type-lookup");
  }

  async getTenantsBySiteSpace(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/tenants/users-by-site-space${qs}`);
  }

  async getSpaceTenants(spaceId: any) {
    return await apiService.request(`/tenants/${spaceId}/spaces`);
  }

  async approveTenant(spaceId: any, tenantId: any) {
    return await apiService.request(`/tenants/approve`, {
      method: "POST",
      body: JSON.stringify({ space_id: spaceId, tenant_id: tenantId }),
    });
  }

  async rejectTenant(spaceId: any, tenantId: any) {
    return await apiService.request(`/tenants/reject`, {
      method: "POST",
      body: JSON.stringify({ space_id: spaceId, tenant_id: tenantId }),
    });
  }

  async getTenantApprovals(params) {
    return await apiService.request(`/tenants/approvals?${params.toString()}`);
  }

  async manageSpaces(tenantSpaceData: any) {
    return await apiService.request("/tenants/manage-spaces", {
      method: "POST",
      body: JSON.stringify(tenantSpaceData),
    });
  }

  // Mock API methods for tenant move-out approvals
  async getTenantMoveOutApprovals(params) {
    // Mock implementation - returns mock data for now
    return new Promise((resolve) => {
      setTimeout(() => {
        const statusParam = params.get("status") || "pending";
        const searchParam = params.get("search") || "";
        const skip = parseInt(params.get("skip") || "0");
        const limit = parseInt(params.get("limit") || "10");

        // Mock data
        const allMockData = [
          {
            id: "1",
            tenant_id: "tenant-1",
            tenant_name: "John Doe",
            phone: "+1234567890",
            space_id: "space-1",
            space_name: "Office Suite 101",
            site_name: "Downtown Plaza",
            requested_at: new Date().toISOString(),
            move_out_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "pending",
          },
          {
            id: "2",
            tenant_id: "tenant-2",
            tenant_name: "Jane Smith",
            phone: "+1987654321",
            space_id: "space-2",
            space_name: "Conference Room A",
            site_name: "Business Center",
            requested_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            move_out_date: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "pending",
          },
          {
            id: "3",
            tenant_id: "tenant-3",
            tenant_name: "Bob Johnson",
            phone: "+1555555555",
            space_id: "space-3",
            space_name: "Workshop 205",
            site_name: "Industrial Park",
            requested_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            move_out_date: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "approved",
          },
          {
            id: "4",
            tenant_id: "tenant-4",
            tenant_name: "Alice Williams",
            phone: "+1444444444",
            space_id: "space-4",
            space_name: "Storage Unit 10",
            site_name: "Warehouse Complex",
            requested_at: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000
            ).toISOString(),
            move_out_date: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "rejected",
          },
        ];

        // Filter by status
        let filtered = allMockData;
        if (statusParam && statusParam !== "all") {
          filtered = allMockData.filter((item) => item.status === statusParam);
        }

        // Filter by search
        if (searchParam) {
          const searchLower = searchParam.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.tenant_name.toLowerCase().includes(searchLower) ||
              item.phone.includes(searchParam)
          );
        }

        // Paginate
        const total = filtered.length;
        const paginated = filtered.slice(skip, skip + limit);

        const mockData = {
          success: true,
          data: {
            items: paginated,
            total: total,
          },
        };
        resolve(mockData);
      }, 300);
    });
  }

  async approveTenantMoveOut(spaceId: any, tenantId: any) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Move-out request approved successfully",
        });
      }, 500);
    });
  }

  async rejectTenantMoveOut(spaceId: any, tenantId: any) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Move-out request rejected successfully",
        });
      }, 500);
    });
  }
}

export const tenantsApiService = new TenantsApiService();
