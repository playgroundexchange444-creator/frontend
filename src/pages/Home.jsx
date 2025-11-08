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

    // ✅ Fetch matches from API
    const fetchMatches = async (sport = "cricket", status = "all") => {
        try {
            setLoading(true);
            let url = `/matches/sport/${sport}`;
            if (status !== "all") url += `?status=${status}`;
            const res = await api.get(url);

            if (res.data?.success) {
                if (Array.isArray(res.data.matches)) {
                    setMatches(res.data.matches);
                } else if (res.data.grouped) {
                    const { live = [], upcoming = [], completed = [] } = res.data.grouped;
                    const allMatches =
                        status === "live"
                            ? live
                            : status === "upcoming"
                                ? upcoming
                                : status === "completed"
                                    ? completed
                                    : [...live, ...upcoming, ...completed];
                    setMatches(allMatches);
                } else {
                    setMatches([]);
                }
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
                {/* Sidebar */}
                <aside className="w-[250px] bg-[#10131f] border-r border-gray-800 p-4">
                    <h2 className="text-yellow-400 font-semibold text-lg mb-4">Sports</h2>
                    {["Cricket"].map((sport) => (
                        <div
                            key={sport}
                            onClick={() => setSelectedSport(sport.toLowerCase())}
                            className={`cursor-pointer mb-2 p-3 rounded-lg border transition ${selectedSport === sport.toLowerCase()
                                ? "bg-yellow-400 text-black border-yellow-400"
                                : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                                }`}
                        >
                            {sport}
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-yellow-400 capitalize">
                            {selectedSport} Matches
                        </h2>
                        <div className="flex gap-3">
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

            {/* Bet Modal */}
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
