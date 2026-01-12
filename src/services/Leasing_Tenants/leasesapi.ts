// services/Leasing_Tenants/leasesapi.ts
import { apiService } from '../api';

class LeasesApiService {
  async getLeases(params) {
    return await apiService.request(`/leases/all?${params.toString()}`);
  }

  async getLeaseOverview(params) {
    // url like `/leases/overview?kind=...&status=...&site_id=...`
    return await apiService.request(`/leases/overview?${params.toString()}`);
  }

  async addLease(leaseData: any) {
    return await apiService.request('/leases/', {
      method: 'POST',
      body: JSON.stringify(leaseData),
    });
  }

  async updateLease(leaseData: any) {
    return await apiService.request('/leases/', {
      method: 'PUT',
      body: JSON.stringify(leaseData),
    });
  }

  async deleteLease(id: string) {
    return await apiService.request(`/leases/${id}`, {
      method: 'DELETE',
    });
  }

  async getLeaseLookup(lease_id?: any) {
    return await apiService.request('/leases/lease-lookup');
  }

  async getLeaseKindLookup() {
    return await apiService.request('/leases/kind-lookup');
  }

  async getLeaseStatusLookup() {
    return await apiService.request('/leases/status-lookup');
  }
  async getLeasePayerTypeLookup() {
    return await apiService.request('/leases/default-payer-lookup');
  }

  async getLeasePartnerLookup(kind: string, site_id: string) {
    const params = new URLSearchParams();
    if (kind) params.append("kind", kind);
    if (site_id) params.append("site_id", site_id);
    return await apiService.request(`/leases/partner-lookup?${params.toString()}`);
  }


}

export const leasesApiService = new LeasesApiService();
