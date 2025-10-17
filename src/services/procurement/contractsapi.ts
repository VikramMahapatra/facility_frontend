import { apiService } from '../api';
import { contactApiService } from '../crm/contactapi';

class ContractsApiService {
    async getContracts(params: URLSearchParams) {
        return await apiService.request(`/contracts/all?${params.toString()}`);
    }

    async getContractsOverview() {
        return await apiService.request(`/contracts/overview`);
    }

    async addContracts(data: any) {
        return await apiService.request('/contracts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateContracts(data: any) {
        return await apiService.request('/contracts', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteContracts(id: string) {
        return await apiService.request(`/contracts/${id}`, {
            method: 'DELETE',
        });
    }

    async getContractsStatusLookup() {
        return await apiService.request('/contracts/status-lookup');
    }

    async getContractsTypeLookup() {
        return await apiService.request('/contracts/type-lookup');
    }
    async getContractsFilterTypeLookup() {
        return await apiService.request('/contracts/filter-type-lookup');
    }
}

export const contractsApiService = new ContractsApiService();
