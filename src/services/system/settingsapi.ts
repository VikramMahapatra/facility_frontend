import { apiService } from "../api";

class SettingsApiService {
  async getSettings() {
    return await apiService.request("/system-settings/system-settings");
  }

  async updateSettings(settingId: string, data: any) {
    return await apiService.request(
      `/system-settings/system-settings/${settingId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }
}

export const settingsApiService = new SettingsApiService();
