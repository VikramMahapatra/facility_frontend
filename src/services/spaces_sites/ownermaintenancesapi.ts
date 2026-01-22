import { apiService } from "../api";

class OwnerMaintenancesApiService {
  async getOwnerMaintenances(params: URLSearchParams) {
    return await apiService.request(
      `/owner-maintenances/all?${params.toString()}`,
    );
  }

  async getOwnerMaintenancesBySpace(params: URLSearchParams) {
    return await apiService.request(
      `/owner-maintenances/by-space?${params.toString()}`,
    );
  }

  async getOwnerMaintenanceStatusLookup() {
    return await apiService.request(`/owner-maintenances/status-lookup`);
  }

  async getSpaceOwnerLookup(siteId: string) {
    const params = new URLSearchParams();
    if (siteId) params.append("site_id", siteId);
    return await apiService.request(
      `/owner-maintenances/spaceowner-lookup?${params.toString()}`,
    );
  }

  async createOwnerMaintenance(payload: any) {
    return await apiService.request(`/owner-maintenances/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateOwnerMaintenance(payload: any) {
    return await apiService.request(`/owner-maintenances/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteOwnerMaintenance(maintenanceId: string) {
    return await apiService.request(
      `/owner-maintenances/${maintenanceId}`,
      { method: "DELETE" },
    );
  }
}

export const ownerMaintenancesApiService = new OwnerMaintenancesApiService();
