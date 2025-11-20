import { apiService } from "../api";

class SLAPoliciesApiService {
  async getSLAPolicies(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/sla-policy/all${qs}`);
  }

  async addSLAPolicy(policyData: any) {
    return await apiService.request(`/sla-policy/`, {
      method: "POST",
      body: JSON.stringify(policyData),
    });
  }

  async updateSLAPolicy(policyData: any) {
    return await apiService.request(`/sla-policy/`, {
      method: "PUT",
      body: JSON.stringify(policyData),
    });
  }

  async deleteSLAPolicy(policyId: string) {
    return await apiService.request(`/sla-policy/${policyId}`, {
      method: "DELETE",
    });
  }
}

export const slaPoliciesApiService = new SLAPoliciesApiService();

