import { apiService } from "../api"; //dnigu

class VendorsApiService {
  async getVendors(params: URLSearchParams) {
    return await apiService.request(`/vendors/all?${params.toString()}`);
  }

  async getVendorsOverview(params?: URLSearchParams) {
    const qs = params && params.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/vendors/overview${qs}`);
  }

  async addVendor(vendorData: any) {
    return await apiService.request(`/vendors/`, {
      method: "POST",
      body: JSON.stringify(vendorData),
    });
  }

  async updateVendor(vendorData: any) {
    return await apiService.request(`/vendors/`, {
      method: "PUT",
      body: JSON.stringify(vendorData),
    });
  }

  async deleteVendor(vendorId: string | number) {
    return await apiService.request(`/vendors/${vendorId}`, {
      method: "DELETE",
    });
  }

  async getStatusLookup() {
    return await apiService.request(`/vendors/status-lookup`);
  }

  async getCategoriesLookup() {
    return await apiService.request(`/vendors/categories-lookup`);
  }

  async getFilterStatusLookup() {
    return await apiService.request(`/vendors/filter-status-lookup`);
  }

  async getFilterCategoriesLookup() {
    return await apiService.request(`/vendors/filter-categories-lookup`);
  }

  async getVendorLookup() {
    return await apiService.request(`/vendors/vendor-lookup`);
  }
}

export const vendorsApiService = new VendorsApiService();
//comit
