import { apiService } from '../api';

class VisitorApiService {

    async getVisitors(params) {
        return await apiService.request(`/visitors/all?${params.toString()}`);
    }

    async getVisitorOverview() {
        return await apiService.request('/visitors/overview');
    }

    async addVisitor(data: any) {
        return await apiService.request('/visitors/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateVisitor(data: any) {
        return await apiService.request('/visitors/', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteVisitor(id: any) {
        return await apiService.request(`/visitors/${id}`, {
            method: 'DELETE',
        });
    }

}

export const visitorApiService = new VisitorApiService();