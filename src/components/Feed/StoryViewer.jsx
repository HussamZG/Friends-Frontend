import { useState, useEffect } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, MessageCircle, Trash2, Users } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { format } from 'timeago.js';
import { API_URL } from '../../config';

const StoryViewer = ({ stories, initialIndex, onClose, onDelete }) => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const { sendNotification } = useNotification();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [replyText, setReplyText] = useState("");
    const [liked, setLiked] = useState(false);
    const [showViewers, setShowViewers] = useState(false);
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [showSentToast, setShowSentToast] = useState(false);

    const currentStory = stories[currentIndex];

    // Check if liked whenever current story changes
    useEffect(() => {
        if (currentStory && user) {
            setLiked(currentStory.likes?.includes(user.id));
        }
    }, [currentStory, user]);

    // Auto-advance logic (optional, for now simple manual nav)

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose(); // Close if at end
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleLike = async () => {
        // Optimistic UI update
        const isLiked = !liked;
        setLiked(isLiked);

        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/stories/${currentStory._id}/like`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id })
            });

            if (isLiked && currentStory.userId !== user.id) {
                sendNotification({
                    receiverId: currentStory.userId,
                    type: 'like_story',
                    referenceId: currentStory._id
                });
            }
        } catch (err) {
            console.error(err);
            setLiked(!isLiked); // Revert on error
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || isSendingReply) return;

        setIsSendingReply(true);

        try {
            const token = await getToken();

            // 1. Create/Get Conversation
            const convRes = await fetch(`${API_URL}/api/chat/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    senderId: user.id,
                    receiverId: currentStory.userId
                })
            });
            const conversation = await convRes.json();

            // 2. Send Message with Story Context
            const msgData = {
                conversationId: conversation._id,
                sender: user.id,
                text: replyText,
                storyContext: {
                    storyId: currentStory._id,
                    thumbnail: currentStory.img,
                    firstName: currentStory.firstName
                }
            };

            const msgRes = await fetch(`${API_URL}/api/chat/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(msgData)
            });
            const savedMsg = await msgRes.json();

            // Emit via socket
            if (socket) {
                socket.emit("sendMessage", {
                    senderId: user.id,
                    receiverId: currentStory.userId,
                    text: replyText,
                    storyContext: msgData.storyContext
                });
                // Also trigger a message notification for the red badge
                socket.emit("sendNotification", {
                    receiverId: currentStory.userId,
                    type: 'message', // Generic type to trigger unread message count
                });
            }

            // 3. Send Notification for reply
            if (currentStory.userId !== user.id) {
                sendNotification({
                    receiverId: currentStory.userId,
                    type: 'reply_story',
                    referenceId: currentStory._id
                });
            }

            setReplyText("");
            setShowSentToast(true);
            setTimeout(() => setShowSentToast(false), 3000);

            // Optional: Close story viewer after a delay if desired, but clearing text is the priority
            // setTimeout(() => onClose(), 2000); 

        } catch (err) {
            console.error(err);
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t('confirm_delete') || "Are you sure you want to delete this story?")) return;

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/stories/${currentStory._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                onDelete(currentStory._id);
                if (stories.length === 1) {
                    onClose();
                } else {
                    handleNext();
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!currentStory) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center backdrop-blur-sm">
            {/* Close Button - Moved slightly left to avoid extreme edge on mobile */}
            <button onClick={onClose} className="absolute top-4 right-4 md:right-8 text-white hover:text-gray-300 z-50 p-2">
                <X size={32} />
            </button>

            {/* Success Toast */}
            {showSentToast && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-full shadow-2xl z-[70] animate-in fade-in zoom-in slide-in-from-top-4 duration-300 flex items-center gap-2 border border-white/20">
                    <Check size={20} className="stroke-[3px]" />
                    <span className="font-bold text-sm tracking-wide">{t('reply_sent') || 'Reply Sent!'}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="relative w-full max-w-md h-full md:h-[90vh] bg-black md:rounded-2xl overflow-hidden flex flex-col">

                {/* Header (User Info) */}
                <div className="absolute top-0 left-0 w-full p-4 pr-16 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center gap-3">
                    <img
                        src={currentStory.profilePicture || "https://placehold.co/40"}
                        alt=""
                        className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{currentStory.firstName} {currentStory.lastName}</p>
                        <p className="text-gray-300 text-xs">{format(currentStory.createdAt)}</p>
                    </div>

                    {currentStory.userId === user?.id && (
                        <button
                            onClick={handleDelete}
                            className="text-white/70 hover:text-red-500 transition-colors p-2"
                            title={t('delete') || 'Delete'}
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>

                {/* Story Image */}
                <div className="flex-1 flex items-center justify-center bg-gray-900 relative">
                    <img
                        src={currentStory.img}
                        alt="Story"
                        className="max-h-full max-w-full object-contain"
                    />

                    {/* Navigation Overlays */}
                    <div className="absolute inset-0 flex">
                        <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev}></div>
                        <div className="w-1/3 h-full cursor-pointer" onClick={handleNext}></div>
                        <div className="w-1/3 h-full cursor-pointer" onClick={handleNext}></div>
                    </div>
                </div>

                {/* Footer (Interactions) */}
                <div className="absolute bottom-0 left-0 w-full p-4 pb-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10">
                    {currentStory.userId === user?.id ? (
                        /* Owner View - Show viewers/reactions count */
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => setShowViewers(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full transition-all"
                            >
                                <Heart size={20} className="fill-red-500 text-red-500" />
                                <span className="text-sm font-semibold text-white">
                                    {currentStory.likes?.length || 0} {t('story_liked') || 'likes'}
                                </span>
                                <div className="w-px h-4 bg-white/20 mx-1"></div>
                                <Users size={16} className="text-gray-300" />
                                <span className="text-xs text-gray-300">{t('viewers') || 'Viewers'}</span>
                            </button>
                        </div>
                    ) : (
                        /* Viewer View - Show reply and like */
                        <div className="flex items-center gap-4">
                            <form onSubmit={handleReply} className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder={t('reply_placeholder') || "Reply to story..."}
                                    className="w-full bg-transparent border border-gray-500 rounded-full px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-primary text-sm backdrop-blur-sm"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={isSendingReply}
                                />
                                <button
                                    type="submit"
                                    className={`absolute right-2 top-2 text-white hover:text-primary transition-colors ${isSendingReply ? 'opacity-50' : ''}`}
                                    disabled={isSendingReply}
                                >
                                    <Send size={18} className={isSendingReply ? 'animate-pulse' : ''} />
                                </button>
                            </form>

                            <button onClick={handleLike} className="flex flex-col items-center gap-1 min-w-[40px]">
                                <Heart
                                    size={28}
                                    className={`transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-white hover:scale-110'}`}
                                />
                            </button>
                        </div>
                    )}
                </div>

                {/* Viewers List Modal Overlap */}
                {showViewers && (
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gray-900 rounded-t-3xl z-40 p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Users size={20} className="text-primary" />
                                {t('viewers') || 'Viewers'} ({currentStory.likeDetails?.length || 0})
                            </h3>
                            <button onClick={() => setShowViewers(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            {currentStory.likeDetails?.length > 0 ? (
                                currentStory.likeDetails.map((viewer) => (
                                    <div key={viewer.clerkId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={viewer.profilePicture || "https://placehold.co/40"} className="w-10 h-10 rounded-full border border-gray-700 object-cover" />
                                            <div>
                                                <p className="text-white text-sm font-semibold">{viewer.firstName} {viewer.lastName}</p>
                                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{t('liked_story') || 'Liked Story'}</p>
                                            </div>
                                        </div>
                                        <Heart size={16} className="fill-red-500 text-red-500" />
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                                    <Users size={48} className="opacity-10" />
                                    <p className="text-sm">{t('no_viewers_yet') || 'No viewers yet'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Navigation Arrows */}
            <button
                onClick={handlePrev}
                className={`hidden md:block absolute left-4 text-white/50 hover:text-white transition ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
            >
                <ChevronLeft size={48} />
            </button>
            <button
                onClick={handleNext}
                className="hidden md:block absolute right-4 text-white/50 hover:text-white transition"
            >
                <ChevronRight size={48} />
            </button>
        </div>
    );
};

export default StoryViewer;
