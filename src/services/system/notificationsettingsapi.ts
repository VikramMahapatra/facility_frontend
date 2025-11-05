import { apiService } from '../api';

class NotificationSettingsApiService {
    async getNotificationSettings() {
        return await apiService.request('/notification-settings');
    }

    async updateNotificationSetting(settingId: string, data: any) {
        return await apiService.request(`/notification-settings/${settingId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
}

export const notificationSettingsApiService = new NotificationSettingsApiService();

