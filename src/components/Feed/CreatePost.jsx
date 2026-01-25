import { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { Image, X, Smile, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../config';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const [desc, setDesc] = useState('');
    const [img, setImg] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showFeelings, setShowFeelings] = useState(false);

    const feelings = [
        { name: t('feeling_happy'), emoji: '😃' },
        { name: t('feeling_loved'), emoji: '❤️' },
        { name: t('feeling_sad'), emoji: '😢' },
        { name: t('feeling_celebrating'), emoji: '🎉' },
        { name: t('feeling_thinking'), emoji: '🤔' },
        { name: t('feeling_crazy'), emoji: '🤪' }
    ];

    const handlePost = async () => {
        if (!desc && !img) return;

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/posts`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    desc,
                    img
                })
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error response:", errorText);
                return;
            }

            const data = await res.json();
            onPostCreated(data);
            setDesc('');
            setImg(null);
        } catch (err) {
            console.error("Error in handlePost:", err);
        }
    };

    const handleFeeling = (feeling) => {
        setDesc(prev => prev + (prev ? ' ' : '') + `${t('feeling_prefix')} ${feeling.name} ${feeling.emoji}`);
        setShowFeelings(false);
    };

    const onUploadSuccess = (res) => {
        setImg(res.url);
        setUploading(false);
    };

    return (
        <IKContext
            publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
            urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
            authenticator={async () => {
                const response = await fetch(`${API_URL}/api/imagekit/auth`);
                return await response.json();
            }}
        >
            <div className="card p-5 mb-6 overflow-visible z-20 relative">
                <div className="flex gap-4">
                    <img
                        src={user.imageUrl}
                        alt="User"
                        className="w-11 h-11 rounded-full object-cover border border-gray-100"
                    />
                    <div className="flex-1">
                        <textarea
                            className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 resize-none focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-1 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-[15px] text-gray-900 dark:text-white dark:placeholder-gray-400"
                            placeholder={t('home_create_post_placeholder').replace('What\'s on your mind?', `${t('home_create_post_placeholder').split('?')[0]}, ${user.firstName}?`)}
                            rows={2}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                        {img && (
                            <div className="relative mt-3">
                                <img src={img} alt="Preview" className="w-full rounded-xl object-cover max-h-80 shadow-sm" />
                                <button
                                    onClick={() => setImg(null)}
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <div className="flex flex-wrap justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 gap-y-3">
                            <div className="flex gap-4 relative">
                                <label className="cursor-pointer flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                                    <Image size={20} />
                                    <span className="text-sm font-medium">{t('home_photo')}</span>
                                    <IKUpload
                                        className="hidden"
                                        onSuccess={onUploadSuccess}
                                        onUploadStart={() => setUploading(true)}
                                    />
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFeelings(!showFeelings)}
                                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 transition p-1.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                                    >
                                        <Smile size={20} />
                                        <span className="text-sm font-medium">{t('home_feeling')}</span>
                                    </button>

                                    {showFeelings && (
                                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            {feelings.map((f, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleFeeling(f)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-2"
                                                >
                                                    <span>{f.emoji}</span>
                                                    <span>{f.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={uploading || (!desc && !img)}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 w-full sm:w-auto justify-center"
                            >
                                {uploading ? t('uploading') : (
                                    <>
                                        <span>{t('home_post_action')}</span>
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </IKContext>
    );
};

export default CreatePost;
