import { apiService } from "../api";

class BuildingApiService {
  async getBuildings(params) {
    return await apiService.request(`/buildings/all?${params.toString()}`);
  }

  async getBuildingLookup(site_id?: any) {
    let url = "/buildings/lookup";
    if (site_id) {
      url += `?site_id=${site_id}`;
    }
    return await apiService.request(url);
  }

  async getMasterBuildingLookup(
    site_id?: any,
    building_id?: any,
    space_id?: any
  ) {
    const url = "/master/building-lookup";
    const body: any = {};

    if (site_id) {
      body.site_id = site_id;
    }
    if (building_id) {
      body.building_id = building_id;
    }
    if (space_id) {
      body.space_id = space_id;
    }

    return await apiService.request(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async addBuilding(buildingData: any) {
    return await apiService.request("/buildings/", {
      method: "POST",
      body: JSON.stringify(buildingData),
    });
  }

  async updateBuilding(buildingData: any) {
    return await apiService.request("/buildings/", {
      method: "PUT",
      body: JSON.stringify(buildingData),
    });
  }

  async deleteBuilding(id: any) {
    return await apiService.request(`/buildings/${id}`, {
      // ✅ Correct URL
      method: "DELETE",
    });
  }
}

export const buildingApiService = new BuildingApiService();
