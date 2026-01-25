import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Bell, UserPlus, Heart, MessageSquare, Check, X, User } from 'lucide-react';
import { format } from 'timeago.js';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { API_URL } from '../config';

const Notifications = () => {
    const { user } = useUser(); // User object contains up-to-date followRequests
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const { notifications, markAsRead, sendNotification } = useNotification();
    const [followRequests, setFollowRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    // Fetch details for follow requests (pending users)
    // We get the list of IDs from the user object, but we need their names/pics
    useEffect(() => {
        const fetchRequestDetails = async () => {
            if (user?.followRequests?.length > 0) {
                setLoadingRequests(true);
                try {
                    const requesterPromises = user.followRequests.map(id =>
                        fetch(`${API_URL}/api/users/${id}`).then(r => r.ok ? r.json() : null)
                    );
                    const results = (await Promise.all(requesterPromises)).filter(r => r !== null);
                    setFollowRequests(results);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingRequests(false);
                }
            } else {
                setFollowRequests([]);
            }
        };
        fetchRequestDetails();
    }, [user?.followRequests]);


    const handleAccept = async (senderId) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/users/${senderId}/accept`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                // Optimistically update: Remove from followRequests list
                setFollowRequests(prev => prev.filter(r => r.clerkId !== senderId));

                // If user object updates automatically via Clerk/SWR revalidation, great.
                // If not, we might manually need to reload or rely on next fetch.
                await user.reload();

                sendNotification({
                    receiverId: senderId,
                    type: 'follow',
                    referenceId: user.id
                });
            }
        } catch (err) { console.error(err); }
    };

    const handleDecline = async (senderId) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/users/${senderId}/decline`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            setFollowRequests(prev => prev.filter(r => r.clerkId !== senderId));
            await user.reload();
        } catch (err) { console.error(err); }
    };

    // Combine notifications and requests for display?
    // User asked for "Notifications... MUST include everything".
    // Strategy: Show a unified list sorted by time? 
    // Requests usually go to top or separate section. 
    // Most apps have "New Follow Requests" at top, then "Earlier".
    // I will merge them visually.

    // Actually, "notifications" from context ALREADY includes "follow" type notifications.
    // BUT those notifications don't have the "Accept/Decline" logic embedded nicely.
    // I'll check if a notification is of type 'follow' AND if the sender is currently in `followRequests`.

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-8 p-4 md:p-0">
                <h1 className="text-3xl font-black text-gray-900">{t('nav_notifications')}</h1>
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                    <Bell size={24} className="fill-current" />
                </div>
            </div>

            <div className="space-y-4">
                {/* 1. Requests Section (Priority) */}
                {followRequests.length > 0 && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h2 className="text-lg font-bold text-gray-700 mb-4 px-4 md:px-0 flex items-center gap-2">
                            <UserPlus size={18} />
                            {t('follow_requests')} ({followRequests.length})
                        </h2>
                        <div className="bg-indigo-50/50 rounded-2xl p-4 space-y-3 border border-indigo-100">
                            {followRequests.map(req => (
                                <div key={req._id} className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between">
                                    <Link to={`/profile/${req.clerkId}`} className="flex items-center gap-3">
                                        <img src={req.profilePicture || "https://placehold.co/50"} className="w-10 h-10 rounded-full object-cover" />
                                        <span className="font-bold text-gray-900 hover:underline">{req.firstName} {req.lastName}</span>
                                    </Link>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAccept(req.clerkId)} className="bg-primary hover:bg-indigo-700 text-white p-2 rounded-lg transition"><Check size={18} /></button>
                                        <button onClick={() => handleDecline(req.clerkId)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition"><X size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. All Notifications */}
                {notifications.length === 0 && followRequests.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">{t('no_results')}</p>
                    </div>
                ) : (
                    <div>
                        {notifications.map(n => {
                            const isRequest = n.type === 'follow' && followRequests.some(r => r.clerkId === n.senderId);
                            // If it's a request that is ALSO in the requests list, we might hide it here to avoid duplication,
                            // OR we show it but with the buttons.
                            // Let's show buttons here too for convenience if it's pending.

                            return (
                                <div
                                    key={n._id}
                                    className={`p-4 md:p-5 rounded-2xl flex gap-4 transition-all duration-300 border mb-3 ${!n.isRead ? 'bg-white border-indigo-100 shadow-md shadow-indigo-100/50' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                    onMouseEnter={() => !n.isRead && markAsRead(n._id)}
                                >
                                    {/* Icon Type */}
                                    <div className="relative flex-shrink-0">
                                        <Link to={`/profile/${n.senderId}`}>
                                            <img src={n.senderData?.profilePicture || "https://placehold.co/50"} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                        </Link>
                                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white border-2 border-white ${n.type === 'like_post' ? 'bg-red-500' :
                                                n.type === 'comment_post' ? 'bg-blue-500' : 'bg-primary'
                                            }`}>
                                            {n.type === 'like_post' && <Heart size={10} className="fill-current" />}
                                            {n.type === 'comment_post' && <MessageSquare size={10} />}
                                            {n.type === 'follow' && <UserPlus size={10} />}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[15px] text-gray-800 leading-relaxed">
                                                <Link to={`/profile/${n.senderId}`} className="font-bold text-gray-900 hover:underline mr-1">
                                                    {n.senderData?.firstName} {n.senderData?.lastName}
                                                </Link>
                                                <span className="text-gray-600">
                                                    {n.type === 'like_post' && t('story_liked')} {/* Translation reuse: roughly "Liked" */}
                                                    {n.type === 'comment_post' && "commented on your post."}
                                                    {n.type === 'follow' && "started following you."}
                                                </span>
                                            </p>
                                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2">{format(n.createdAt)}</span>
                                        </div>

                                        {/* Actions for Follow Request inside general list (if redundant but helpful) */}
                                        {isRequest && (
                                            <div className="mt-3 flex gap-3">
                                                <button onClick={() => handleAccept(n.senderId)} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">{t('accept')}</button>
                                                <button onClick={() => handleDecline(n.senderId)} className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition">{t('decline')}</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unread Indicator */}
                                    {!n.isRead && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-2"></div>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
