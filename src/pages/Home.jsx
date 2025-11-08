import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Header from "../components/Header";
import SportsGrid from "../components/SportsGrid";
import BetModal from "../components/BetModal";
import { Loader2 } from "lucide-react";

export default function Home() {
    const [matches, setMatches] = useState([]);
    const [selectedSport, setSelectedSport] = useState("cricket");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchMatches = async (sport = "cricket", status = "all") => {
        try {
            setLoading(true);
            let url = `/matches/sport/${sport}`;
            if (status !== "all") url += `?status=${status}`;

            const res = await api.get(url);

            if (res.data?.success) {
                let data = Array.isArray(res.data.matches) ? res.data.matches : [];

                const now = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(now.getDate() - 7);

                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(now.getDate() + 30);

                let filtered = data.filter((match) => {
                    const startTime = new Date(match.startTime);

                    if (filter === "completed") {
                        return (
                            match.status === "completed" &&
                            startTime >= sevenDaysAgo &&
                            startTime <= now
                        );
                    }

                    if (filter === "upcoming") {
                        return (
                            startTime > now &&
                            startTime <= thirtyDaysLater
                        );
                    }

                    if (filter === "live") {
                        return match.status === "live";
                    }

                    return (
                        (match.status === "completed" &&
                            startTime >= sevenDaysAgo &&
                            startTime <= now) ||
                        match.status === "live" ||
                        (startTime > now && startTime <= thirtyDaysLater)
                    );
                });

                filtered.sort((a, b) => {
                    const statusOrder = { live: 0, completed: 1, upcoming: 2 };

                    if (statusOrder[a.status] !== statusOrder[b.status]) {
                        return statusOrder[a.status] - statusOrder[b.status];
                    }

                    return new Date(b.startTime) - new Date(a.startTime);
                });

                setMatches(filtered);
            } else {
                setMatches([]);
            }
        } catch {
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches(selectedSport, filter);
    }, [selectedSport, filter]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center text-gray-400">
                <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading matches...
            </div>
        );
    }

    return (
        <div className="bg-[#0b0d17] min-h-screen text-white">
            <Header />

            <div className="flex">
                <aside className="hidden md:block bg-[#10131f] border-r border-gray-800 w-60 p-4 h-full">
                    <h2 className="text-yellow-400 font-semibold text-lg mb-4">Sports</h2>
                    <div
                        onClick={() => setSelectedSport("cricket")}
                        className={`cursor-pointer mb-3 p-3 rounded-lg border transition ${selectedSport === "cricket"
                            ? "bg-yellow-400 text-black border-yellow-400"
                            : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                            }`}
                    >
                        Cricket
                    </div>
                </aside>

                <main className="flex-1 p-6">
                    <div className="flex flex-wrap justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-yellow-400 capitalize">
                            {selectedSport} Matches
                        </h2>

                        <div className="hidden md:flex gap-2">
                            {["all", "live", "upcoming", "completed"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded ${filter === f
                                        ? "bg-yellow-400 text-black"
                                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                                        }`}
                                >
                                    {f.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:hidden flex gap-2 mb-4">
                        {["all", "live", "upcoming", "completed"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded text-xs ${filter === f
                                    ? "bg-yellow-400 text-black"
                                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {matches.length === 0 ? (
                        <p className="text-gray-400 text-center mt-10">
                            No {filter} matches available.
                        </p>
                    ) : (
                        <SportsGrid
                            sports={matches}
                            onBetClick={(match) => {
                                setSelectedMatch(match);
                                setShowModal(true);
                            }}
                        />
                    )}
                </main>
            </div>

            {showModal && (
                <BetModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    match={selectedMatch}
                />
            )}
        </div>
    );
}
