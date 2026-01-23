import { apiService } from "../api";

class InvoiceApiService {
    async getInvoices(params) {
        return await apiService.request(`/invoices/all?${params.toString()}`);
    }

    async getLeaseChargeInvoices(params) {
    return await apiService.request(
      `/invoices/all-lease-charge-invoices?${params.toString()}`
    );
    }

    async getPayments(params) {
        return await apiService.request(`/invoices/payments?${params.toString()}`);
    }

    async getWorkOrderInvoices(params) {
    return await apiService.request(
      `/invoices/all-work-order-invoices?${params.toString()}`
    );
    }

    async getInvoiceEntityLookup(params) {
    return await apiService.request(
      `/invoices/entity-lookup?${params.toString()}`
    );
    }

    async getInvoiceTotals(params) {
    return await apiService.request(
      `/invoices/invoice-totals?${params.toString()}`
    );
    }

    async getInvoiceOverview() {
    return await apiService.request("/invoices/overview");
    }

    async addInvoice(invoiceData: any) {
    return await apiService.request("/invoices/", {
      method: "POST",
            body: JSON.stringify(invoiceData),
        });
    }

    async updateInvoice(invoiceData: any) {
    return await apiService.request("/invoices/", {
      method: "PUT",
            body: JSON.stringify(invoiceData),
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
  async downloadInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}/download`, {
    method: "GET",
    headers: {
     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download invoice");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}

}//

export const invoiceApiService = new InvoiceApiService();
