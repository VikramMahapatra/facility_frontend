import { apiService } from "../api";

class TicketCategoriesApiService {

    
  async getTicketCategories(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/ticket-category/all${qs}`);
  }

  async addTicketCategory(categoryData: any) {
    return await apiService.request(`/ticket-category/`, {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  async updateTicketCategory(categoryData: any) {
    return await apiService.request(`/ticket-category/`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  async deleteTicketCategory(categoryId: string | number) {
    return await apiService.request(`/ticket-category/${categoryId}`, {
      method: "DELETE",
    });
  }

  async getAutoAssignRoleLookup() {
    return await apiService.request(`/ticket-category/auto-assign-role-lookup`);
  }

  async getStatusLookup() {
    return await apiService.request(`/ticket-category/status-lookup`);
  }

  async getSlaPolicyLookup(siteId: string) {
    const params = new URLSearchParams();
    params.append("site_id", siteId);
    return await apiService.request(`/ticket-category/sla-policy-lookup?${params.toString()}`);
  }
}

export const ticketCategoriesApiService = new TicketCategoriesApiService();