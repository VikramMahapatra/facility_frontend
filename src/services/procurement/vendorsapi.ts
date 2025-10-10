import { apiService } from '../api';

class VendorsApiService {
    async getVendors(params: URLSearchParams) {
        return await apiService.request(`/vendors/all?${params.toString()}`);
    }

    async getVendorsOverview() {
        return await apiService.request(`/vendors/overview`);
    }

    async addVendors(data: any) {
        return await apiService.request('/vendors', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateVendors(data: any) {
        return await apiService.request('/vendors', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteVendors(id: string) {
        return await apiService.request(`/vendors/${id}`, {
            method: 'DELETE',
        });
    }

    async getVendorsStatusLookup() {
        return await apiService.request('/vendors/status-lookup');
    }

    async getVendorsCatgoriesLookup() {
        return await apiService.request('/vendors/categories-lookup');
    }
}

export const vendorsApiService = new VendorsApiService();
