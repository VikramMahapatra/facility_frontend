import { apiService } from '../api';

class LeaseChargeCodesApiService {
    async getLeaseChargeCodes(params?: URLSearchParams) {
        const qs = params?.toString() ? `?${params.toString()}` : "";
        return await apiService.request(`/lease-charge-codes/all${qs}`);
    }

    async addLeaseChargeCode(data: any) {
        return await apiService.request('/lease-charge-codes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateLeaseChargeCode(data: any) {
        return await apiService.request(`/lease-charge-codes/${data.id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteLeaseChargeCode(id: string) {
        return await apiService.request(`/lease-charge-codes/${id}`, {
            method: 'DELETE',
        });
    }
}

export const leaseChargeCodesApiService = new LeaseChargeCodesApiService();

