const chatRepository = require('../repositories/chat.repository');
const crypto = require('crypto');

class ChatError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Найти чат между двумя пользователями (или создать новый)
function getOrCreateChat(userA, userB) {
    const chats = chatRepository.readAll();
    let chat = chats.find(
        c => c.participants.includes(userA) && c.participants.includes(userB)
    );
    if (!chat) {
        chat = {
            id: `chat-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
            participants: [userA, userB],
            messages: [],
            lastActivity: new Date().toISOString()
        };
        chats.push(chat);
        chatRepository.save(chats);
    }
    return chat;
}

function getUserChats(username) {
    const chats = chatRepository.readAll();
    return chats
        .filter(c => c.participants.includes(username))
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        .map(chat => ({
            id: chat.id,
            participants: chat.participants,
            lastActivity: chat.lastActivity,
            lastMessage: chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1].text.substring(0, 50)
                : null,
            unreadCount: 0 // можно потом добавить
        }));
}

function getMessages(chatId, pageNum = 1, pageSize = 50) {
    const chats = chatRepository.readAll();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) throw new ChatError('Chat not found', 404);

    const messages = chat.messages;
    const itemCount = messages.length;
    const pageCount = Math.max(1, Math.ceil(itemCount / pageSize));
    const start = (pageNum - 1) * pageSize;
    const items = messages.slice(start, start + pageSize);

    return { items, itemCount, pageNum, pageSize, pageCount };
}

function sendMessage(chatId, senderUsername, text) {
    const chats = chatRepository.readAll();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) throw new ChatError('Chat not found', 404);
    if (!chat.participants.includes(senderUsername))
        throw new ChatError('Not a participant', 403);

    const message = {
        id: `msg-${Date.now()}`,
        senderUsername,
        text: text.trim(),
        timestamp: new Date().toISOString()
    };
    chat.messages.push(message);
    chat.lastActivity = message.timestamp;
    chatRepository.save(chats);
    return message;
}

module.exports = {
    ChatError,
    getOrCreateChat,
    getUserChats,
    getMessages,
    sendMessage
};