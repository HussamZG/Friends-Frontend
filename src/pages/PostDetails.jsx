import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';
import Post from '../components/Feed/Post';
import FriendsLoading from '../components/UI/FriendsLoading';
import { ArrowLeft } from 'lucide-react';

const PostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { getToken } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = await getToken();
                // We need an endpoint to get a single post. 
                // Assuming GET /api/posts/:id exists or we need to add it.
                // Let's check postController logic later, but mostly likely it needs to be added or verify if it exists.
                // Actually, existing controller had getTimelinePosts, getUserPosts. 
                // We need to ADD getPostById to controller.

                const res = await fetch(`${API_URL}/api/posts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setPost(data);
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                setError('Failed to load post');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, getToken]);

    if (loading) return (
        <div className="flex justify-center pt-20">
            <FriendsLoading size="large" />
        </div>
    );

    if (error || !post) return (
        <div className="text-center pt-20">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Post not found</h2>
            <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">Go Back</button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">{t('go_back')}</span>
            </button>

            <Post post={post} />
        </div>
    );
};

export default PostDetails;
