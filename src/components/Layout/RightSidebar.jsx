import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { API_URL } from '../../config';

const RightSidebar = () => {
    const { user: clerkUser } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const { sendNotification } = useNotification();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followed, setFollowed] = useState([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/users/suggestions`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, [getToken]);

    const handleFollow = async (userId) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/users/${userId}/follow`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Optimistic / Local Update: Remove from suggestions
            setFollowed([...followed, userId]);
            setSuggestions(prev => prev.filter(s => s.clerkId !== userId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="sticky top-24 w-full space-y-6">
            <div className="card p-5">
                <h3 className="font-bold text-gray-700 mb-4">{t('suggested_for_you')}</h3>
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-sm text-gray-400">{t('loading_suggestions')}</p>
                    ) : !Array.isArray(suggestions) || suggestions.length === 0 ? (
                        <p className="text-sm text-gray-400">{t('no_suggestions')}</p>
                    ) : (
                        suggestions.map((user) => (
                            <div key={user._id} className="flex items-center justify-between">
                                <Link to={`/profile/${user.clerkId}`} className="flex items-center gap-3 hover:opacity-80 transition">
                                    <img
                                        src={user.profilePicture || "https://placehold.co/40"}
                                        alt=""
                                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{t('suggested_for_you').split(' ')[0]}</p>
                                    </div>
                                </Link>
                                {followed.includes(user.clerkId) || (user.followRequests && user.followRequests.includes(clerkUser.id)) ? (
                                    <button className="text-xs text-green-600 font-bold flex items-center gap-1 cursor-default">
                                        <UserCheck size={14} />
                                        <span>{t('sent')}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFollow(user.clerkId)}
                                        className="text-xs text-primary font-bold hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                                    >
                                        <UserPlus size={14} />
                                        <span>{t('profile_follow')}</span>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RightSidebar;
