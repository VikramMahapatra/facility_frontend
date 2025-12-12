import { apiService } from "../api";

class TicketsApiService {
  async getTickets(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/tickets/all${qs}`);
  }

  async addTicket(ticketData: any) {
    return await apiService.requestWithForm(`/tickets/`, {
      method: "POST",
      body: ticketData,
    });
  }

  async getTicketById(ticketId: string | number) {
    return await apiService.request(`/tickets/tickets/${ticketId}`);
  }

  async updateTicketStatus(
    ticketId: string,
    newStatus: string,
    actionBy: string
  ) {
    return await apiService.request(`/tickets/update-status`, {
      method: "PUT",
      body: JSON.stringify({
        ticket_id: ticketId,
        new_status: newStatus,
        action_by: actionBy,
      }),
    });
  }

  async assignTicket(ticketId: string, assignedTo: string) {
    return await apiService.request(`/tickets/assign-ticket`, {
      method: "PUT",
      body: JSON.stringify({ ticket_id: ticketId, assigned_to: assignedTo }),
    });
  }

  async assignVendor(ticketId: string, vendorId: string) {
    return await apiService.request(`/tickets/assign-vendor`, {
      method: "PUT",
      body: JSON.stringify({ ticket_id: ticketId, vendor_id: vendorId }),
    });
  }

  async postComment(ticketId: string, comment: string) {
    return await apiService.request(`/tickets/post-comment`, {
      method: "POST",
      body: JSON.stringify({ ticket_id: ticketId, comment: comment }),
    });
  }

  async getEmployeesForTicket(ticketId: string | number) {
    return await apiService.request(`/ticket-category/employees/${ticketId}`);
  }

  async getNextStatuses(ticketId: string | number) {
    return await apiService.request(`/tickets/next-statuses/${ticketId}`);
  }

  async getCategoryLookup(siteId?: string | null) {
    const params = new URLSearchParams();
    if (siteId) {
      params.append("site_id", siteId);
    }
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/ticket-category/category-lookup${qs}`);
  }

  async getPriorityLookup() {
    return await apiService.request(`/tickets/filter-priority-lookup`);
  }

  async getStatusLookup() {
    return await apiService.request(`/tickets/filter-status-lookup`);
  }

  async getTicketNoLookup() {
    return await apiService.request(`/tickets/ticket-no-lookup`);
  }
}

export const ticketsApiService = new TicketsApiService();
