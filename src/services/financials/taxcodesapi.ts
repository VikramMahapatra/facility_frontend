import { apiService } from '../api';

class TaxCodeApiService {

    async getTaxCodes(params: any) {
        return await apiService.request(`/tax-codes/all?${params.toString()}`);
    }

    async getTaxReturns(params: any) {
        return await apiService.request(`/tax-codes/returns?${params.toString()}`);
    }

    async getTaxOverview() {
        return await apiService.request('/tax-codes/overview');
    }

    async addTaxCode(taxCodeData: any) {
        return await apiService.request('/tax-codes/', {
            method: 'POST',
            body: JSON.stringify(taxCodeData),
        });
    }

    async updateTaxCode(taxCodeData: any) {
        return await apiService.request('/tax-codes/', {
            method: 'PUT',
            body: JSON.stringify(taxCodeData),
        });
    }

    async deleteTaxCode(id: any) {
        return await apiService.request(`/tax-codes/${id}`, {
            method: 'DELETE',
        });
    }

}

export const taxCodeApiService = new TaxCodeApiService();