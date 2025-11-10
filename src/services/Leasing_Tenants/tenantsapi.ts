import { apiService } from "../api";

class TenantsApiService {
  async getTenants(params) {
    return await apiService.request(`/tenants/all?${params.toString()}`);
  }

  async getTenantOverview() {
    return await apiService.request(`/tenants/overview`);
  }

  async addTenant(tenantData: any) {
    return await apiService.request("/tenants", {
      method: "POST",
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(tenantData: any) {
    return await apiService.request(`/tenants`, {
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
    return await apiService.request(`/tenants/${id}`);
  }

  async getTenantLeases(tenantId: any) {
    return await apiService.request(`/tenants/${tenantId}/leases`);
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
}

export const tenantsApiService = new TenantsApiService();