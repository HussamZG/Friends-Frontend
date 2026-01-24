import { useState, useEffect } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { X, Upload, MapPin, Edit3, Image, Camera } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        location: '',
        coverPicture: '',
        profilePicture: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.bio || '',
                location: user.location || '',
                coverPicture: user.coverPicture || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onUploadSuccess = (res, field) => {
        setFormData(prev => ({ ...prev, [field]: res.url }));
        setUploading(false);
    };

    const onUploadError = (err) => {
        console.log("Error", err);
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onUpdate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <IKContext
                    publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
                    urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
                    authenticator={async () => {
                        const response = await fetch('http://localhost:5000/api/imagekit/auth');
                        return await response.json();
                    }}
                >
                    <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Images Section */}
                        <div className="space-y-6">
                            {/* Cover Edit */}
                            <div className="relative group rounded-xl overflow-hidden h-32 bg-gray-100 border border-gray-200">
                                {formData.coverPicture ? (
                                    <img src={formData.coverPicture} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Image size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <label className="cursor-pointer bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition flex items-center gap-2">
                                        <Camera size={16} />
                                        <span>Change Cover</span>
                                        <IKUpload
                                            className="hidden"
                                            fileName="cover-pic.jpg"
                                            onSuccess={(res) => onUploadSuccess(res, 'coverPicture')}
                                            onError={onUploadError}
                                            onUploadStart={() => setUploading(true)}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Profile Edit */}
                            <div className="flex justify-center -mt-16 relative z-10">
                                <div className="relative group">
                                    <img
                                        src={formData.profilePicture || "https://placehold.co/150"}
                                        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                        alt="Profile"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-white border border-gray-200 p-2 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition text-gray-700">
                                        <Camera size={16} />
                                        <IKUpload
                                            className="hidden"
                                            fileName="profile-pic.jpg"
                                            onSuccess={(res) => onUploadSuccess(res, 'profilePicture')}
                                            onError={onUploadError}
                                            onUploadStart={() => setUploading(true)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                    </form>
                </IKContext>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <span>Save Changes</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
