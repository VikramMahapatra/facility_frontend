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
    return await apiService.request(`/tenants/by-site-space${qs}`);
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
}

export const tenantsApiService = new TenantsApiService();
