import { apiService } from '../api';

class LeaseChargeApiService {
    async getLeaseCharges(params: URLSearchParams) {
        return await apiService.request(`/lease-charges/all?${params.toString()}`);
    }

    async getLeaseChargeOverview() {
        return await apiService.request(`/lease-charges/overview`);
    }

    async addLeaseCharge(data: any) {
        return await apiService.request('/lease-charges/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateLeaseCharge(data: any) {
        return await apiService.request('/lease-charges/', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteLeaseCharge(id: string) {
        return await apiService.request(`/lease-charges/${id}`, {
            method: 'DELETE',
        });
    }

    async getLeaseChargeLookup() {
        return await apiService.request('/lease-charges/charge-code-lookup');
    }

    async getTaxCodeLookup() {
        return await apiService.request('/lease-charges/tax-code-lookup');
    }

    async getLeaseMonthLookup() {
        return await apiService.request('/lease-charges/month-lookup');
    }
}

export const leaseChargeApiService = new LeaseChargeApiService();
