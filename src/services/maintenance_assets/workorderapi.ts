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

  async getWorkOrderStatusFilterLookup() {
    return await apiService.request("/workorder/filter-status-lookup");
  }

  async getWorkOrderPriorityFilterLookup() {
    return await apiService.request("/workorder/filter-priority-lookup");
  }
}

export const workOrderApiService = new WorkOrderApiService();

//if params.status and params.status.lower() != "all":
//filters.append(func.lower(WorkOrder.status) == params.status.lower())

//if params.priority and params.priority.lower() != "all":
//filters.append(func.lower(WorkOrder.priority) == params.priority.lower())  in crud backend
