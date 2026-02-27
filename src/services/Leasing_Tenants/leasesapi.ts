// services/Leasing_Tenants/leasesapi.ts
import { apiService } from "../api";

class LeasesApiService {
  async getLeases(params) {
    return await apiService.request(`/leases/all?${params.toString()}`);
  }

  async getLeaseOverview(params) {
    // url like `/leases/overview?kind=...&status=...&site_id=...`
    return await apiService.request(`/leases/overview?${params.toString()}`);
  }

  async addLease(leaseData: FormData) {
    return await apiService.requestWithForm("/leases/create", {
      method: "POST",
      body: leaseData,
    });
  }

  async updateLease(leaseData: FormData) {
    return await apiService.requestWithForm("/leases/update", {
      method: "POST",
      body: leaseData,
    });
  }

  async deleteLease(id: string) {
    return await apiService.request(`/leases/${id}`, {
      method: "DELETE",
    });
  }

  async getLeaseLookup(siteId?: any, buildingId?: any) {
    const params = new URLSearchParams();
    if (siteId) params.append("site_id", siteId);
    if (buildingId) params.append("building_id", buildingId);
    return await apiService.request(`/leases/lease-lookup?${params.toString()}`);
  }

  async getLeaseKindLookup() {
    return await apiService.request("/leases/kind-lookup");
  }

  async getLeaseStatusLookup() {
    return await apiService.request("/leases/status-lookup");
  }
  async getLeasePayerTypeLookup() {
    return await apiService.request("/leases/default-payer-lookup");
  }

  async getLeaseTenantLookup(site_id: string, space_id: string) {
    const params = new URLSearchParams();
    if (site_id) params.append("site_id", site_id);
    if (space_id) params.append("space_id", space_id);
    return await apiService.request(
      `/leases/tenant-lookup?${params.toString()}`,
    );
  }

  async getLeaseById(id: string) {
    return await apiService.request("/leases/detail", {
      method: "POST",
      body: JSON.stringify({ lease_id: id }),
    });
  }

  async getTenantLeaseDetail(tenant_id: string, space_id: string) {
    return await apiService.request(
      `/leases/tenant-lease/detail?tenant_id=${tenant_id}&space_id=${space_id}`,
    );
  }

  async addLeasePaymentTerm(leasePaymentTermData: any) {
    return await apiService.request("/leases/create-lease-payment-term", {
      method: "POST",
      body: JSON.stringify(leasePaymentTermData),
    });
  }

  async getLeasePaymentTerms(params) {
    return await apiService.request(
      `/leases/get-payment-terms?${params.toString()}`,
    );
  }

  async getTerminationRequests(params: URLSearchParams) {
    return await apiService.request(
      `/leases/termination-requests?${params.toString()}`,
    );
  }

  async approveTerminationRequest(id: string) {
    return await apiService.request(`/leases/termination-requests/${id}/approve`, {
      method: "POST",
    });
  }

  async rejectTerminationRequest(id: string) {
    return await apiService.request(`/leases/termination-requests/${id}/reject`, {
      method: "POST",
    });
  }
}

export const leasesApiService = new LeasesApiService();
