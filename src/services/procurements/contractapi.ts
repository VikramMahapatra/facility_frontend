import { apiService } from "../api"; //doo

class ContractApiService {
  async getContracts(params: URLSearchParams) {
    //dnoig
    const qs = params?.toString?.() ? `?${params.toString()}` : "";
    return await apiService.request(`/contracts/all${qs}`);
  }

  async getContractsOverview(params?: URLSearchParams) {
    const qs = params && params.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/contracts/overview${qs}`);
  }

  async addContract(contractData: any) {
    return await apiService.request(`/contracts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contractData),
    });
  }

  async updateContract(contractData: any) {
    return await apiService.request(`/contracts/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contractData),
    });
  }

  async deleteContract(contractId: string | number) {
    return await apiService.request(`/contracts/${contractId}`, {
      method: "DELETE",
    });
  }

  async getStatusLookup() {
    return await apiService.request(`/contracts/status-lookup`);
  }

  async getTypeLookup() {
    return await apiService.request(`/contracts/type-lookup`);
  }

  async getFilterTypeLookup() {
    return await apiService.request(`/contracts/filter-type-lookup`);
  }

  async getFilterStatusLookup() {
    return await apiService.request(`/contracts/filter-status-lookup`);
  }
}

export const contractApiService = new ContractApiService();
