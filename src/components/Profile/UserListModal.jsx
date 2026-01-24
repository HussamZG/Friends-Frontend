import { X, UserPlus, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../../config';

const UserListModal = ({ isOpen, onClose, title, users, currentUserId, onFollowUpdate }) => {
    const { getToken } = useAuth();

    if (!isOpen) return null;

    const handleFollowToggle = async (targetUserId, isFollowing) => {
        try {
            const token = await getToken();
            const endpoint = isFollowing ? "unfollow" : "follow";
            const res = await fetch(`${API_URL}/api/users/${targetUserId}/${endpoint}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                onFollowUpdate(targetUserId, !isFollowing);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-2">
                    {users.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">No users found</div>
                    ) : (
                        users.map(user => (
                            <div key={user.clerkId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <Link to={`/profile/${user.clerkId}`} onClick={onClose} className="flex items-center gap-3">
                                    <img
                                        src={user.profilePicture || "https://placehold.co/40"}
                                        alt=""
                                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                    />
                                    <span className="font-semibold text-gray-900">{user.firstName} {user.lastName}</span>
                                </Link>

                                {currentUserId !== user.clerkId && (
                                    <button
                                        className="text-primary hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                        onClick={() => handleFollowToggle(user.clerkId, false)} // Implementation of toggle needs parent state sync
                                    >
                                        <UserPlus size={20} />
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

export default UserListModal;
