import { apiService } from '../api';

class MeterReadingApiService {

    async getMeters(params: any) {
        return await apiService.request(`/meters/all?${params.toString()}`);
    }

    async addMeter(data: any) {
        return await apiService.request('/meters', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateMeter(data: any) {
        return await apiService.request('/meters', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteMeter(id: any) {
        return await apiService.request(`/meters/${id}`, {
            method: 'DELETE',
        });
    }

    async getReadingOverview() {
        return await apiService.request('/meter-readings/overview');
    }

    async getMeterReadings(params: any) {
        return await apiService.request(`/meter-readings/all?${params.toString()}`);
    }

    async getMeterReadingLookup() {
        return await apiService.request('/meter-readings/meter-reading-lookup');
    }

    async getMetersLookup() {
        return await apiService.request('/meters/meter-lookup');
    }

    async addMeterReading(data: any) {
        return await apiService.request('/meter-readings', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateMeterReading(data: any) {
        return await apiService.request('/meter-readings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteMeterReading(id: any) {
        return await apiService.request(`/meter-readings/${id}`, {
            method: 'DELETE',
        });
    }

}

export const meterReadingApiService = new MeterReadingApiService();