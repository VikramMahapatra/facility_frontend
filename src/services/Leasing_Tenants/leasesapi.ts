// services/Leasing_Tenants/leasesapi.ts
import { apiService } from '../api';

class LeasesApiService {
  async getLeases(url: string) {
    // url like `/leases?skip=...&limit=...&kind=...&status=...&site_id=...`
    return await apiService.request(url);
  }

  async getLeaseOverview(url: string) {
    // url like `/leases/overview?kind=...&status=...&site_id=...`
    return await apiService.request(url);
  }

  async addLease(leaseData: any) {
    return await apiService.request('/leases', {
      method: 'POST',
      body: JSON.stringify(leaseData),
    });
  }

  async updateLease(leaseData: any) {
    return await apiService.request('/leases', {
      method: 'PUT',
      body: JSON.stringify(leaseData),
    });
  }

  async deleteLease(id: string) {
    return await apiService.request(`/leases/${id}`, {
      method: 'DELETE',
    });
  }
}

export const leasesApiService = new LeasesApiService();
