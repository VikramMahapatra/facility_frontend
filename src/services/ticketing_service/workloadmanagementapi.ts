import { apiService } from "../api";

class WorkloadManagementApiService {
  async getTeamWorkloadManagement(siteId: string) {
    const params = new URLSearchParams();
    params.append("site_id", siteId);
    return await apiService.request(`/team_workload/management?${params.toString()}`);
  }
}

export const workloadManagementApiService = new WorkloadManagementApiService();

