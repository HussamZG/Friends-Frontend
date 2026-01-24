import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { io } from "socket.io-client";

import { API_URL, SOCKET_URL } from "../config";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const [arrivalMessage, setArrivalMessage] = useState(null);

    // Initialize Socket
    useEffect(() => {
        if (user) {
            const newSocket = io(SOCKET_URL);
            setSocket(newSocket);
            newSocket.emit("addUser", user.id);

            newSocket.on("getNotification", (data) => {
                setNotifications((prev) => [data, ...prev]);
                setUnreadCount((prev) => prev + 1);
            });

            newSocket.on("getMessage", (data) => {
                setArrivalMessage({
                    sender: data.senderId,
                    text: data.text,
                    createdAt: Date.now(),
                });
            });

            return () => newSocket.close();
        }
    }, [user]);

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (user) {
                try {
                    const token = await getToken();
                    const res = await fetch(`${API_URL}/api/notifications/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setNotifications(data);
                        setUnreadCount(data.filter(n => !n.isRead).length);
                    }
                } catch (err) {
                    console.error("Failed to fetch notifications", err);
                }
            }
        };
        fetchNotifications();
    }, [user, getToken]);

    const markAsRead = async (id) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/notifications/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.filter(n => n._id !== id));
            // Only decrement unread count if the deleted notification was unread
            setNotifications(prev => {
                const deleted = notifications.find(n => n._id === id);
                if (deleted && !deleted.isRead) {
                    setUnreadCount(count => Math.max(0, count - 1));
                }
                return prev.filter(n => n._id !== id);
            });
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/notifications/${user.id}/mark-all-read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    // Helper to send notification (for components to use)
    const sendNotification = ({ receiverId, type, referenceId }) => {
        if (socket && user && receiverId !== user.id) {
            socket.emit("sendNotification", {
                senderId: user.id,
                receiverId,
                type,
                referenceId,
            });
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            sendNotification,
            socket,
            arrivalMessage,
            setArrivalMessage
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
