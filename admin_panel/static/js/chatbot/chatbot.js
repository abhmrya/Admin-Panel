/**
 * ==========================================================
 * Chatbot Controller
 * ==========================================================
 */

const Chatbot = {

    currentConversation: null,
    isLoading: false,
    elements: {},

    async init() {
        this.cacheDOM();
        this.bindEvents();
        await this.loadConversations();
    },

    cacheDOM() {
        this.elements = {
            chatContainer: document.getElementById("chat-container"),
            conversationList: document.getElementById("conversation-list"),
            messageInput: document.getElementById("message-input"),
            sendButton: document.getElementById("send-btn"),
            newChatButton: document.getElementById("new-chat-btn")
        };
    },

    bindEvents() {
        this.elements.sendButton.addEventListener("click", () => this.sendMessage());

        this.elements.messageInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                this.sendMessage();
            }
        });

        this.elements.newChatButton.addEventListener("click", () => this.startNewConversation());

        this.elements.conversationList.addEventListener("click", (event) => {
            const card = event.target.closest("[data-id]");
            if (!card) return;
            this.loadConversation(card.dataset.id);
        });
    },

    async sendMessage() {
        if (this.isLoading) return;

        const message = this.elements.messageInput.value.trim();
        if (!message) return;

        this.isLoading = true;
        this.renderUserMessage(message);
        this.clearInput();

        const loading = this.renderLoading();

        try {
            const response = await ChatbotService.sendMessage(message, this.currentConversation);
            loading.remove();

            this.renderAIMessage(response.response);
            this.currentConversation = response.conversation_id;

            await this.loadConversations();
            this.highlightConversation(this.currentConversation);
        } catch (error) {
            loading.remove();
            this.renderError(error.message || "Something went wrong.");
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    },

    clearInput() {
        this.elements.messageInput.value = "";
        this.elements.messageInput.focus();
    },

    async loadConversations() {
        try {
            const data = await ChatbotService.getConversations();
            // Handle DRF Pagination (results array) or direct array fallback
            const conversations = data.results ? data.results : data;
            this.renderConversationList(conversations);
        } catch (error) {
            console.error("Failed to load conversations.", error);
            this.elements.conversationList.innerHTML = `
                <div class="p-4 text-center text-xs text-red-500">
                    Failed to load chats.
                </div>
            `;
        }
    },

    async loadConversation(conversationId) {
        try {
            const conversation = await ChatbotService.getConversation(conversationId);
            this.currentConversation = conversation.id;
            this.renderMessages(conversation.messages);
            this.highlightConversation(conversation.id);
        } catch (error) {
            console.error("Failed to load conversation.", error);
        }
    },

    startNewConversation() {
        this.currentConversation = null;
        this.elements.chatContainer.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">
                    AI
                </div>
                <div class="max-w-2xl rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-5 py-4 shadow-xs">
                    <p class="text-xs sm:text-sm leading-relaxed text-gray-700">
                        👋 <strong class="text-gray-900 font-semibold">Welcome!</strong>
                        <br><br>
                        Ask anything about your Admin Panel, Users, Roles, Permissions, Django, APIs, Database or anything else.
                    </p>
                </div>
            </div>
        `;
        this.highlightConversation(null);
        this.elements.messageInput.focus();
    },

    renderConversationList(conversations) {
        const list = this.elements.conversationList;
        list.innerHTML = "";

        if (!conversations || !Array.isArray(conversations) || conversations.length === 0) {
            list.innerHTML = `
                <div class="p-5 text-center text-xs text-gray-400">
                    No conversations found.
                </div>
            `;
            return;
        }

        conversations.forEach(conversation => {
            const active = conversation.id === this.currentConversation
                ? "bg-blue-50/80 border-l-4 border-blue-600"
                : "hover:bg-gray-100/60";

            list.insertAdjacentHTML(
                "beforeend",
                `
                <div
                    data-id="${conversation.id}"
                    class="cursor-pointer border-b border-gray-100 p-3.5 transition rounded-r-lg ${active}">
                    <h4 class="truncate text-xs font-semibold text-gray-800">
                        ${this.escapeHTML(conversation.title)}
                    </h4>
                    <p class="mt-1 truncate text-[11px] text-gray-500">
                        ${this.escapeHTML(conversation.last_message ?? "")}
                    </p>
                </div>
                `
            );
        });
    },

    renderMessages(messages) {
        this.elements.chatContainer.innerHTML = "";

        if (!messages || messages.length === 0) {
            this.startNewConversation();
            return;
        }

        messages.forEach(message => {
            if (message.role === "user") {
                this.renderUserMessage(message.content);
            } else {
                this.renderAIMessage(message.content);
            }
        });

        this.scrollBottom();
    },

    highlightConversation(conversationId) {
        const cards = this.elements.conversationList.querySelectorAll("[data-id]");
        cards.forEach(card => {
            card.classList.remove("bg-blue-50/80", "border-l-4", "border-blue-600");
            card.classList.add("hover:bg-gray-100/60");

            if (card.dataset.id === String(conversationId)) {
                card.classList.remove("hover:bg-gray-100/60");
                card.classList.add("bg-blue-50/80", "border-l-4", "border-blue-600");
            }
        });
    },

    escapeHTML(text = "") {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },

    renderUserMessage(message) {
        const safeMessage = this.escapeHTML(message).replace(/\n/g, "<br>");

        this.elements.chatContainer.insertAdjacentHTML(
            "beforeend",
            `
            <div class="flex justify-end">
                <div class="max-w-xl rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-xs sm:text-sm text-white shadow-sm">
                    ${safeMessage}
                </div>
            </div>
            `
        );

        this.scrollBottom();
    },

    renderAIMessage(message) {
        let parsedMessage = message;
        if (typeof marked !== "undefined") {
            try {
                parsedMessage = marked.parse(message);
            } catch (e) {
                parsedMessage = this.escapeHTML(message).replace(/\n/g, "<br>");
            }
        } else {
            parsedMessage = this.escapeHTML(message).replace(/\n/g, "<br>");
        }

        this.elements.chatContainer.insertAdjacentHTML(
            "beforeend",
            `
            <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">
                    AI
                </div>
                <div class="max-w-2xl rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-5 py-4 shadow-xs text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
                    ${parsedMessage}
                </div>
            </div>
            `
        );

        if (typeof hljs !== "undefined") {
            this.elements.chatContainer.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

        this.scrollBottom();
    },

    renderLoading() {
        const wrapper = document.createElement("div");
        wrapper.className = "flex items-start gap-3";
        wrapper.innerHTML = `
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">
                AI
            </div>
            <div class="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-5 py-4 shadow-xs">
                <div class="flex gap-1.5 items-center h-5">
                    <span class="h-2 w-2 animate-bounce rounded-full bg-blue-600"></span>
                    <span class="h-2 w-2 animate-bounce rounded-full bg-blue-600" style="animation-delay:.15s"></span>
                    <span class="h-2 w-2 animate-bounce rounded-full bg-blue-600" style="animation-delay:.30s"></span>
                </div>
            </div>
        `;

        this.elements.chatContainer.appendChild(wrapper);
        this.scrollBottom();
        return wrapper;
    },

    renderError(message) {
        this.elements.chatContainer.insertAdjacentHTML(
            "beforeend",
            `
            <div class="flex">
                <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-600">
                    ${this.escapeHTML(message)}
                </div>
            </div>
            `
        );
        this.scrollBottom();
    },

    scrollBottom() {
        requestAnimationFrame(() => {
            this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
        });
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await Chatbot.init();
});