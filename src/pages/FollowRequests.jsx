import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const FollowRequests = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            if (user) {
                const token = await getToken();
                // We need an endpoint to get users who requested. 
                // Currently user object has 'followRequests' array of IDs.
                // easier to just fetch current user and then fetch profiles for those IDs.
                try {
                    const resUser = await fetch(`${API_URL}/api/users/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const userData = await resUser.json();

                    if (userData.followRequests && userData.followRequests.length > 0) {
                        // Fetch details for each requester
                        const requesterPromises = userData.followRequests.map(id =>
                            fetch(`${API_URL}/api/users/${id}`).then(r => r.json())
                        );
                        const requesters = await Promise.all(requesterPromises);
                        setRequests(requesters);
                    } else {
                        setRequests([]);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };
        fetchRequests();
    }, [user]);

    const handleAccept = async (senderId) => {
        const token = await getToken();
        await fetch(`${API_URL}/api/users/${senderId}/accept`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(requests.filter(r => r.clerkId !== senderId));
    };

    const handleDecline = async (senderId) => {
        const token = await getToken();
        await fetch(`${API_URL}/api/users/${senderId}/decline`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(requests.filter(r => r.clerkId !== senderId));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('follow_requests')}</h1>
            {requests.length === 0 ? (
                <p className="text-gray-500">{t('no_follow_requests')}</p>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req._id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={req.profilePicture || "https://placehold.co/50"} alt="" className="w-12 h-12 rounded-full object-cover" />
                                <span className="font-semibold text-lg">{req.firstName} {req.lastName}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAccept(req.clerkId)} className="bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-indigo-600 transition">{t('accept')}</button>
                                <button onClick={() => handleDecline(req.clerkId)} className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-200 transition">{t('decline')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FollowRequests;
