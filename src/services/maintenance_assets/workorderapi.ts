import { apiService } from "../api";

class WorkOrderApiService {
  async getWorkOrders(params) {
    return await apiService.request(`/workorder/all?${params.toString()}`);
  }

  async getWorkOrderOverview(params) {
    return await apiService.request(`/workorder/overview?${params.toString()}`);
  }

  async addWorkOrder(workOrderData: any) {
    return await apiService.request("/workorder/", {
      method: "POST",
      body: JSON.stringify(workOrderData),
    });
  }

  async updateWorkOrder(id: any, workOrderData: any) {
    return await apiService.request(`/workorder/${id}`, {
      method: "PUT",
      body: JSON.stringify(workOrderData),
    });
  }

  async deleteWorkOrder(id: any) {
    return await apiService.request(`/workorder/${id}`, {
      method: "DELETE",
    });
  }

  async getWorkOrderStatusLookup() {
    return await apiService.request("/workorder/status-lookup");
  }

  async getWorkOrderPriorityLookup() {
    return await apiService.request("/workorder/priority-lookup");
  }
}

export const workOrderApiService = new WorkOrderApiService();
