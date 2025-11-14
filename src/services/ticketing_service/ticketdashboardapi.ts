import { apiService } from "../api";

class TicketDashboardApiService {
  async getCompleteDashboard(siteId: string) {
    const params = new URLSearchParams();
    params.append("site_id", siteId);
    return await apiService.request(`/ticket_dashboard/complete?${params.toString()}`);
  }
}

export const ticketDashboardApiService = new TicketDashboardApiService();

