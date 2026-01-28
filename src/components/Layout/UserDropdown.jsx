import { useUser, useClerk } from "@clerk/clerk-react";
import { useState, useRef, useEffect } from "react";
import { Settings, LogOut, User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const UserDropdown = () => {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
            >
                <div className="relative">
                    <img
                        src={user.imageUrl}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary/30 transition-all shadow-sm"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
                        <div className="flex items-center gap-4">
                            <img
                                src={user.imageUrl}
                                alt={user.fullName}
                                className="w-14 h-14 rounded-[1.25rem] object-cover shadow-lg border-2 border-white dark:border-gray-800"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-gray-900 dark:text-white truncate text-lg">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate tracking-wide">
                                    {user.primaryEmailAddress?.emailAddress}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate(`/profile/${user.id}`);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                        >
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <User size={18} />
                            </div>
                            {t('nav_profile') || 'My Profile'}
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                openUserProfile();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                        >
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                <Settings size={18} />
                            </div>
                            {t('manage_account') || 'Manage Account'}
                        </button>

                        <div className="h-px bg-gray-50 dark:bg-gray-800 mx-4 my-2"></div>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut(() => navigate("/"));
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all group"
                        >
                            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                <LogOut size={18} />
                            </div>
                            {t('sign_out') || 'Sign Out'}
                        </button>
                    </div>

                    {/* Footer Card */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 mt-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Secured by Clerk</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse delay-75"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
