import { apiService } from "../api";

class ParkingSlotApiService {
  async getParkingSlots(params) {
    return await apiService.request(`/parking-slots/all?${params.toString()}`);
  }

  async getParkingSlotOverview() {
    return await apiService.request("/parking-slots/overview");
  }

  async addParkingSlot(assetData: any) {
    return await apiService.request("/parking-slots/", {
      method: "POST",
      body: JSON.stringify(assetData),
    });
  }

  async updateParkingSlot(assetData: any) {
    return await apiService.request("/parking-slots/", {
      method: "PUT",
      body: JSON.stringify(assetData),
    });
  }

  async deleteParkingSlot(id: any) {
    return await apiService.request(`/parking-slots/${id}`, {
      method: "DELETE",
    });
  }

  async updateSpaceParkingSlots(data: any) {
    return await apiService.request(
      "/parking-slots/update-space-parking-slots",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async getAvailableSlotLookup(params?: URLSearchParams) {
    let url = "/parking-slots/available-slot-lookup";
    if (params && params.toString()) {
      url += `?${params.toString()}`;
    }
    return await apiService.request(url, {
      method: "GET",
    });
  }


  async getAllSlotLookup(params?: URLSearchParams) {
    let url = "/parking-slots/all-slot-lookup";
    if (params && params.toString()) {
      url += `?${params.toString()}`;
    }
    return await apiService.request(url, {
      method: "GET",
    });
  }

  async bulkUploadParkingSlots(payload: any) {
    return await apiService.request("/parking-slots/bulk-upload", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const parkingSlotApiService = new ParkingSlotApiService();
