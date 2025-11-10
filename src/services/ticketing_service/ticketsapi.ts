import { apiService } from "../api";

class TicketsApiService {
  async getTickets(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/tickets/all${qs}`);
  }

  async addTicket(ticketData: any) {
    return await apiService.request(`/tickets/`, {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
  }
}

export const ticketsApiService = new TicketsApiService();