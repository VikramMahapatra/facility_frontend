import { apiService } from '../api';

class ParkingSlotApiService {

    async getParkingSlots(params) {
        return await apiService.request(`/parking-slots/all?${params.toString()}`);
    }

    async getParkingSlotOverview() {
        return await apiService.request('/parking-slots/overview');
    }

    async addParkingSlot(assetData: any) {
        return await apiService.request('/parking-slots/', {
            method: 'POST',
            body: JSON.stringify(assetData),
        });
    }

    async updateParkingSlot(assetData: any) {
        return await apiService.request('/parking-slots/', {
            method: 'PUT',
            body: JSON.stringify(assetData),
        });
    }

    async deleteParkingSlot(id: any) {
        return await apiService.request(`/parking-slots/${id}`, {
            method: 'DELETE',
        });
    }


}

export const parkingSlotApiService = new ParkingSlotApiService();