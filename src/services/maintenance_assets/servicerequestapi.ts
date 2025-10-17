import { apiService } from "../api";

class ServiceRequestApiService {
  async getServiceRequestLookup() {
    return await apiService.request("/service-requests/service-request-lookup");
  }

  async getServiceRequests(params) {
    return await apiService.request(
      `/service-requests/all?${params.toString()}`
    );
  }

  async getServiceRequestOverview(params) {
    return await apiService.request(
      `/service-requests/overview?${params.toString()}`
    );
  }

  async addServiceRequest(data: any) {
    return await apiService.request("/service-requests/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateServiceRequest(data: any) {
    return await apiService.request(`/service-requests/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteServiceRequest(id: any) {
    return await apiService.request(`/service-requests/${id}`, {
      method: "DELETE",
    });
  }

  async getServiceRequestStatusLookup() {
    return await apiService.request("/service-requests/status-lookup");
  }

  async getServiceRequestPriorityLookup() {
    return await apiService.request("/service-requests/priority-lookup");
  }

  async getServiceRequestCategoryLookup() {
    return await apiService.request("/service-requests/category-lookup");
  }
  async getServiceRequestStatusFilterLookup() {
    return await apiService.request("/service-requests/filter-status-lookup");
  }

  async getServiceRequestCategoryFilterLookup() {
    return await apiService.request("/service-requests/filter-category-lookup");
  }
  async getServiceRequestChannelLookup() {
    return await apiService.request("/service-requests/channel-lookup");
  }
  async getServiceRequestRequesterKindLookup() {
    return await apiService.request("/service-requests/requester-kind-lookup");
  }
  async getServiceRequestFilterWorkorderLookup() {
    return await apiService.request(
      "/service-requests/filter-workorderid-lookup"
    );
  }
}

export const serviceRequestApiService = new ServiceRequestApiService();
