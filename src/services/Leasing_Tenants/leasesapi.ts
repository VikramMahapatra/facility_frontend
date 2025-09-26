// services/leases/leasesapi.ts
import { apiService } from '../api';

class LeasesApiService {
  async getLeases(url: string) {
    return await apiService.request(url);
  }

  async getLeaseOverview(url: string) {
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

  async deleteLease(id: any) {
    return await apiService.request(`/leases/${id}`, {
      method: 'DELETE',
    });
  }

  // Lookup helper: optionally filter lookup by space id (used to pre-fill rent, deposit etc.)
  async getLeaseLookup(space_id?: any) {
    let url = '/leases/lookup';
    if (space_id) {
      url += `?space_id=${space_id}`;
    }
    return await apiService.request(url);
  }
}

export const leasesApiService = new LeasesApiService();
