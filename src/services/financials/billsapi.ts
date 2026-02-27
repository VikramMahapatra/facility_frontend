import { apiService } from "../api";

class BillsApiService {
  async getBills(params) {
    return await apiService.request(`/bills/all?${params.toString()}`);
  }

  async getPayments(params) {
    return await apiService.request(`/bills/payments?${params.toString()}`);
  }


  async getVendorLookup(spaceId: string) {
    const params = new URLSearchParams();
    params.append("space_id", spaceId);
    return await apiService.request(`/bills/workorder-vendor-lookup?${params.toString()}`);
  }


  async getBillEntityLookup(params) {
    return await apiService.request(
      `/bills/pending-workorder-lookup?${params.toString()}`,
    );
  }

  async getBillTotals(params) {
    return await apiService.request(`/invoices/invoice-totals?${params.toString()}`);
  }

  async getBillOverview() {
    return await apiService.request("/bills/overview");
  }

  async addBill(formData: FormData) {
    return await apiService.requestWithForm("/bills/create", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }

  async updateBill(formData: FormData) {
    return await apiService.requestWithForm("/bills/update", {
      method: "POST",
      body: formData,
    });
  }

  async getBillById(id: string) {
    return await apiService.request(`/bills/${id}`);
  }

  async deleteBill(id: string) {
    return await apiService.request(`/bills/${id}`, {
      method: "DELETE",
    });
  }

  async downloadBill(id: string) {
    return await apiService.request(`/bills/${id}/download`, {
      method: "GET",
    });
  }

  async getBillTypeLookup() {
    return await apiService.request("/bills/bill-type-lookup");
  }

  async getBillPreviewNumber() {
    return await apiService.request("/bills/preview-number");
  }

  async saveBillPayment(paymentData: any) {
    return await apiService.request("/bills/save-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  // async getBillPaymentHistory(billId: string) {
  //   return await apiService.request(`/bills/payment-history/${billId}`);
  // }

}

export const billsApiService = new BillsApiService();
