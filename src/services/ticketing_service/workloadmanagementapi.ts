import { apiService } from "../api";

class WorkloadManagementApiService {
  async getTeamWorkloadManagement(siteId: string) {
    const params = new URLSearchParams();
    params.append("site_id", siteId);
    return await apiService.request(
      `/team_workload/management?${params.toString()}`
    );
  }

  async AssignTo(siteId?: string) {
    const qs = siteId ? `?site_id=${siteId}` : "";
    return await apiService.request(
      `/team_workload/workload-assigned-to-lookup${qs}`
    );
  }
}

export const workloadManagementApiService = new WorkloadManagementApiService();
