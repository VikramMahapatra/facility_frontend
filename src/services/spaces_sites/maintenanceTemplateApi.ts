import { apiService } from "../api";

class MaintenanceTemplateApiService {
  async getMaintenanceTemplates(params: URLSearchParams) {
    return await apiService.request(
      `/maintenance-templates/all?${params.toString()}`
    );
  }

  async addMaintenanceTemplate(templateData: any) {
    return await apiService.request("/maintenance-templates/", {
      method: "POST",
      body: JSON.stringify(templateData),
    });
  }

  async updateMaintenanceTemplate(templateData: any) {
    return await apiService.request("/maintenance-templates/", {
      method: "PUT",
      body: JSON.stringify(templateData),
    });
  }

  async deleteMaintenanceTemplate(template_id: string) {
    return await apiService.request(`/maintenance-templates/${template_id}`, {
      method: "DELETE",
    });
  }

  async getMaintenanceTemplateLookup(params: URLSearchParams) {
    return await apiService.request(`/maintenance-templates/lookup?${params.toString()}`);
  }
}

export const maintenanceTemplateApiService = new MaintenanceTemplateApiService();
