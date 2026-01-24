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

    // Initialize Socket
    useEffect(() => {
        if (user) {
            const newSocket = io(SOCKET_URL);
            setSocket(newSocket);
            newSocket.emit("addUser", user.id);

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

    // Listen for incoming notifications
    useEffect(() => {
        if (socket) {
            socket.on("getNotification", (data) => {
                setNotifications((prev) => [data, ...prev]);
                setUnreadCount((prev) => prev + 1);
            });
        }
    }, [socket]);

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
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, sendNotification, socket }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
