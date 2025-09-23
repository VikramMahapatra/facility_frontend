import { apiService } from '../api';

class SiteApiService {

    async getSites(url) {
        return await apiService.request(url);
    }

    async getSiteLookup() {
        return await apiService.request('/sites/lookup');
    }

    async addSite(siteData: any) {
        return await apiService.request('/sites', {
            method: 'POST',
            body: JSON.stringify(siteData),
        });
    }

    async update(siteData: any) {
        return await apiService.request('/sites', {
            method: 'PUT',
            body: JSON.stringify(siteData),
        });
    }

    async deleteSite(id: any) {
        return await apiService.request(`/sites/${id}`, {
            method: 'DELETE',
        });
    }

}

export const siteApiService = new SiteApiService();