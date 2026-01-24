import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { io } from "socket.io-client";
import { format } from 'timeago.js';
import { Send, Image, Search, Phone, Video, MoreVertical, Smile, MessageCircle } from 'lucide-react';
import FriendsLoading from '../components/UI/FriendsLoading';
import { useLanguage } from '../context/LanguageContext';

import { API_URL, SOCKET_URL } from '../config';

const Messenger = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const socket = useRef();
    const scrollRef = useRef();

    useEffect(() => {
        socket.current = io(SOCKET_URL);
        socket.current.on("getMessage", (data) => {
            setArrivalMessage({
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now(),
            });
        });
    }, []);

    useEffect(() => {
        arrivalMessage &&
            currentChat?.members.includes(arrivalMessage.sender) &&
            setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        if (user) {
            socket.current.emit("addUser", user.id);
        }
    }, [user]);

    useEffect(() => {
        const getConversations = async () => {
            if (user) {
                const token = await getToken();
                try {
                    const res = await fetch(`${API_URL}/api/chat/conversations/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) setConversations(data);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };
        getConversations();
    }, [user]);

    useEffect(() => {
        const getMessages = async () => {
            if (currentChat) {
                const token = await getToken();
                try {
                    const res = await fetch(`${API_URL}/api/chat/messages/${currentChat._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setMessages(data);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };
        getMessages();
    }, [currentChat]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            sender: user.id,
            text: newMessage,
            conversationId: currentChat._id,
        };

        const receiverId = currentChat.members.find(member => member !== user.id);

        socket.current.emit("sendMessage", {
            senderId: user.id,
            receiverId,
            text: newMessage,
        });

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
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="card h-[calc(100vh-140px)] flex overflow-hidden">
            {/* Chat Menu */}
            <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-white">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('messenger_title')}</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            placeholder={t('search_chats')}
                            className="w-full bg-gray-50 pl-10 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.map((c) => (
                        <div key={c._id} onClick={() => setCurrentChat(c)}>
                            <Conversation
                                conversation={c}
                                currentUser={user}
                                active={currentChat?._id === c._id}
                                t={t}
                            />
                        </div>
                    ))}
                    {conversations.length === 0 && <p className="text-gray-400 text-center mt-10 text-sm">{t('no_conversations')}</p>}
                </div>
            </div>

            {/* Chat Box */}
            <div className="flex-1 flex flex-col bg-[#fcfdff]">
                {currentChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                            <ConversationHeader conversation={currentChat} currentUser={user} t={t} />
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map((m, i) => (
                                <div key={i} ref={scrollRef} className={`flex flex-col ${m.sender === user.id ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${m.sender === user.id
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        <p>{m.text}</p>
                                    </div>
                                    <span className="text-[11px] text-gray-400 mt-1.5 px-1">{format(m.createdAt)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                                <button type="button" className="text-gray-400 hover:text-primary transition bg-gray-50 p-2 rounded-full">
                                    <Image size={20} />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        className="w-full bg-gray-50 border-0 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[15px]"
                                        placeholder={t('type_message')}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-orange-500 transition">
                                        <Smile size={20} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-primary text-white p-3 rounded-full hover:bg-indigo-600 transition shadow-md shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none"
                                >
                                    <Send size={20} className="stroke-[2.5px] ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <MessageCircle size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">{t('your_messages_title')}</h3>
                        <p className="max-w-xs text-center text-sm">{t('your_messages_desc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Conversation = ({ conversation, currentUser, active, t }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const friendId = conversation.members.find((m) => m !== currentUser.id);
        const getUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/${friendId}`);
                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error(err);
            }
        };
        getUser();
    }, [currentUser, conversation]);

    if (!user) return null;

    return (
        <div className={`flex items-center gap-4 p-3 m-2 rounded-xl cursor-pointer transition-colors ${active ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'}`}>
            <div className="relative">
                <img
                    src={user.profilePicture || "https://placehold.co/50"}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
                <span className={`block font-semibold text-[15px] ${active ? 'text-primary' : 'text-gray-900'}`}>{user.firstName} {user.lastName}</span>
                <span className="text-xs text-gray-500 block mt-0.5">{t('click_to_chat')}</span>
            </div>
        </div>
    );
};

const ConversationHeader = ({ conversation, currentUser, t }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const friendId = conversation.members.find((m) => m !== currentUser.id);
        const getUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/${friendId}`);
                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error(err);
            }
        };
        getUser();
    }, [currentUser, conversation]);

    if (!user) return <FriendsLoading size="small" subtitle={t('loading_contact')} />;
    return (
        <>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img
                        src={user.profilePicture || "https://placehold.co/50"}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-[15px]">{user.firstName} {user.lastName}</h3>
                    <span className="text-xs text-green-500 font-medium">{t('active_now')}</span>
                </div>
            </div>
            <div className="flex gap-4 text-primary">
                <button className="p-2 hover:bg-indigo-50 rounded-full transition"><Phone size={20} /></button>
                <button className="p-2 hover:bg-indigo-50 rounded-full transition"><Video size={20} /></button>
                <button className="p-2 hover:bg-indigo-50 rounded-full transition"><MoreVertical size={20} /></button>
            </div>
        </>
    )
}

export default Messenger;
