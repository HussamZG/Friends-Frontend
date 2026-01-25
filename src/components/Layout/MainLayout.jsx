import { useEffect, useState } from 'react';
import { useUser, useAuth, UserButton } from '@clerk/clerk-react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, Heart, User, Settings as SettingsIcon, X } from 'lucide-react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import FriendsLoading from '../UI/FriendsLoading';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { format } from 'timeago.js';

const MobileNav = ({ activePath }) => {
    const { t } = useLanguage();
    const { unreadCount } = useNotification();
    const navItems = [
        { icon: Home, path: '/', label: t('nav_feed') },
        { icon: Search, path: '/search', label: t('nav_explore') },
        { icon: MessageSquare, path: '/chat', label: t('nav_messages') },
        { icon: Heart, path: '/requests', label: t('nav_notifications'), badge: unreadCount },
        { icon: User, path: '/profile', label: t('nav_profile') },
        { icon: SettingsIcon, path: '/settings', label: t('nav_settings') },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 md:hidden z-50 pb-safe">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2 rounded-xl transition relative ${activePath === item.path ? 'text-primary' : 'text-gray-400'}`}
                >
                    <item.icon size={24} />
                    {item.badge > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[17px] text-center shadow-sm">
                            {item.badge > 99 ? '99+' : item.badge}
                        </span>
                    )}
                </Link>
            ))}
        </div>
    );
};

import { API_URL } from '../../config';
import { fetchWithRetry } from '../../utils/apiUtils';

const MainLayout = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language } = useLanguage();
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotification();
    const [query, setQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const syncUser = async () => {
            if (isLoaded && user) {
                try {
                    const token = await getToken();
                    await fetchWithRetry(`${API_URL}/api/users/sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            clerkId: user.id,
                            email: user.primaryEmailAddress.emailAddress,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            profilePicture: user.imageUrl,
                        }),
                    });
                } catch (err) {
                    console.error("Failed to sync user", err);
                }
            }
        };

        syncUser();
    }, [isLoaded, user, getToken]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && query) {
            navigate(`/search?q=${query}`);
        }
    };

    if (!isLoaded) return <FriendsLoading size="medium" />;

    return (
        <div className={`min-h-screen pb-20 md:pb-0 ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 h-[70px]">
                <div className="container mx-auto px-4 h-full flex items-center justify-between max-w-7xl">
                    <Link to="/" className="text-2xl font-black text-primary tracking-tight">FRIENDS.</Link>

                    <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            className="bg-transparent outline-none w-full text-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition relative"
                            >
                                <Heart size={20} className={`text-gray-600 ${unreadCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="p-3 border-b border-gray-100 bg-white sticky top-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-gray-900">{t('nav_notifications')}</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-primary hover:underline font-medium"
                                                >
                                                    {t('mark_all_read') || 'Mark all as read'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto bg-white">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n._id}
                                                    className={`p-3 flex gap-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 group relative ${!n.isRead ? 'bg-indigo-50/50' : ''}`}
                                                >
                                                    <Link
                                                        to={n.senderData ? `/profile/${n.senderData.clerkId}` : '#'}
                                                        className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden"
                                                        onClick={() => !n.isRead && markAsRead(n._id)}
                                                    >
                                                        <img
                                                            src={n.senderData?.profilePicture || "https://placehold.co/40"}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </Link>
                                                    <div className="flex-1 cursor-pointer" onClick={() => !n.isRead && markAsRead(n._id)}>
                                                        <p className="text-sm text-gray-800 line-clamp-2">
                                                            <span className="font-semibold">
                                                                {n.senderData?.firstName} {n.senderData?.lastName}
                                                            </span>
                                                            {n.type === 'like_post' && " liked your post."}
                                                            {n.type === 'comment_post' && " commented on your post."}
                                                            {n.type === 'like_story' && " liked your story."}
                                                            {n.type === 'follow' && " follows you."}
                                                        </p>
                                                        <span className="text-xs text-gray-400 block mt-1">{format(n.createdAt)}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2">
                                                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(n._id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-all text-gray-400 hover:text-red-500"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "w-10 h-10 border border-gray-200 shadow-sm hover:scale-105 transition-all",
                                    userButtonPopoverCard: "rounded-2xl border border-gray-100 shadow-2xl overflow-hidden p-2",
                                    userButtonPopoverActionButton: "hover:bg-indigo-50 transition-all rounded-xl",
                                    userButtonPopoverActionButtonText: "text-gray-700 font-semibold text-[14px]",
                                    userButtonPopoverActionButtonIcon: "text-indigo-600",
                                    userButtonPopoverHeader: "border-none pt-4 px-4 pb-2",
                                    userButtonPopoverFooter: "hidden",
                                    userPreviewMainIdentifier: "text-gray-900 font-bold text-base",
                                    userPreviewSecondaryIdentifier: "text-gray-500 font-medium",
                                }
                            }}
                        />
                    </div>
                </div>
            </nav>

            {/* Main Layout Grid */}
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Sidebar (Navigation) */}
                    <div className="hidden md:block md:col-span-3 lg:col-span-3">
                        <LeftSidebar />
                    </div>

                    {/* Main Content (Feed/Pages) */}
                    <div className="col-span-1 md:col-span-9 lg:col-span-6">
                        <Outlet />
                    </div>

                    {/* Right Sidebar (Widgets) */}
                    <div className="hidden lg:block lg:col-span-3">
                        <RightSidebar />
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <MobileNav activePath={location.pathname} />
        </div>
    );
};

export default MainLayout;
