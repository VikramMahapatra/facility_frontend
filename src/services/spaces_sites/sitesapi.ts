import { apiService } from "../api";

class SiteApiService {
  async getSites(params) {
    return await apiService.request(`/sites/all?${params.toString()}`);
  }

  async getSiteLookup(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    return await apiService.request(`/sites/lookup?${params.toString()}`);
  }

  async getMasterSiteLookup(search?: string, kind?: string) {
    return await apiService.request("/master/site-lookup", {
      method: "POST",
      body: JSON.stringify({
        search: search || "",
        skip: 0,
        limit: 100,
        kind: kind || "",
      }),
    });
  }

  async addSite(siteData: any) {
    return await apiService.request("/sites/", {
      method: "POST",
      body: JSON.stringify(siteData),
    });
  }

  async update(siteData: any) {
    return await apiService.request("/sites/", {
      method: "PUT",
      body: JSON.stringify(siteData),
    });
  }

  async deleteSite(id: any) {
    return await apiService.request(`/sites/${id}`, {
      method: "DELETE",
    });
  }
}

export const siteApiService = new SiteApiService();
