import { Link, useLocation } from 'react-router-dom';
import { Home, User, Search, MessageSquare, Heart, Settings, LogOut } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 mb-2 ${active
            ? 'bg-primary text-white shadow-lg shadow-indigo-500/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
    >
        <Icon size={22} className={active ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
        <span className="font-medium text-[15px]">{label}</span>
    </Link>
);

const LeftSidebar = () => {
    const location = useLocation();
    const { signOut } = useClerk();
    const { t } = useLanguage();
    const { unreadCount } = useNotification();

    return (
        <div className="sticky top-24 w-full">
            <div className="card p-4">
                <div className="mb-4 px-2">
                    <SidebarItem icon={Home} label={t('nav_feed')} path="/" active={location.pathname === '/'} />
                    <SidebarItem icon={Search} label={t('nav_explore')} path="/search" active={location.pathname === '/search'} />
                    <SidebarItem icon={MessageSquare} label={t('nav_messages')} path="/chat" active={location.pathname === '/chat'} />
                    <div className="relative">
                        <SidebarItem icon={Heart} label={t('nav_notifications')} path="/notifications" active={location.pathname === '/notifications'} />
                        {unreadCount > 0 && (
                            <span className="absolute right-3 top-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-md">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </div>
                    <SidebarItem icon={User} label={t('nav_profile')} path="/profile" active={location.pathname === '/profile'} />
                    <SidebarItem icon={Settings} label={t('nav_settings')} path="/settings" active={location.pathname === '/settings'} />
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2 px-2">
                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                        <LogOut size={22} />
                        <span className="font-medium text-[15px]">{t('nav_signout')}</span>
                    </button>
                </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-400">
                <p>&copy; 2026 Friends Social.</p>
                <p>Designed with ❤️</p>
            </div>
        </div>
    );
};

export default LeftSidebar;
