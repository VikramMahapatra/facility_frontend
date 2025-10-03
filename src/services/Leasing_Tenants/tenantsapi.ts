import { apiService } from "../api";

class TenantsApiService {
  async getTenants(params) {
    return await apiService.request(`/tenants/all?${params.toString()}`);
  }

  async getTenantOverview(params) {
    return await apiService.request(`/tenants/overview?${params.toString()}`);
  }

  async addTenant(tenantData: any) {
    return await apiService.request("/tenants/", {
      method: "POST",
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(id: any, tenantData: any) {
    return await apiService.request(`/tenants/${id}`, {
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
}

export const tenantsApiService = new TenantsApiService();
