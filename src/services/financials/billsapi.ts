import { apiService } from "../api";

class BillsApiService {
  async getBills(params) {
    return await apiService.request(`/bills/all?${params.toString()}`);
  }

  async getPayments(params) {
    return await apiService.request(`/bills/payments?${params.toString()}`);
  }

  async getBillEntityLookup(params) {
    return await apiService.request(
      `/bills/entity-lookup?${params.toString()}`,
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
    return await apiService.request(`/bills/${id}/download`, {
      method: "GET",
    });
  }

  async getBillTypeLookup() {
    return await apiService.request("/bills/bill-type-lookup");
  }
}

export const billsApiService = new BillsApiService();
