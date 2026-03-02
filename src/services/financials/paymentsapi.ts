import { apiService } from "../api";

class PaymentsApiService {
  // Received payments (from invoices)
  async getReceivedPayments(params: URLSearchParams) {
    return await apiService.request(
      `/invoices/payments?${params.toString()}`,
    );
  }

  // Made payments (from bills)
  async getMadePayments(params: URLSearchParams) {
    return await apiService.request(
      `/bills/payments?${params.toString()}`,
    );
  }

  // Record a payment against an invoice
  async recordInvoicePayment(paymentData: any) {
    return await apiService.request("/invoices/save-invoice-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  // Record a payment against a bill
  async recordBillPayment(paymentData: any) {
    return await apiService.request("/bills/save-bill-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  // Lookup invoices for payment (unpaid/partial)
  async getInvoiceLookup(params?: URLSearchParams) {
    const qs = params ? `?${params.toString()}` : "";
    return await apiService.request(`/invoices/all${qs}`);
  }

  // Lookup bills for payment (approved/partial)
  async getBillLookup(params?: URLSearchParams) {
    const qs = params ? `?${params.toString()}` : "";
    return await apiService.request(`/bills/all${qs}`);
  }
}

export const paymentsApiService = new PaymentsApiService();
