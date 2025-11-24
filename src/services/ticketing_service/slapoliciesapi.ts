import { apiService } from "../api";

class SLAPoliciesApiService {
  async getSLAPolicies(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/sla-policies/all${qs}`);
  }

  async getSLAPoliciesOverview() {
    return await apiService.request(`/sla-policies/overview`);
  }

  async createSLAPolicy(policyData: any) {
    return await apiService.request(`/sla-policies/`, {
      method: "POST",
      body: JSON.stringify(policyData),
    });
  }

  async updateSLAPolicy(policyData: any) {
    return await apiService.request(`/sla-policies/`, {
      method: "PUT",
      body: JSON.stringify(policyData),
    });
  }

  async deleteSLAPolicy(policyId: string) {
    return await apiService.request(`/sla-policies/${policyId}`, {
      method: "DELETE",
    });
  }

  async getServiceCategoryLookup() {
    return await apiService.request(`/sla-policies/service-category-lookup`);
  }

  async getUserContactLookup() {
    return await apiService.request(`/sla-policies/user-contact-lookup`);
  }

  async getOrgLookup() {
    return await apiService.request(`/sla-policies/org-lookup`);
  }
}

export const slaPoliciesApiService = new SLAPoliciesApiService();

