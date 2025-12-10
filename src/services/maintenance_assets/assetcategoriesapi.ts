import { apiService } from "../api";

class AssetCategoriesApiService {
  async getAssetCategories(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/asset-categories/${qs}`);
  }

  async getAssetCategoryById(categoryId: string | number) {
    return await apiService.request(`/asset-categories/${categoryId}`);
  }

  async addAssetCategory(categoryData: any) {
    return await apiService.request(`/asset-categories/`, {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  async updateAssetCategory(categoryId: string | number, categoryData: any) {
    return await apiService.request(`/asset-categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  async deleteAssetCategory(categoryId: string | number) {
    return await apiService.request(`/asset-categories/${categoryId}`, {
      method: "DELETE",
    });
  }

  async getAssetParentCategoryLookup(categoryId?: string | null) {
    const params = new URLSearchParams();
    if (categoryId) {
      params.append("category_id", categoryId);
    }
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/asset-categories/asset-parent-category-lookup${qs}`);
  }
}

export const assetCategoriesApiService = new AssetCategoriesApiService();

