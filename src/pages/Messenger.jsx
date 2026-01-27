import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { format } from 'timeago.js';
import { Send, Image, Search, MoreVertical, Smile, MessageCircle, ArrowLeft, Trash2, Check, User, Info, X, Loader2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import FriendsLoading from '../components/UI/FriendsLoading';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { fetchWithRetry } from '../utils/apiUtils';

import { API_URL } from '../config';
import { IKContext, IKUpload } from 'imagekitio-react';

const Messenger = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showChatList, setShowChatList] = useState(true);
    const [showOptionsId, setShowOptionsId] = useState(null);
    const [showConversationMenu, setShowConversationMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [img, setImg] = useState(null);
    const [uploading, setUploading] = useState(false);

    // We removed the 3rd column state as demanded by the "mobile-like" flow request

    const { arrivalMessage, socket, onlineUsers, clearUnreadMessages } = useNotification();
    const scrollRef = useRef();

    useEffect(() => {
        if (arrivalMessage) {
            // 1. If message is for current open chat, add to messages
            if (currentChat?.members.includes(arrivalMessage.sender)) {
                setMessages((prev) => [...prev, arrivalMessage]);
            }

            // 2. Always update conversation list: move to top and update unread if not open
            setConversations(prev => {
                const convIndex = prev.findIndex(c => c.members.includes(arrivalMessage.sender));
                if (convIndex > -1) {
                    const conv = prev[convIndex];
                    const isChattingWithSender = currentChat?.members.includes(arrivalMessage.sender);

                    const updatedConv = {
                        ...conv,
                        updatedAt: new Date().toISOString(),
                        unreadCount: isChattingWithSender ? 0 : (conv.unreadCount || 0) + 1
                    };

                    const filtered = prev.filter((_, i) => i !== convIndex);
                    return [updatedConv, ...filtered];
                }
                return prev;
            });
        }
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        // Clear unread messages when entering chat page
        clearUnreadMessages();
    }, []);

    useEffect(() => {
        const getConversations = async () => {
            if (user) {
                const token = await getToken();
                try {
                    const res = await fetchWithRetry(`${API_URL}/api/chat/conversations/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) setConversations(data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
                    }
                } catch (err) { }
            }
        };
        getConversations();
    }, [user, getToken]);

    useEffect(() => {
        const getMessages = async () => {
            if (currentChat) {
                const token = await getToken();
                try {
                    const res = await fetchWithRetry(`${API_URL}/api/chat/messages/${currentChat._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setMessages(data);
                    }
                } catch (err) { }
            }
        };
        getMessages();
    }, [currentChat, getToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            sender: user.id,
            text: newMessage,
            img: img,
            conversationId: currentChat._id,
        };

        const receiverId = currentChat.members.find(member => member !== user.id);

        if (socket) {
            socket.emit("sendMessage", {
                senderId: user.id,
                receiverId,
                text: newMessage,
                img: img,
            });
        }

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chat/messages`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(message),
            });
            const data = await res.json();
            setMessages([...messages, data]);
            setNewMessage("");
            setImg(null);
            setShowEmojiPicker(false);

            setConversations(prev => {
                const updatedIndex = prev.findIndex(c => c._id === currentChat._id);
                if (updatedIndex > -1) {
                    const updated = { ...prev[updatedIndex], updatedAt: new Date().toISOString() };
                    const filtered = prev.filter(c => c._id !== currentChat._id);
                    return [updated, ...filtered];
                }
                return prev;
            });

        } catch (err) { }
    };

    const handleDeleteConversation = async () => {
        if (!window.confirm(t('confirm_delete'))) return;
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/chat/conversations/${currentChat._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(conversations.filter(c => c._id !== currentChat._id));
            setCurrentChat(null);
            setShowConversationMenu(false);
            setShowChatList(true); // Always go back to list
        } catch (err) { }
    };

    const handleDeleteMessage = async (msgId) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/chat/messages/${msgId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(messages.filter(m => m._id !== msgId));
        } catch (err) { }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const onUploadSuccess = (res) => {
        setImg(res.url);
        setUploading(false);
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectChat = async (chat) => {
        setCurrentChat(chat);
        setShowChatList(false);

        // Mark as read
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/chat/messages/${chat._id}/${user.id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state to clear unread count for this conversation
            setConversations(prev => prev.map(c =>
                c._id === chat._id ? { ...c, unreadCount: 0 } : c
            ));
        } catch (err) { }
    };

    // Close emoji picker when clicking outside (simple logic handling)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showEmojiPicker && !e.target.closest('.emoji-picker-container') && !e.target.closest('.emoji-trigger')) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showEmojiPicker]);

    return (
        <IKContext
            publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
            urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
            authenticator={async () => {
                const response = await fetch(`${API_URL}/api/imagekit/auth`);
                return await response.json();
            }}
        >
            <div className="card h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex overflow-hidden max-w-5xl mx-auto border-0 md:border shadow-2xl relative">
                {/* View 1: Chat Menu (Full width when active) */}
                <div className={`${showChatList ? 'flex' : 'hidden'} w-full flex-col bg-white dark:bg-gray-900 transition-all`}>
                    <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-20">
                        <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent mb-5">{t('messenger_title')}</h2>
                        <div className="relative">
                            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                            <input
                                placeholder={t('search_placeholder')}
                                className="w-full bg-gray-50 dark:bg-gray-800 pl-11 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/20 transition-all text-sm font-medium text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {conversations.map((c) => (
                            <div key={c._id} onClick={() => handleSelectChat(c)}>
                                <ConversationItem
                                    conversation={c}
                                    currentUser={user}
                                    active={currentChat?._id === c._id}
                                    t={t}
                                    onlineUsers={onlineUsers}
                                />
                            </div>
                        ))}
                        {conversations.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                <MessageCircle size={32} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium">{t('no_conversations')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* View 2: Chat Box (Full width when active) */}
                <div className={`${!showChatList ? 'flex' : 'hidden'} flex-1 flex flex-col bg-[#fdfdff] dark:bg-gray-950 min-w-0 transition-all`}>
                    {currentChat ? (
                        <>
                            {/* Header */}
                            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm z-30">
                                <div className="flex items-center gap-3">
                                    {/* Back button ALWAYS visible now */}
                                    <button
                                        onClick={() => setShowChatList(true)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <ConversationHeader conversation={currentChat} currentUser={user} t={t} onlineUsers={onlineUsers} />
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowConversationMenu(!showConversationMenu)}
                                        className="p-2 hover:bg-gray-50 rounded-xl transition text-gray-400 hover:text-gray-900"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {showConversationMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <button
                                                onClick={handleDeleteConversation}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                {t('delete_chat')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] bg-white dark:bg-gray-950">
                                {messages.map((m, i) => (
                                    <div
                                        key={m._id || i}
                                        ref={scrollRef}
                                        className={`group flex flex-col ${m.sender === user.id ? 'items-end' : 'items-start'}`}
                                        onMouseEnter={() => setShowOptionsId(m._id)}
                                        onMouseLeave={() => setShowOptionsId(null)}
                                    >
                                        <div className={`flex items-center gap-2 ${m.sender === user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div
                                                className={`max-w-[85%] md:max-w-[60%] rounded-2xl shadow-sm text-[15px] leading-relaxed relative flex flex-col overflow-hidden ${m.sender === user.id
                                                    ? 'bg-primary text-white rounded-se-none shadow-indigo-500/10'
                                                    : 'bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-ss-none shadow-sm backdrop-blur-sm'
                                                    }`}
                                            >
                                                {m.storyContext && (
                                                    <div className={`p-2 mb-1 flex items-center gap-2 border-b ${m.sender === user.id ? 'bg-white/10 border-white/10' : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'}`}>
                                                        <div className="w-10 h-14 md:w-12 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border border-black/10">
                                                            <img src={m.storyContext.thumbnail} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${m.sender === user.id ? 'text-white/70' : 'text-gray-400'}`}>
                                                                {t('story_reply') || 'Story Reply'}
                                                            </span>
                                                            <span className="text-xs font-bold truncate opacity-90">
                                                                {m.storyContext.firstName}'s {t('story') || 'story'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {m.img && (
                                                    <div className="p-1">
                                                        <img
                                                            src={m.img}
                                                            alt="Sent image"
                                                            className="w-full max-h-60 object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
                                                            onClick={() => window.open(m.img, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                                <div className="px-4 py-3">
                                                    <p>{m.text}</p>
                                                </div>
                                            </div>

                                            {m.sender === user.id && showOptionsId === m._id && (
                                                <button
                                                    onClick={() => handleDeleteMessage(m._id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors animate-in fade-in duration-200"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1.5 px-1 opacity-60">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{format(m.createdAt)}</span>
                                            {m.sender === user.id && <Check size={10} className="text-primary" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            {/* Input Area */}
                            <div className="p-4 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-24 left-4 md:left-20 z-50 emoji-picker-container shadow-2xl rounded-2xl">
                                        <EmojiPicker onEmojiClick={onEmojiClick} theme="light" width={300} height={400} />
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-4xl mx-auto">
                                    <label className="hidden sm:flex text-gray-400 hover:text-primary transition bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-3 rounded-2xl cursor-pointer">
                                        <Image size={22} />
                                        <IKUpload
                                            className="hidden"
                                            onSuccess={onUploadSuccess}
                                            onUploadStart={() => setUploading(true)}
                                        />
                                    </label>
                                    <div className="flex-1 relative">
                                        <input
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100/50 dark:border-gray-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/5 border focus:bg-white dark:focus:bg-gray-900 focus:border-primary/30 transition-all text-[15px] font-medium placeholder:text-gray-400 dark:text-white shadow-inner"
                                            placeholder={t('type_message')}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        {img && (
                                            <div className="absolute -top-20 left-0 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-2">
                                                <div className="relative group">
                                                    <img src={img} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                                                    <button
                                                        onClick={() => setImg(null)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="emoji-trigger absolute right-4 top-4 text-gray-300 hover:text-orange-500 transition"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        >
                                            <Smile size={22} />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={(uploading || (!newMessage.trim() && !img))}
                                        className="bg-primary text-white p-4 rounded-2xl hover:bg-indigo-600 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/25 disabled:opacity-30 disabled:shadow-none"
                                    >
                                        {uploading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} className="stroke-[2.5px] ml-0.5" />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        // Fallback should technically not be reached if showChatList logic is strict, but good to have
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8">
                            <MessageCircle size={48} className="opacity-20 animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
        </IKContext>
    );
};

const ConversationItem = ({ conversation, currentUser, active, t, onlineUsers = [] }) => {
    const [user, setUser] = useState(null);
    const friendId = conversation.members.find((m) => m !== currentUser.id);
    const isOnline = onlineUsers.includes(friendId);

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/${friendId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) { }
        };
        getUser();
    }, [currentUser, conversation]);

    if (!user) return <div className="h-20 bg-gray-50/50 animate-pulse rounded-2xl m-2"></div>;

    return (
        <div className={`flex items-center gap-4 p-4 m-1 rounded-2xl cursor-pointer transition-all border ${active ? 'bg-white dark:bg-gray-800 border-primary/20 shadow-lg shadow-primary/10 ring-1 ring-primary/5' : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-transparent shadow-none'}`}>
            <div className="relative flex-shrink-0">
                <img
                    src={user.profilePicture || "https://placehold.co/100"}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                />
                {isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`block font-black text-[15px] truncate ${active ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>{user.firstName} {user.lastName}</h3>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter whitespace-nowrap ml-2">{format(conversation.updatedAt).split(' ')[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${active ? 'text-primary/70 font-bold' : (conversation.unreadCount > 0 ? 'text-gray-900 dark:text-white font-black' : 'text-gray-500 font-medium')}`}>
                        {conversation.unreadCount > 0 ? t('new_message') || 'New message' : t('click_to_chat')}
                    </p>
                    {conversation.unreadCount > 0 && (
                        <div className="bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-primary/20 animate-bounce">
                            {conversation.unreadCount}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ConversationHeader = ({ conversation, currentUser, t, onlineUsers = [] }) => {
    const [user, setUser] = useState(null);
    const friendId = conversation.members.find((m) => m !== currentUser.id);
    const isOnline = onlineUsers.includes(friendId);

    useEffect(() => {
        if (!friendId || friendId === 'undefined') return;

        const getUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/${friendId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) { }
        };
        getUser();
    }, [currentUser, conversation]);

    if (!user) return <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse"></div><div className="w-24 h-4 bg-gray-100 rounded animate-pulse"></div></div>;

    return (
        <div className="flex items-center gap-3">
            <img
                src={user.profilePicture || "https://placehold.co/100"}
                alt=""
                className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
                <h3 className="font-black text-gray-900 dark:text-white text-[15px] md:text-base leading-tight">{user.firstName} {user.lastName}</h3>
                {isOnline && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-[11px] text-gray-500 font-bold tracking-tight uppercase">{t('active_now')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messenger;
