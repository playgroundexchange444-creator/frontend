import React from "react";
import { X } from "lucide-react";

export default function ProfileSidebar({ isOpen, onClose, user, onLogout, onEdit }) {
    return (
        <div
            className={`fixed top-0 right-0 h-full w-72 bg-gray-900 text-white shadow-xl transform transition-transform duration-300 z-50 ${isOpen ? "translate-x-0" : "translate-x-full"
                }`}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <h2 className="text-lg font-bold text-yellow-400">Profile</h2>
                <button onClick={onClose}>
                    <X size={20} className="text-gray-300 hover:text-white" />
                </button>
            </div>

            <div className="px-4 py-4 space-y-4">
                <div>
                    <p className="text-sm text-gray-400">Username</p>
                    <p className="font-semibold">{user?.username || "-"}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-400">Full Name</p>
                    <p className="font-semibold">{user?.name || "-"}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-400">UPI ID</p>
                    <p className="font-semibold">{user?.upiId || "-"}</p>
                </div>

                <button
                    onClick={onEdit}
                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded"
                >
                    Edit Profile
                </button>

                <button
                    onClick={onLogout}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
