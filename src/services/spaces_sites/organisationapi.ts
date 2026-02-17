import { apiService } from "../api";

class OrganisationApiService {
  async getOrg() {
    return await apiService.request("/orgs/get_org");
  }

  async getAllOrg() {
    return await apiService.request("/orgs/all");
  }

  async update(orgData: any) {
    return await apiService.request("/orgs/", {
      method: "PUT",
      body: JSON.stringify(orgData),
    });
  }
}

export const organisationApiService = new OrganisationApiService();
