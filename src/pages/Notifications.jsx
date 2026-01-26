import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Bell, UserPlus, Heart, MessageSquare, Check, X } from 'lucide-react';
import { format } from 'timeago.js';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { API_URL } from '../config';

const Notifications = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const { notifications, markAsRead, sendNotification } = useNotification();
    const [followRequests, setFollowRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

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
                setFollowRequests(prev => prev.filter(r => r.clerkId !== senderId));
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

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-8 p-4 md:p-0">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">{t('nav_notifications')}</h1>
                <div className="bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl">
                    <Bell size={24} className="fill-current" />
                </div>
            </div>

            <div className="space-y-4">
                {/* 1. Requests Section (Priority) */}
                {followRequests.length > 0 && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 px-4 md:px-0 flex items-center gap-2">
                            <UserPlus size={18} />
                            {t('follow_requests')} ({followRequests.length})
                        </h2>
                        <div className="bg-idigo-50/50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-3 border border-indigo-100 dark:border-gray-700">
                            {followRequests.map(req => (
                                <div key={req._id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex items-center justify-between border border-gray-100 dark:border-gray-700">
                                    <Link to={`/profile/${req.clerkId}`} className="flex items-center gap-3">
                                        <img src={req.profilePicture || "https://placehold.co/50"} className="w-10 h-10 rounded-full object-cover" />
                                        <span className="font-bold text-gray-900 dark:text-gray-100 hover:underline">{req.firstName} {req.lastName}</span>
                                    </Link>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAccept(req.clerkId)} className="bg-primary hover:bg-indigo-700 text-white p-2 rounded-lg transition"><Check size={18} /></button>
                                        <button onClick={() => handleDecline(req.clerkId)} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 p-2 rounded-lg transition"><X size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. All Notifications */}
                {notifications.length === 0 && followRequests.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                        <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('no_results')}</p>
                    </div>
                ) : (
                    <div>
                        {notifications.map(n => {
                            const isRequest = n.type === 'follow_request' && followRequests.some(r => r.clerkId === n.senderId);

                            return (
                                <div
                                    key={n._id}
                                    className={`p-4 md:p-5 rounded-2xl flex gap-4 transition-all duration-300 border mb-3 cursor-pointer relative group ${!n.isRead
                                        ? 'bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/30 shadow-md shadow-indigo-100/50 dark:shadow-none'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                                        }`}
                                    onMouseEnter={() => !n.isRead && markAsRead(n._id)}
                                >
                                    {/* Navigation Overlay */}
                                    <Link
                                        to={['like_post', 'comment_post'].includes(n.type) ? `/post/${n.referenceId}` : `/profile/${n.senderId}`}
                                        className="absolute inset-0 z-0"
                                    />

                                    {/* Icon Type */}
                                    <div className="relative flex-shrink-0 z-10 pointer-events-none">
                                        <div className="w-12 h-12">
                                            <img src={n.senderData?.profilePicture || "https://placehold.co/50"} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white border-2 border-white dark:border-gray-800 ${n.type === 'like_post' || n.type === 'like_story' ? 'bg-red-500' :
                                            n.type === 'comment_post' ? 'bg-blue-500' : 'bg-primary'
                                            }`}>
                                            {(n.type === 'like_post' || n.type === 'like_story') && <Heart size={10} className="fill-current" />}
                                            {n.type === 'comment_post' && <MessageSquare size={10} />}
                                            {(n.type === 'follow' || n.type === 'follow_request') && <UserPlus size={10} />}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 z-10 pointer-events-none">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed">
                                                <span className="font-bold text-gray-900 dark:text-white mr-1">
                                                    {n.senderData?.firstName} {n.senderData?.lastName}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {n.type === 'like_post' && t('post_liked')}
                                                    {n.type === 'like_story' && t('story_liked')}
                                                    {n.type === 'comment_post' && "commented on your post."}
                                                    {n.type === 'follow_request' && t('follow_request_sent')}
                                                    {n.type === 'follow' && t('started_following')}
                                                </span>
                                            </p>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap ml-2">{format(n.createdAt)}</span>
                                        </div>

                                        {isRequest && (
                                            <div className="mt-3 flex gap-3 pointer-events-auto">
                                                <button onClick={(e) => { e.preventDefault(); handleAccept(n.senderId); }} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">{t('accept')}</button>
                                                <button onClick={(e) => { e.preventDefault(); handleDecline(n.senderId); }} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition">{t('decline')}</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unread Indicator */}
                                    {!n.isRead && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-2 z-10"></div>}
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
