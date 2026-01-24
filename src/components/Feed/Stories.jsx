import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../config';
import StoryViewer from './StoryViewer';

const Stories = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            if (user) {
                try {
                    const res = await fetch(`${API_URL}/api/stories/${user.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) setStories(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch stories", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchStories();
    }, [user]);

    const onUploadSuccess = async (res) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/stories`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    img: res.url
                })
            });
            const newStory = await response.json();
            setStories([newStory, ...stories]);
        } catch (err) {
            console.error(err);
        }
    };

    const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);

    return (
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide py-2">
            {/* Create Story */}
            <IKContext
                publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
                urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
                authenticator={async () => {
                    const response = await fetch(`${API_URL}/api/imagekit/auth`);
                    return await response.json();
                }}
            >
                <div className="flex-shrink-0 relative w-32 h-52 rounded-2xl overflow-hidden cursor-pointer shadow-md bg-white group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <img src={user?.imageUrl} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                    <div className="absolute bottom-0 w-full p-3 flex flex-col items-center">
                        <label className="cursor-pointer -mt-8 bg-primary text-white rounded-full p-1.5 border-4 border-white shadow-sm hover:scale-110 transition-transform">
                            <Plus size={20} />
                            <IKUpload
                                className="hidden"
                                onSuccess={onUploadSuccess}
                            />
                        </label>
                        <span className="text-white text-xs font-semibold mt-2 drop-shadow-md">{t('add_story')}</span>
                    </div>
                </div>
            </IKContext>

            {/* Friends Stories */}
            {stories.map((story, index) => (
                <div
                    key={story._id}
                    className="flex-shrink-0 relative w-32 h-52 rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ring-2 ring-offset-2 ring-transparent hover:ring-primary"
                    onClick={() => setSelectedStoryIndex(index)}
                >
                    <img src={story.img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-full border-2 border-primary p-0.5 bg-white overflow-hidden">
                        <img src={story.profilePicture || "/assets/person/noAvatar.png"} alt="" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <span className="absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow-md">{story.firstName}</span>
                </div>
            ))}

            {/* Story Viewer */}
            {selectedStoryIndex !== null && (
                <StoryViewer
                    stories={stories}
                    initialIndex={selectedStoryIndex}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}
        </div>
    );
};

export default Stories;
