import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import CreatePost from '../components/Feed/CreatePost';
import Post from '../components/Feed/Post';
import Stories from '../components/Feed/Stories';
import { Loader2 } from 'lucide-react';
import FriendsLoading from '../components/UI/FriendsLoading';
import { useLanguage } from '../context/LanguageContext';

import { API_URL } from '../config';
import { fetchWithRetry } from '../utils/apiUtils';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchPosts = async () => {
            if (user) {
                try {
                    const res = await fetchWithRetry(`${API_URL}/api/posts/timeline/${user.id}`);
                    if (!res.ok) throw new Error("Failed to fetch posts");
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setPosts(data);
                    } else {
                        setPosts([]);
                    }
                } catch (err) {
                    console.error("Error fetching posts:", err);
                    setPosts([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [user]);

    if (loading) {
        return <FriendsLoading size="medium" subtitle={t('loading_home')} />;
    }

    return (
        <div className="w-full">
            <Stories />
            <CreatePost onPostCreated={(newPost) => setPosts([newPost, ...posts])} />

            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map(p => (
                        <Post key={p._id} post={p} />
                    ))
                ) : (
                    <div className="card p-10 text-center text-gray-500">
                        <p className="font-medium">{t('home_no_posts')}</p>
                        <p className="text-sm">{t('home_follow_suggestion')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
