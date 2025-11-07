import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [upiId, setUpiId] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/user/profile");
                if (res.data.success) {
                    setUser(res.data.user);
                    setName(res.data.user.name || "");
                    setUpiId(res.data.user.upiId || "");
                }
            } catch {
                setMessage("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const data = { name, upiId };
            if (oldPassword && newPassword) {
                data.oldPassword = oldPassword;
                data.newPassword = newPassword;
            }

            const res = await api.put("/user/me", data);

            if (res.data.success) {
                setUser(res.data.user);
                setName(res.data.user.name);
                setUpiId(res.data.user.upiId);
                setEditMode(false);
                setOldPassword("");
                setNewPassword("");
                setMessage("Profile updated successfully!");
            }
        } catch (err) {
            setMessage(err.response?.data?.message || "Error updating profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-yellow-400 mb-6">My Profile</h1>

            {message && (
                <div
                    className={`mb-4 text-center font-medium ${message.includes("successfully") ? "text-green-400" : "text-yellow-400"
                        }`}
                >
                    {message}
                </div>
            )}

            {!editMode ? (
                <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg space-y-3">
                    <p><span className="text-gray-400">Username:</span> {user?.username}</p>
                    <p><span className="text-gray-400">Full Name:</span> {user?.name || "—"}</p>
                    <p><span className="text-gray-400">UPI ID:</span> {user?.upiId || "—"}</p>
                    <p><span className="text-gray-400">Wallet Balance:</span> ₹{user?.balance || 0}</p>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => setEditMode(true)}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 hover:bg-red-400 text-white font-semibold py-2 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleUpdate}
                    className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
                >
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">UPI ID</label>
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                        />
                    </div>

                    <hr className="border-gray-700" />
                    <h3 className="text-yellow-400">Change Password (Optional)</h3>

                    <input
                        type="password"
                        placeholder="Current Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                    />

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-2 rounded"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditMode(false)}
                            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
