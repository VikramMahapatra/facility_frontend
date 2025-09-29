import { apiService } from '../api';

class AssetApiService {

    async getAssets(params) {
        return await apiService.request(`/assets/all?${params.toString()}`);
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

    async deleteAsset(id: any) {
        return await apiService.request(`/assets/${id}`, {
            method: 'DELETE',
        });
    }

}

export const assetApiService = new AssetApiService();