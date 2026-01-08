import { apiService } from '../api';

class NotificationsApiService {
    async getNotifications(data: any) {
        return await apiService.request('/notifications/all', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getNotificationCount() {
        return await apiService.request('/notifications/count');
    }

    async markAsRead(notification_id: string) {
        return await apiService.request(`/notifications/${notification_id}/read`, {
            method: 'PUT',
        });
    }

    async deleteNotification(notification_id: string) {
        return await apiService.request(`/notifications/${notification_id}`, {
            method: 'DELETE',
        });
    }

    async markAllAsRead() {
        return await apiService.request('/notifications/read-all', {
            method: 'PUT',
        });
    }

    async clearAllNotifications() {
        return await apiService.request('/notifications/actions/clear-all', {
            method: 'DELETE',
        });
    }
}

export const notificationsApiService = new NotificationsApiService();

