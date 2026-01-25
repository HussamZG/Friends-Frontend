import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Trash2, Link as LinkIcon, AlertCircle, X } from 'lucide-react';
import { format } from 'timeago.js';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { API_URL } from '../../config';

const Post = ({ post, onDelete }) => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const { sendNotification, socket } = useNotification();
    const [like, setLike] = useState(post.likes.length);
    const [isLiked, setIsLiked] = useState(post.likes.includes(user?.id));
    const [userFetch, setUserFetch] = useState({});
    const [comments, setComments] = useState(post.comments);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareCaption, setShareCaption] = useState('');

    const contentToShare = post.sharedFrom || {
        userId: post.userId,
        firstName: userFetch.firstName,
        lastName: userFetch.lastName,
        profilePicture: userFetch.profilePicture,
        desc: post.desc,
        img: post.img,
        createdAt: post.createdAt
    };

    useEffect(() => {
        const fetchUser = async () => {
            if (!post.userId || post.userId === 'undefined') return;
            try {
                const res = await fetch(`${API_URL}/api/users/${post.userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUserFetch(data);
                }
            } catch (err) {
                console.error("Error fetching post user:", err);
            }
        };
        fetchUser();
    }, [post.userId]);

    useEffect(() => {
        if (!socket) return;

        const handlePostUpdate = (data) => {
            if (data.postId === post._id) {
                if (data.type === 'like') {
                    setLike(data.likes.length);
                    // Update isLiked only if the list changes logic implies it for current user, 
                    // but usually we trust local action for "isLiked". 
                    // However, to sync across devices for same user:
                    setIsLiked(data.likes.includes(user?.id));
                } else if (data.type === 'comment') {
                    setComments(data.comments);
                }
            }
        };

        socket.on("post_updated", handlePostUpdate);

        return () => {
            socket.off("post_updated", handlePostUpdate);
        };
    }, [socket, post._id, user?.id]);


    const likeHandler = async () => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/posts/${post._id}/like`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id })
            });
            // Optimistic update
            setLike(isLiked ? like - 1 : like + 1);
            setIsLiked(!isLiked);
        } catch (err) { }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText) return;
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/posts/${post._id}/comment`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    text: commentText,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePicture: user.imageUrl
                })
            });
            if (res.ok) {
                // The socket update will handle the comments update for real-time consistency,
                // but we can also update optimistically if we want instant feedback before socket.
                // However, let's rely on socket or response for consistency.
                // For immediate UX, let's keep local update:
                setComments([...comments, {
                    userId: user.id,
                    text: commentText,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePicture: user.imageUrl,
                    createdAt: new Date()
                }]);
                setCommentText('');
            }
        } catch (err) { }
    };

    const handleShareLink = () => {
        const postLink = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(postLink);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        setShowShareOptions(false);
    };

    const handleShareToFeed = () => {
        setShowShareOptions(false);
        setShowShareModal(true);
    };

    const handleConfirmShare = async () => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/posts`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    desc: shareCaption,
                    sharedFrom: {
                        userId: contentToShare.userId,
                        firstName: contentToShare.firstName,
                        lastName: contentToShare.lastName,
                        profilePicture: contentToShare.profilePicture,
                        desc: contentToShare.desc,
                        img: contentToShare.img,
                        createdAt: contentToShare.createdAt || new Date()
                    }
                })
            });
            setShowShareModal(false);
            setShareCaption('');
            alert(t('post_shared'));
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t('delete_post_confirm'))) return;

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/posts/${post._id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok && onDelete) {
                onDelete(post._id);
            } else if (res.ok) {
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="card p-5 mb-6 relative hover:shadow-md transition-shadow duration-300">
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{t('share_post')}</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-3 mb-4">
                                <img src={user?.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <span className="font-semibold text-gray-900 block">{user?.firstName} {user?.lastName}</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t('nav_feed')}</span>
                                </div>
                            </div>

                            <textarea
                                className="w-full text-lg placeholder-gray-400 border-none focus:ring-0 resize-none mb-4 min-h-[80px]"
                                placeholder={t('share_placeholder')}
                                value={shareCaption}
                                onChange={(e) => setShareCaption(e.target.value)}
                                autoFocus
                            />

                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                    <img
                                        src={contentToShare.profilePicture || "https://placehold.co/40"}
                                        alt=""
                                        className="w-8 h-8 rounded-full object-cover border border-white"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm text-gray-900 block">
                                            {contentToShare.firstName} {contentToShare.lastName}
                                        </span>
                                        <span className="text-xs text-gray-500">{format(contentToShare.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="p-3">
                                    {contentToShare.desc && (
                                        <p className="text-gray-800 text-sm leading-relaxed mb-3">{contentToShare.desc}</p>
                                    )}
                                    {contentToShare.img && (
                                        <div className="rounded-lg overflow-hidden border border-gray-100">
                                            <img src={contentToShare.img} alt="" className="w-full object-cover max-h-[300px]" loading="lazy" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleConfirmShare}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm hover:shadow transition-all"
                            >
                                {t('share_now')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showToast && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 animate-in fade-in zoom-in duration-200 flex items-center gap-2">
                    <LinkIcon size={16} />
                    <span>{t('link_copied')}</span>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.userId}`}>
                        <img
                            src={userFetch.profilePicture || "https://placehold.co/50"}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover border border-gray-100"
                        />
                    </Link>
                    <div>
                        <Link to={`/profile/${post.userId}`} className="hover:underline cursor-pointer">
                            <span className="font-semibold text-gray-900 block leading-tight">
                                {userFetch.firstName} {userFetch.lastName}
                            </span>
                        </Link>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500 font-medium">{format(post.createdAt)}</span>
                            {post.sharedFrom && <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">{t('shared')}</span>}
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition active:bg-gray-200"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {showOptions && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                            {user?.id === post.userId ? (
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                                >
                                    <Trash2 size={16} />
                                    {t('delete_post')}
                                </button>
                            ) : (
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                    <AlertCircle size={16} />
                                    {t('report_post')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {post.desc && <p className="mb-4 text-gray-700 leading-relaxed text-[15px]">{post.desc}</p>}

            {post.sharedFrom ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Link to={`/profile/${post.sharedFrom.userId}`}>
                            <img
                                src={post.sharedFrom.profilePicture || "https://placehold.co/40"}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover border border-white shadow-sm"
                            />
                        </Link>
                        <div>
                            <Link to={`/profile/${post.sharedFrom.userId}`} className="hover:underline cursor-pointer">
                                <span className="font-semibold text-sm text-gray-900 block">
                                    {post.sharedFrom.firstName} {post.sharedFrom.lastName}
                                </span>
                            </Link>
                            <span className="text-xs text-gray-500">{t('original_post')} • {format(post.sharedFrom.createdAt)}</span>
                        </div>
                    </div>

                    {post.sharedFrom.desc && (
                        <p className="text-gray-800 text-[14px] leading-relaxed mb-3 pl-1">{post.sharedFrom.desc}</p>
                    )}

                    {post.sharedFrom.img && (
                        <div className="rounded-lg overflow-hidden border border-gray-200/60 shadow-sm">
                            <img src={post.sharedFrom.img} alt="" className="w-full object-cover max-h-[400px]" loading="lazy" />
                        </div>
                    )}
                </div>
            ) : (
                post.img && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-gray-100 shadow-sm">
                        <img src={post.img} alt="" className="w-full object-cover max-h-[500px]" loading="lazy" />
                    </div>
                )
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-gray-500">
                <div className="flex gap-6">
                    <button
                        onClick={likeHandler}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                        <Heart size={20} className={isLiked ? "fill-current" : ""} />
                        <span>{like}</span>
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 text-sm font-medium hover:text-indigo-600 transition-colors"
                    >
                        <MessageCircle size={20} />
                        <span>{comments.length}</span>
                    </button>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowShareOptions(!showShareOptions)}
                        className="hover:text-indigo-600 transition-colors active:scale-90 transform"
                    >
                        <Share2 size={20} />
                    </button>
                    {showShareOptions && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={handleShareLink}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors font-medium"
                            >
                                <LinkIcon size={16} />
                                {t('copy_link')}
                            </button>
                            <button
                                onClick={handleShareToFeed}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors font-medium"
                            >
                                <Share2 size={16} />
                                {t('share_to_feed')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="max-h-60 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                        {comments.length === 0 && <p className="text-center text-sm text-gray-400 py-2">{t('no_comments')}</p>}
                        {comments.map((c, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <Link to={`/profile/${c.userId}`}>
                                    <img src={c.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover mt-1" />
                                </Link>
                                <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none flex-1">
                                    <Link to={`/profile/${c.userId}`} className="hover:underline">
                                        <p className="text-xs font-bold text-gray-900 mb-0.5">{c.firstName} {c.lastName}</p>
                                    </Link>
                                    <p className="text-sm text-gray-700">{c.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleComment} className="flex gap-3 items-center">
                        <img src={user?.imageUrl} className="w-8 h-8 rounded-full border border-gray-200" />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all pr-10"
                                placeholder={t('write_comment')}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button type="submit" disabled={!commentText} className="absolute right-2 top-1.5 text-primary disabled:opacity-30 hover:scale-110 transition">
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default memo(Post);
