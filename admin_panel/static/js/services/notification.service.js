const NotificationService = {

    async getNotifications() {
        const response = await api.get(
            "/notifications/"
        );

        return response;
    },

    async getUnreadCount() {
        const response = await api.get(
            "/notifications/unread-count/"
        );

        return response;
    },

    async markAsRead(notificationId) {
        const response = await api.patch(
            `/notifications/${notificationId}/read/`
        );

        return response;
    },

    async markAllAsRead() {
        const response = await api.post(
            "/notifications/mark-all-read/"
        );

        return response;
    },

};