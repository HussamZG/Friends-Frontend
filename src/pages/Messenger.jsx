import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { format } from 'timeago.js';
import { Send, Image, Search, MoreVertical, Smile, MessageCircle, ArrowLeft, Trash2, Check, User, Info } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import FriendsLoading from '../components/UI/FriendsLoading';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { fetchWithRetry } from '../utils/apiUtils';

import { API_URL } from '../config';

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

    // We removed the 3rd column state as demanded by the "mobile-like" flow request

    const { arrivalMessage, socket } = useNotification();
    const scrollRef = useRef();

    useEffect(() => {
        if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
            setMessages((prev) => [...prev, arrivalMessage]);
        }
    }, [arrivalMessage, currentChat]);

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
            conversationId: currentChat._id,
        };

        const receiverId = currentChat.members.find(member => member !== user.id);

        if (socket) {
            socket.emit("sendMessage", {
                senderId: user.id,
                receiverId,
                text: newMessage,
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

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectChat = (chat) => {
        setCurrentChat(chat);
        setShowChatList(false);
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
        <div className="card h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex overflow-hidden max-w-5xl mx-auto border-0 md:border shadow-2xl relative">
            {/* View 1: Chat Menu (Full width when active) */}
            <div className={`${showChatList ? 'flex' : 'hidden'} w-full flex-col bg-white transition-all`}>
                <div className="p-6 border-b border-gray-50 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                    <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent mb-5">{t('messenger_title')}</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                        <input
                            placeholder={t('search_placeholder')}
                            className="w-full bg-gray-50 pl-11 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/20 transition-all text-sm font-medium"
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
            <div className={`${!showChatList ? 'flex' : 'hidden'} flex-1 flex flex-col bg-[#fdfdff] min-w-0 transition-all`}>
                {currentChat ? (
                    <>
                        {/* Header */}
                        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-lg shadow-sm z-30">
                            <div className="flex items-center gap-3">
                                {/* Back button ALWAYS visible now */}
                                <button
                                    onClick={() => setShowChatList(true)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <ConversationHeader conversation={currentChat} currentUser={user} t={t} />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowConversationMenu(!showConversationMenu)}
                                    className="p-2 hover:bg-gray-50 rounded-xl transition text-gray-400 hover:text-gray-900"
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {showConversationMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={handleDeleteConversation}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={16} />
                                            {t('delete_chat')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] bg-white">
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
                                            className={`max-w-[85%] md:max-w-[60%] px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${m.sender === user.id
                                                ? 'bg-primary text-white rounded-se-none shadow-indigo-500/10'
                                                : 'bg-white/80 border border-gray-100 text-gray-800 rounded-ss-none shadow-sm backdrop-blur-sm'
                                                }`}
                                        >
                                            <p>{m.text}</p>
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
                        <div className="p-4 md:p-6 bg-white border-t border-gray-100 relative">
                            {showEmojiPicker && (
                                <div className="absolute bottom-24 left-4 md:left-20 z-50 emoji-picker-container shadow-2xl rounded-2xl">
                                    <EmojiPicker onEmojiClick={onEmojiClick} theme="light" width={300} height={400} />
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-4xl mx-auto">
                                <button type="button" className="hidden sm:flex text-gray-400 hover:text-primary transition bg-gray-50 hover:bg-indigo-50 p-3 rounded-2xl">
                                    <Image size={22} />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        className="w-full bg-gray-50 border-gray-100/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/5 border focus:bg-white focus:border-primary/30 transition-all text-[15px] font-medium placeholder:text-gray-400 shadow-inner"
                                        placeholder={t('type_message')}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
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
                                    disabled={!newMessage.trim()}
                                    className="bg-primary text-white p-4 rounded-2xl hover:bg-indigo-600 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/25 disabled:opacity-30 disabled:shadow-none"
                                >
                                    <Send size={22} className="stroke-[2.5px] ml-0.5" />
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
    );
};

const ConversationItem = ({ conversation, currentUser, active, t }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const friendId = conversation.members.find((m) => m !== currentUser.id);
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
        <div className={`flex items-center gap-4 p-4 m-1 rounded-2xl cursor-pointer transition-all border ${active ? 'bg-white border-primary/20 shadow-lg shadow-primary/10 ring-1 ring-primary/5' : 'hover:bg-gray-50/80 border-transparent shadow-none'}`}>
            <div className="relative flex-shrink-0">
                <img
                    src={user.profilePicture || "https://placehold.co/100"}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`block font-black text-[15px] truncate ${active ? 'text-primary' : 'text-gray-900'}`}>{user.firstName} {user.lastName}</h3>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter whitespace-nowrap ml-2">{format(conversation.updatedAt).split(' ')[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${active ? 'text-primary/70 font-bold' : 'text-gray-500 font-medium'}`}>{t('click_to_chat')}</p>
                </div>
            </div>
        </div>
    );
};

const ConversationHeader = ({ conversation, currentUser, t }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const friendId = conversation.members.find((m) => m !== currentUser.id);
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
                <h3 className="font-black text-gray-900 text-[15px] md:text-base leading-tight">{user.firstName} {user.lastName}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[11px] text-gray-500 font-bold tracking-tight uppercase">{t('active_now')}</span>
                </div>
            </div>
        </div>
    )
}

export default Messenger;
