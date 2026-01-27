import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import EditProfileModal from '../components/Profile/EditProfileModal';
import UserListModal from '../components/Profile/UserListModal';
import Post from '../components/Feed/Post';
import FriendsLoading from '../components/UI/FriendsLoading';
import { MapPin, Calendar, Link as LinkIcon, Edit3, MessageCircle, UserPlus, Grid, Image, UserCheck, Mail } from 'lucide-react';
import { format } from 'timeago.js';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { API_URL } from '../config';

const Profile = () => {
    const { id } = useParams();
    const { user: clerkUser } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const { sendNotification } = useNotification();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('posts'); // posts, media, about
    const [currentUserData, setCurrentUserData] = useState(null);
    const [listModal, setListModal] = useState({ isOpen: false, title: '', users: [] });

    // If id is present in URL, use it (viewing other). Else use current logged in user (viewing self).
    const userIdToFetch = id || clerkUser?.id;
    const isOwnProfile = clerkUser?.id === userIdToFetch;

    // Fetch current user data for following logic
    useEffect(() => {
        const fetchMe = async () => {
            if (clerkUser && !isOwnProfile) {
                try {
                    const token = await getToken();
                    const res = await fetch(`${API_URL}/api/users/${clerkUser.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setCurrentUserData(data);
                    }
                } catch (err) { }
            }
        };
        fetchMe();
    }, [clerkUser, isOwnProfile]);

    useEffect(() => {
        const fetchData = async () => {
            if (userIdToFetch && userIdToFetch !== 'undefined') {
                try {
                    const res = await fetch(`${API_URL}/api/users/${userIdToFetch}`);
                    if (res.ok) {
                        const data = await res.json();
                        setUserProfile(data);
                    }

                    const resPosts = await fetch(`${API_URL}/api/posts/profile/${userIdToFetch}`);
                    if (resPosts.ok) {
                        const dataPosts = await resPosts.json();
                        if (Array.isArray(dataPosts)) {
                            setPosts(dataPosts.sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt)));
                        }
                    }
                } catch (err) {
                    console.error("Error fetching profile:", err);
                }
            }
        };
        fetchData();
    }, [userIdToFetch]);

    const handleFollow = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/users/${userIdToFetch}/follow`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                // Update local state to reflect follow
                setCurrentUserData(prev => ({
                    ...prev,
                    following: [...prev.following, userIdToFetch]
                }));
                // Also update the profile view to show increased follower count temporarily
                setUserProfile(prev => ({
                    ...prev,
                    followers: [...prev.followers, clerkUser.id]
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnfollow = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/users/${userIdToFetch}/unfollow`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCurrentUserData(prev => ({
                    ...prev,
                    following: prev.following.filter(id => id !== userIdToFetch)
                }));
                setUserProfile(prev => ({
                    ...prev,
                    followers: prev.followers.filter(id => id !== clerkUser.id)
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserList = async (type) => {
        try {
            const endpoint = type === 'followers' ? 'followers' : 'following';
            const res = await fetch(`${API_URL}/api/users/${userIdToFetch}/${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                setListModal({
                    isOpen: true,
                    title: type === 'followers' ? t('profile_followers') : t('profile_following'),
                    users: data
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMessage = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chat/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    senderId: clerkUser.id,
                    receiverId: userIdToFetch
                })
            });
            if (res.ok) {
                navigate("/chat");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isFollowing = currentUserData?.following?.includes(userIdToFetch) || userProfile?.followers?.includes(clerkUser?.id);
    const isRequested = userProfile?.followRequests?.includes(clerkUser?.id);


    if (!userProfile) return <FriendsLoading size="small" subtitle={t('loading_profile')} />;

    return (
        <div>
            {/* Cover & Profile Header */}
            <div className="card overflow-hidden mb-6 relative">
                <div className="h-48 md:h-64 bg-gray-200 relative">
                    {userProfile.coverPicture ? (
                        <img src={userProfile.coverPicture} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    )}
                </div>

                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col md:flex-row gap-4 items-end -mt-12 md:-mt-16 mb-4">
                        <div className="relative">
                            <img
                                src={userProfile.profilePicture || "https://placehold.co/150"}
                                alt="Profile"
                                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left pt-2 md:pt-16 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">{userProfile.firstName} {userProfile.lastName}</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">@{userProfile.firstName.toLowerCase()}</p>
                        </div>

                        <div className="flex gap-3 mb-2 w-full md:w-auto justify-center md:justify-end">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setIsEditOpen(true)}
                                    className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                                >
                                    <Edit3 size={18} />
                                    <span>{t('profile_edit')}</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={isFollowing ? handleUnfollow : (!isRequested ? handleFollow : undefined)}
                                        disabled={isRequested}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition shadow-md ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700' : (isRequested ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default shadow-none border border-gray-200 dark:border-gray-700' : 'bg-primary text-white hover:bg-indigo-600 shadow-indigo-500/20')}`}
                                    >
                                        {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                        <span>{isFollowing ? t('profile_following') : (isRequested ? t('sent') : t('profile_follow'))}</span>
                                    </button>
                                    <button
                                        onClick={handleMessage}
                                        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                                    >
                                        <MessageCircle size={18} />
                                        <span>{t('profile_message')}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col lg:flex-row justify-between items-start border-t border-gray-100 dark:border-gray-700 pt-6 gap-6">
                        <div className="space-y-3 flex-1 min-w-0 w-full">
                            {userProfile.bio && <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">{userProfile.bio}</p>}

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                {userProfile.location && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} />
                                        <span>{userProfile.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Mail size={16} />
                                    <span>{userProfile.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={16} />
                                    <span>{t('joined')} {format(userProfile.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 gap-4 lg:gap-8 mt-2 lg:mt-0 w-full lg:w-auto shrink-0 shadow-sm border border-gray-100 dark:border-gray-700/50">
                            <button
                                onClick={() => fetchUserList('followers')}
                                className="text-center hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-xl transition-colors min-w-0"
                            >
                                <span className="block text-lg md:text-xl font-bold text-gray-900 dark:text-white">{userProfile.followers?.length || 0}</span>
                                <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">{t('profile_followers')}</span>
                            </button>
                            <button
                                onClick={() => fetchUserList('following')}
                                className="text-center hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-xl transition-colors min-w-0"
                            >
                                <span className="block text-lg md:text-xl font-bold text-gray-900 dark:text-white">{userProfile.following?.length || 0}</span>
                                <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">{t('profile_following')}</span>
                            </button>
                            <div className="text-center p-2 min-w-0">
                                <span className="block text-lg md:text-xl font-bold text-gray-900 dark:text-white">{posts.length}</span>
                                <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">{t('profile_posts')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Tabs */}
                <div className="flex border-t border-gray-100 dark:border-gray-700 mt-2">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition cursor-pointer ${activeTab === 'posts' ? 'text-primary border-b-2 border-primary bg-indigo-50/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Grid size={18} />
                        {t('profile_posts')}
                    </button>
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition cursor-pointer ${activeTab === 'media' ? 'text-primary border-b-2 border-primary bg-indigo-50/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Image size={18} />
                        {t('media')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Intro / Photos (Placeholder) */}
                <div className="hidden lg:block space-y-6">
                    <div className="card p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">{t('about')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('profile_details')}</p>
                    </div>
                </div>

                {/* Right Column - Feed */}
                <div className="lg:col-span-2">
                    {posts.length > 0 ? (
                        posts.map(p => <Post key={p._id} post={p} />)
                    ) : (
                        <div className="card p-10 text-center text-gray-500">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Grid size={32} className="text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-900">{t('no_posts_yet')}</h3>
                            <p>{t('share_moment')}</p>
                        </div>
                    )}
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={userProfile}
                onUpdate={async (updatedData) => {
                    try {
                        const token = await getToken();
                        const res = await fetch(`${API_URL}/api/users/${clerkUser.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(updatedData)
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setUserProfile(data);
                            setIsEditOpen(false);
                            // Optional: Show toast here
                        }
                    } catch (err) {
                        console.error("Error updating profile", err);
                    }
                }}
            />

            <UserListModal
                isOpen={listModal.isOpen}
                onClose={() => setListModal({ ...listModal, isOpen: false })}
                title={listModal.title}
                users={listModal.users}
                currentUserId={clerkUser?.id}
                onFollowUpdate={(targetId, isFollowing) => {
                    // Refresh current user data or update local state if needed
                }}
            />
        </div>
    );
};

export default Profile;
