import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { API_URL } from '../config';

const FollowRequests = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useLanguage();
    const { sendNotification } = useNotification();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            if (user && user.id && user.id !== 'undefined') {
                const token = await getToken();
                // We need an endpoint to get users who requested. 
                // Currently user object has 'followRequests' array of IDs.
                // easier to just fetch current user and then fetch profiles for those IDs.
                try {
                    const resUser = await fetch(`${API_URL}/api/users/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (resUser.ok) {
                        const userData = await resUser.json();

                        if (userData.followRequests && userData.followRequests.length > 0) {
                            // Fetch details for each requester
                            const requesterPromises = userData.followRequests
                                .filter(id => id && id !== 'undefined')
                                .map(id => fetch(`${API_URL}/api/users/${id}`).then(r => r.ok ? r.json() : null));
                            const requesters = (await Promise.all(requesterPromises)).filter(r => r !== null);
                            setRequests(requesters);
                        } else {
                            setRequests([]);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };
        fetchRequests();
    }, [user, getToken]);

    const handleAccept = async (senderId) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/users/${senderId}/accept`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setRequests(prev => prev.map(r =>
                    r.clerkId === senderId ? { ...r, accepted: true } : r
                ));

                // Send Real-Time Notification
                sendNotification({
                    receiverId: senderId,
                    type: 'follow', // Or 'accept_follow' if we had that type, but 'follow' works for now
                    referenceId: user.id
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFollowBack = async (senderId) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/users/${senderId}/follow`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(prev => prev.filter(r => r.clerkId !== senderId));

            // Send Real-Time Notification
            sendNotification({
                receiverId: senderId,
                type: 'follow',
                referenceId: user.id
            });
        } catch (err) {
            console.error(err);
        }
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
                        <div key={req._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-4">
                                <img src={req.profilePicture || "https://placehold.co/50"} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                                <span className="font-semibold text-gray-900">{req.firstName} {req.lastName}</span>
                            </div>
                            <div className="flex gap-2">
                                {req.accepted ? (
                                    <button
                                        onClick={() => handleFollowBack(req.clerkId)}
                                        className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition shadow-md shadow-indigo-500/20"
                                    >
                                        {t('profile_follow')} Back
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => handleAccept(req.clerkId)} className="bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-indigo-600 transition shadow-sm font-semibold">{t('accept')}</button>
                                        <button onClick={() => handleDecline(req.clerkId)} className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-200 transition font-semibold">{t('decline')}</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FollowRequests;
