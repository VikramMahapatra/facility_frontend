import { apiService } from '../api';

class ParkingZoneApiService {

    async getParkingZones(params) {
        return await apiService.request(`/parking-zones/all?${params.toString()}`);
    }

    async getParkingZoneOverview() {
        return await apiService.request('/parking-zones/overview');
    }

    async addParkingZone(assetData: any) {
        return await apiService.request('/parking-zones/', {
            method: 'POST',
            body: JSON.stringify(assetData),
        });
    }

    async updateParkingZone(assetData: any) {
        return await apiService.request('/parking-zones/', {
            method: 'PUT',
            body: JSON.stringify(assetData),
        });
    }

    async deleteParkingZone(id: any) {
        return await apiService.request(`/parking-zones/${id}`, {
            method: 'DELETE',
        });
    }

}

export const parkingZoneApiService = new ParkingZoneApiService();