import { apiService } from '../api';

class AccessEventApiService {

    async getAccessEvents(params) {
        return await apiService.request(`/access-events/all?${params.toString()}`);
    }

    async getAccessEventOverview() {
        return await apiService.request('/access-events/overview');
    }

}

export const accessEventApiService = new AccessEventApiService();