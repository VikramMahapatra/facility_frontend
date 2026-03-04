import { toast } from "@/components/ui/app-toast";
import { apiService } from "../api";
import { downloadFile } from "@/helpers/fileDownloadHelper";

class InvoiceApiService {
  async getInvoices(params) {
    return await apiService.request(`/invoices/all?${params.toString()}`);
  }

  async getLeaseChargeInvoices(params) {
    return await apiService.request(
      `/invoices/all-lease-charge-invoices?${params.toString()}`,
    );
  }

  async getPayments(params) {
    return await apiService.request(`/invoices/payments?${params.toString()}`);
  }

  async getWorkOrderInvoices(params) {
    return await apiService.request(
      `/invoices/all-work-order-invoices?${params.toString()}`,
    );
  }

  async getInvoiceEntityLookup(params) {
    return await apiService.request(
      `/invoices/entity-lookup?${params.toString()}`,
    );
  }

  async getInvoiceTotals(params) {
    return await apiService.request(
      `/invoices/invoice-totals?${params.toString()}`,
    );
  }

  async getInvoiceOverview() {
    return await apiService.request("/invoices/overview");
  }

  async addInvoice(formData: FormData) {
    return await apiService.requestWithForm("/invoices/create", {
      method: "POST",
      body: formData,
    });
  }

  async updateInvoice(formData: FormData) {
    return await apiService.requestWithForm("/invoices/update", {
      method: "POST",
      body: formData,
    });
  }

  async deleteInvoice(id: any) {
    return await apiService.request(`/invoices/${id}`, {
      method: "DELETE",
    });
  }

  async getInvoiceById(id: string) {
    const params = new URLSearchParams();
    params.append("invoice_id", id);
    return await apiService.request(`/invoices/detail?${params.toString()}`, {
      method: "POST",
    });
  }

  async getInvoiceTypeLookup() {
    return await apiService.request("/invoices/invoice-type");
  }

  async getInvoicePreviewNumber() {
    return await apiService.request("/invoices/preview-number");
  }

  async getCustomerPendingCharges(
    spaceId: string,
    code?: string,
    invoice_id?: string,
  ) {
    const params = new URLSearchParams();
    params.append("space_id", spaceId);
    if (code) {
      params.append("code", code);
    }
    if (invoice_id) {
      params.append("invoice_id", invoice_id);
    }
    return await apiService.request(
      `/invoices/customer-pending-charges?${params.toString()}`,
    );
  }

  async autoGenerateInvoices(date: string) {
    const params = new URLSearchParams();
    params.append("date", date);
    return await apiService.request(
      `/invoices/auto-generate?${params.toString()}`,
      { method: "POST" },
    );
  }

  async downloadInvoice(id: string) {
    await downloadFile(
      apiService.requestBlob(`/invoices/${id}/download`),
      `Invoice_${id}.pdf`
    );
  }

  async downloadPaymentReceipt(id: string) {
    await downloadFile(
      apiService.requestBlob(`/invoices/payment-receipt/${id}/download`),
      `Invoice_Receipt_${id}.pdf`
    );
  }

  async saveInvoicePayment(paymentData: any) {
    return await apiService.request("/invoices/save-invoice-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentHistory(invoiceId: string) {
    return await apiService.request(`/invoices/payment-history/${invoiceId}`);
  }
} //

export const invoiceApiService = new InvoiceApiService();
