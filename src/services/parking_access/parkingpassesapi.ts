import { apiService } from "../api";

class ParkingPassesApiService {
  async getParkingPassesOverview() {
    return await apiService.request("/parking-passes/overview");
  }

  async getAllParkingPasses(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/parking-passes/all${qs}`);
  }

  async getParkingPassPreview(partnerId: string) {
    return await apiService.request(
      `/parking-passes/partner/info/${partnerId}`
    );
  }

  async createParkingPass(passData: any) {
    return await apiService.request(`/parking-passes/`, {
      method: "POST",
      body: JSON.stringify(passData),
    });
  }

  async updateParkingPass(passData: any) {
    return await apiService.request(`/parking-passes/`, {
      method: "PUT",
      body: JSON.stringify(passData),
    });
  }

  async deleteParkingPass(passId: string) {
    return await apiService.request(`/parking-passes/${passId}`, {
      method: "DELETE",
    });
  }

  async getStatusLookup() {
    return await apiService.request("/parking-passes/status-lookup");
  }

  async getFilterStatusLookup() {
    return await apiService.request("/parking-passes/filter-status-lookup");
  }

  async getFilterZoneLookup() {
    return await apiService.request("/parking-passes/filter-zone-lookup");
  }
}

export const parkingPassesApiService = new ParkingPassesApiService();
