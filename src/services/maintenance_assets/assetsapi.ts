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
    return await apiService.request('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  }

  async updateAsset(assetData: any) {
    return await apiService.request('/assets', {
      method: 'PUT',
      body: JSON.stringify(assetData),
    });
  }

  async deleteAsset(id: string) {
    return await apiService.request(`/assets/${id}`, {
      method: 'DELETE',
    });
  }

  /** ENSURE string[] of category names */
  async getCategories(): Promise<string[]> {
    const rows = await apiService.request('/assets/by-category'); // rows: AssetCategoryOutFilter[]
    // Safely pluck strings only
    const out = Array.from(
      new Set(
        (Array.isArray(rows) ? rows : [])
          .map((r: any) => (typeof r?.category === 'string' ? r.category.trim() : ''))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
    return out;
  }

  /** ENSURE string[] of statuses */
  async getStatuses(): Promise<string[]> {
    const rows = await apiService.request('/assets/by-status'); // rows: AssetCategoryOutFilter[]
    const out = Array.from(
      new Set(
        (Array.isArray(rows) ? rows : [])
          .map((r: any) => (typeof r?.status === 'string' ? r.status.trim() : ''))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
    return out;
  }
}

export const assetApiService = new AssetApiService();
