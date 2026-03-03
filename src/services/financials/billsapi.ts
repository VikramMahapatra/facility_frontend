import { toast } from "@/components/ui/app-toast";
import { apiService } from "../api";
import { downloadFile } from "@/helpers/fileDownloadHelper";

class BillsApiService {
  async getBills(params) {
    return await apiService.request(`/bills/all?${params.toString()}`);
  }

  async getPayments(params) {
    return await apiService.request(`/bills/payments?${params.toString()}`);
  }

  async getBillEntityLookup(params) {
    return await apiService.request(
      `/bills/pending-workorder-lookup?${params.toString()}`,
    );
  }

  async getBillTotals(params) {
    return await apiService.request(`/bills/bill-totals?${params.toString()}`);
  }

  async getBillOverview() {
    return await apiService.request("/bills/overview");
  }

  async addBill(formData: FormData) {
    return await apiService.requestWithForm("/bills/create", {
      method: "POST",
      body: formData,
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
    await downloadFile(
      apiService.requestBlob(`/bills/${id}/download`),
      `Bill_${id}.pdf`
    );
  }

  async downloadPaymentReceipt(id: string) {
    await downloadFile(
      apiService.requestBlob(`/bills/payment-receipt/${id}/download`),
      `Bill_Receipt_${id}.pdf`
    );
  }

  async getBillTypeLookup() {
    return await apiService.request("/bills/bill-type-lookup");
  }

  async getVendorLookup(spaceId: string) {
    const params = new URLSearchParams();
    params.append("space_id", spaceId);
    return await apiService.request(`/bills/workorder-vendor-lookup?${params.toString()}`);
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

}

export const billsApiService = new BillsApiService();
