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
  
  async getLeaseLookup(lease_id?: any) {
      // let url = '/leases/lease-lookup';
      // if (lease_id) {
      //     url += `?lease_id=${lease_id}`;
      // }
        return await apiService.request('/leases/lease-lookup');
    }
    
  


  async getLeaseKindLookup() {
        return await apiService.request('/leases/kind-lookup');
    }
    



  async getLeaseStatusLookup() {
        return await apiService.request('/leases/status-lookup');
    }

}

export const leasesApiService = new LeasesApiService();
