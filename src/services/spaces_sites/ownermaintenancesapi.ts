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

  async getSpaceOwnerLookup(siteId: string, buildingId: string) {
    const params = new URLSearchParams();
    if (siteId) params.append("site_id", siteId);
    if (buildingId) params.append("building_id", buildingId);
    return await apiService.request(
      `/owner-maintenances/space-owner-lookup?${params.toString()}`,
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
    return await apiService.request(`/owner-maintenances/${maintenanceId}`, {
      method: "DELETE",
    });
  }

  async autoGenerateMaintenance(date: string) {
    const params = new URLSearchParams();
    params.append("date", date);
    return await apiService.request(
      `/owner-maintenances/auto-generate-maintenance?${params.toString()}`,
      { method: "POST" },
    );
  }

  async getCalculatedMaintenances(params: any) {
    return await apiService.request(
      `/owner-maintenances/calculated-maintenance-amount`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
  }
}

export const ownerMaintenancesApiService = new OwnerMaintenancesApiService();
