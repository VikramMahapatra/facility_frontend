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
    if (paymentData instanceof FormData) {
      return await apiService.requestWithForm("/bills/save-bill-payment", {
        method: "POST",
        body: paymentData,
      });
    }
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

  // Get invoices for a specific customer user (for received payments)
  async getCustomerInvoices(customerUserId: string) {
    return await apiService.request(
      `/invoices/${customerUserId}/customer-invoices`,
    );
  }

  // Get bills for a specific customer user (for made payments)
  async getCustomerBills(customerUserId: string) {
    return await apiService.request(
      `/bills/${customerUserId}/customer-bills`,
    );
  }

  // Lookup customers eligible for payments, based on payment type
  async getPaymentCustomers(paymentType: "received" | "made") {
    const params = new URLSearchParams();
    params.append("payment_type", paymentType);
    return await apiService.request(
      `/payments/customers?${params.toString()}`,
    );
  }

  // Lookup open items (invoices/bills) for a customer to link payments against
  async getCustomerOpenItems(
    paymentType: "received" | "made",
    customerId: string,
  ) {
    const params = new URLSearchParams();
    params.append("payment_type", paymentType);
    params.append("customer_id", customerId);
    return await apiService.request(
      `/payments/customer-open-items?${params.toString()}`,
    );
  }
}

export const paymentsApiService = new PaymentsApiService();
