import { apiService } from "../api";

class PreventiveMaintenanceApiService {
  async getPreventiveMaintenance(params: any) {
    return await apiService.request(`/pm_templates/all?${params.toString()}`);
  }

  async getPreventiveMaintenanceOverview(params: any) {
    return await apiService.request(
      `/pm_templates/overview?${params.toString()}`
    );
  }

  async addPreventiveMaintenance(pmData: any) {
    return await apiService.request("/pm_templates", {
      method: "POST",
      body: JSON.stringify(pmData),
    });
  }

  async updatePreventiveMaintenance(pmData: any) {
    return await apiService.request(`/pm_templates/`, {
      method: "PUT",
      body: JSON.stringify(pmData),
    });
  }

  async deletePreventiveMaintenance(id: string) {
    return await apiService.request(`/pm_templates/${id}`, {
      method: "DELETE",
    });
  }

  async getPreventiveMaintenanceById(id: string) {
    return await apiService.request(`/pm_templates/${id}`);
  }

  async getPreventiveMaintenanceFrequencyLookup() {
    return await apiService.request("/pm_templates/frequency-lookup");
  }

  async getPreventiveMaintenanceCategoryLookup() {
    return await apiService.request("/pm_templates/category-lookup");
  }

  async getPreventiveMaintenanceStatusLookup() {
    return await apiService.request("/pm_templates/status-lookup");
  }

  async getPmFilterFrequencyLookup() {
    return await apiService.request("/pm_templates/filter-frequency-lookup");
  }

  async getPmFilterStatusLookup() {
    return await apiService.request("/pm_templates/filter-status-lookup");
  }
}

export const preventiveMaintenanceApiService =
  new PreventiveMaintenanceApiService();
//ulh
