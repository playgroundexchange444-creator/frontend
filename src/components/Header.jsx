import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings, XCircle } from "lucide-react";
import { logoutUser } from "../utils/logoutUser";
import api from "../api/axiosConfig";

export default function Header() {
    const [me, setMe] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/user/profile");
                if (res.data?.success) setMe(res.data.user);
            } catch {
                setMe(null);
            }
        };
        load();
    }, []);

    const items = useMemo(
        () => [
            { to: "/wallet", label: "Wallet" },
            { to: "/open-bets", label: "Open Bets" },
            { to: "/my-bets", label: "My Bets" },
        ],
        []
    );

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
        logoutUser();
        setDrawerOpen(false);
        setMobileOpen(false);
        navigate("/login", { replace: true });
    };

    const ProfileButton = () => (
        <button
            onClick={() => setDrawerOpen(true)}
            className="group flex items-center gap-2 px-3 py-1.5 rounded border border-yellow-400/40 hover:bg-yellow-400 hover:text-black transition text-sm"
        >
            <User size={16} />
            <span className="hidden sm:inline">{me?.name || me?.username || "Profile"}</span>
        </button>
    );

    return (
        <>
            <header className="sticky top-0 z-50 bg-black backdrop-blur text-white border-b border-gray-800">
                <div className="mx-auto max-w-full px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-lg border-2 border-yellow-400"
                        />
                        <h1 className="font-semibold hidden sm:block text-yellow-400 text-lg md:text-xl">
                            Playground Exchange
                        </h1>
                    </Link>

                    <div className="flex items-center gap-2">
                        <nav className="hidden md:flex items-center gap-1">
                            {items.map((it) => (
                                <Link
                                    key={it.to}
                                    to={it.to}
                                    className={`px-3 py-1.5 rounded text-sm transition ${isActive(it.to)
                                        ? "bg-yellow-400 text-black font-semibold"
                                        : "border border-yellow-400/40 hover:bg-yellow-400 hover:text-black"
                                        }`}
                                >
                                    {it.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden md:block">
                            <ProfileButton />
                        </div>

                        <button
                            className="md:hidden p-2 rounded border border-yellow-400/40"
                            onClick={() => setMobileOpen((v) => !v)}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-gray-800 bg-gray-900">
                        <div className="px-3 py-2 flex flex-col gap-2">
                            {items.map((it) => (
                                <Link
                                    key={it.to}
                                    to={it.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={`px-3 py-2 rounded text-sm transition ${isActive(it.to)
                                        ? "bg-yellow-400 text-black font-semibold"
                                        : "border border-yellow-400/40 hover:bg-yellow-400 hover:text-black"
                                        }`}
                                >
                                    {it.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    setMobileOpen(false);
                                    setDrawerOpen(true);
                                }}
                                className="px-3 py-2 rounded text-sm border border-yellow-400/40 hover:bg-yellow-400 hover:text-black"
                            >
                                <User size={14} className="inline mr-2" />
                                Profile
                            </button>
                        </div>
                    </div>
                )}

                <div className="h-[3px] bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500" />
            </header>

            <div
                className={`fixed inset-0 z-50 transition ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"
                    }`}
            >
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"
                        }`}
                    onClick={() => setDrawerOpen(false)}
                />

                <aside
                    className={`absolute right-0 top-0 h-full w-[92%] sm:w-[420px] bg-[#0b0d17] border-l border-gray-800 shadow-2xl transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <User className="text-yellow-400" size={18} />
                            <h3 className="font-semibold">My Profile</h3>
                        </div>
                        <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded hover:bg-gray-800">
                            <XCircle size={18} />
                        </button>
                    </div>

                    <div className="p-4 space-y-4 text-sm">
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-1">Username</div>
                            <div className="font-medium">{me?.username || "-"}</div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-1">Full Name</div>
                            <div className="font-medium">{me?.name || "-"}</div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-1">UPI ID</div>
                            <div className="font-medium">{me?.upiId || "-"}</div>
                        </div>

                        {me?.phone && (
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                                <div className="text-xs text-gray-400 mb-1">Phone</div>
                                <div className="font-medium">{me.phone}</div>
                            </div>
                        )}

                        <div className="pt-2 flex flex-col gap-2">
                            <Link
                                to="/profile"
                                onClick={() => setDrawerOpen(false)}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
                            >
                                <Settings size={16} />
                                Edit Profile
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-500"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}
