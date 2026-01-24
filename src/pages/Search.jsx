import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, MapPin, UserPlus, UserCheck, Loader2, FileText, Users } from 'lucide-react';
import Post from '../components/Feed/Post';
import FriendsLoading from '../components/UI/FriendsLoading';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQuery = searchParams.get('q') || '';
    const { t } = useLanguage();

    const [query, setQuery] = useState(urlQuery);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('people'); // 'people' | 'posts'
    const [loading, setLoading] = useState(false);
    const { user: currentUser } = useUser();
    const { getToken } = useAuth();
    const [currentUserData, setCurrentUserData] = useState(null);

    // Initial load from URL
    useEffect(() => {
        if (urlQuery) {
            setQuery(urlQuery);
            performSearch(urlQuery);
        }
    }, [urlQuery]);

    // Fetch current user data to check following status
    useEffect(() => {
        const fetchMe = async () => {
            if (currentUser && currentUser.id && currentUser.id !== 'undefined') {
                try {
                    const token = await getToken();
                    const res = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setCurrentUserData(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch user data", err);
                }
            }
        };
        fetchMe();
    }, [currentUser, getToken]);

    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            // Fetch users
            const usersRes = await fetch(`${API_URL}/api/users/search?q=${searchQuery}`);
            const usersData = await usersRes.json();
            setUsers(Array.isArray(usersData) ? usersData : []);

            // Fetch posts
            const postsRes = await fetch(`${API_URL}/api/posts/search?q=${searchQuery}`);
            const postsData = await postsRes.json();
            setPosts(Array.isArray(postsData) ? postsData : []);

            // Auto switch tab based on results if one is empty
            if (usersData.length === 0 && postsData.length > 0) {
                setActiveTab('posts');
            } else if (usersData.length > 0) {
                setActiveTab('people');
            }

        } catch (err) {
            console.error(err);
            setUsers([]);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query }); // Update URL
            performSearch(query);
        }
    };

    const handleFollow = async (userId) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/users/${userId}/follow`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCurrentUserData(prev => ({
                    ...prev,
                    following: [...prev.following, userId]
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/users/${userId}/unfollow`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCurrentUserData(prev => ({
                    ...prev,
                    following: prev.following.filter(id => id !== userId)
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isFollowing = (userId) => {
        return currentUserData?.following?.includes(userId);
    };

    // Remove post from list after delete
    const handleDeletePost = (postId) => {
        setPosts(posts.filter(p => p._id !== postId));
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="card p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('explore_find')}</h1>
                <p className="text-gray-500 text-sm mb-6">{t('search_desc')}</p>

                <form onSubmit={handleSearch} className="relative mb-6">
                    <SearchIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('search_friends_placeholder')}
                        className="w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition disabled:opacity-70"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : t('nav_explore')}
                    </button>
                </form>

                {/* Tabs */}
                {loading && <FriendsLoading size="medium" subtitle={t('searching')} />}
                {(users.length > 0 || posts.length > 0) && (
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('people')}
                            className={`flex-1 pb-3 text-sm font-semibold flex justify-center items-center gap-2 transition-colors relative ${activeTab === 'people' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Users size={18} />
                            {t('profile_followers')}
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{users.length}</span>
                            {activeTab === 'people' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex-1 pb-3 text-sm font-semibold flex justify-center items-center gap-2 transition-colors relative ${activeTab === 'posts' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileText size={18} />
                            {t('profile_posts')}
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{posts.length}</span>
                            {activeTab === 'posts' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {activeTab === 'people' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {users.map(u => (
                            <div key={u._id} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <Link to={`/profile/${u.clerkId}`}>
                                        <img
                                            src={u.profilePicture || "https://placehold.co/150"}
                                            alt={u.firstName}
                                            className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm"
                                        />
                                    </Link>
                                    <div>
                                        <Link to={`/profile/${u.clerkId}`} className="font-bold text-gray-900 hover:text-primary transition">
                                            {u.firstName} {u.lastName}
                                        </Link>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <MapPin size={12} />
                                            <span>{u.location || t('unknown_location')}</span>
                                        </div>
                                    </div>
                                </div>

                                {currentUser?.id !== u.clerkId && (
                                    <button
                                        onClick={() => isFollowing(u.clerkId) ? handleUnfollow(u.clerkId) : handleFollow(u.clerkId)}
                                        className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm ${isFollowing(u.clerkId)
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-primary text-white hover:bg-indigo-600 shadow-indigo-500/20'
                                            }`}
                                    >
                                        {isFollowing(u.clerkId) ? (
                                            <>
                                                <UserCheck size={16} />
                                                <span>{t('profile_following')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={16} />
                                                <span>{t('profile_follow')}</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                        {query && users.length === 0 && !loading && (
                            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                <p>{t('no_people_found')} "{query}"</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {posts.map(post => (
                            <Post key={post._id} post={post} onDelete={handleDeletePost} />
                        ))}
                        {query && posts.length === 0 && !loading && (
                            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                <p>{t('no_posts_found')} "{query}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
