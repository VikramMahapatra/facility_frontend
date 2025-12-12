import { apiService } from "../api";

class TicketWorkOrderApiService {
  async getTicketWorkOrders(params: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/ticket-work-orders/all${qs}`);
  }

  async getTicketWorkOrderOverview(params: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/ticket-work-orders/overview${qs}`);
  }

  async getStatusLookup() {
    return await apiService.request(`/ticket-work-orders/lookup/status`);
  }

  async getFilterStatusLookup() {
    return await apiService.request(`/ticket-work-orders/filter-status-lookup`);
  }

  async addTicketWorkOrder(workOrderData: any) {
    return await apiService.request("/ticket-work-orders/", {
      method: "POST",
      body: JSON.stringify(workOrderData),
    });
  }

  async updateTicketWorkOrder(id: any, workOrderData: any) {
    return await apiService.request(`/ticket-work-orders/`, {
      method: "PUT",
      body: JSON.stringify({ ...workOrderData, id }),
    });
  }

  async deleteTicketWorkOrder(id: any) {
    return await apiService.request(`/ticket-work-orders/${id}`, {
      method: "DELETE",
    });
  }

  async getTicketAssignments(ticketId: string) {
    return await apiService.request(`/ticket-work-orders/tickets/${ticketId}/assignments`);
  }
}

export const ticketWorkOrderApiService = new TicketWorkOrderApiService();
