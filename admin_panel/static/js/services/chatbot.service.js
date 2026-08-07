/**
 * ==========================================================
 * Chatbot Service
 * ==========================================================
 * Handles all chatbot API requests.
 * ==========================================================
 */

const ChatbotService = {

    /**
     * Send Message
     */
    async sendMessage(message, conversationId = null) {

        const payload = {
            message
        };


        if (conversationId) {
            payload.conversation_id = conversationId;
        }


        return Api.post(
            APP_CONFIG.ENDPOINTS.CHAT,
            payload
        );

    },


    /**
     * Get All Conversations
     */
    async getConversations() {

        return Api.get(
            APP_CONFIG.ENDPOINTS.CHAT_CONVERSATIONS
        );

    },


    /**
     * Get Single Conversation
     */
    async getConversation(id) {

        return Api.get(
            `${APP_CONFIG.ENDPOINTS.CHAT_CONVERSATIONS}${id}/`
        );

    },


    /**
     * Delete Conversation
     */
    async deleteConversation(id) {

        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.CHAT_CONVERSATIONS}${id}/`
        );

    },


    /**
     * Rename Conversation
     */
    async renameConversation(id, title) {

        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.CHAT_CONVERSATIONS}${id}/`,
            {
                title
            }
        );

    }

};


window.ChatbotService = Object.freeze(ChatbotService);