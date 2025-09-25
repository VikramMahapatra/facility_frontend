import { apiService } from '../api';

class InvoiceApiService {

    async getInvoices(url) {
        return await apiService.request(url);
    }

    async getInvoiceOverview() {
        return await apiService.request('/invoices/overview');
    }

    async addInvoice(invoiceData: any) {
        return await apiService.request('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData),
        });
    }

    async updateInvoice(invoiceData: any) {
        return await apiService.request('/invoices', {
            method: 'PUT',
            body: JSON.stringify(invoiceData),
        });
    }

    async deleteInvoice(id: any) {
        return await apiService.request(`/invoices/${id}`, {
            method: 'DELETE',
        });
    }

}

export const invoiceApiService = new InvoiceApiService();