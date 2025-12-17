// services/maintenance_assets/assetsapi.ts
import { apiService } from '../api';

class AssetApiService {
  async getAssets(params: URLSearchParams) {
    return await apiService.request(`/assets/all?${params.toString()}`);
  }

  async getAssetLookup() {
    return await apiService.request('/assets/asset-lookup');
  }

  async getAssetOverview() {
    return await apiService.request('/assets/overview');
  }

  async addAsset(assetData: any) {
    return await apiService.request('/assets/', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  }

  async updateAsset(assetData: any) {
    return await apiService.request('/assets/', {
      method: 'PUT',
      body: JSON.stringify(assetData),
    });
  }

  async deleteAsset(id: string) {
    return await apiService.request(`/assets/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories() {
    return await apiService.request("/assets/category-lookup");
  }

  async getStatuses() {
    return await apiService.request("/assets/status-lookup");
  }

  async getAssetCategories() {
    return await apiService.request("/assets/asset-lookup");
  }
}

export const assetApiService = new AssetApiService();
