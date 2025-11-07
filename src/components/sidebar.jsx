import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import SportsGrid from "./SportsGrid";

export default function Sidebar() {
    const [selectedSport, setSelectedSport] = useState("cricket");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async (sport = "cricket", filter = "all") => {
        try {
            setLoading(true);
            let url = `/matches/sport/${sport}`;
            if (filter !== "all") url += `?status=${filter}`;
            const res = await api.get(url);
            setMatches(res.data?.matches || []);
        } catch {
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches(selectedSport, selectedFilter);
    }, [selectedSport, selectedFilter]);

    return (
        <div className="flex bg-[#0b0d17] min-h-screen text-white">
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

            <main className="flex-1 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-yellow-400 capitalize">
                        {selectedSport} Matches
                    </h2>

                    <div className="flex gap-3">
                        {["all", "live", "upcoming", "completed"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-4 py-2 rounded ${selectedFilter === filter
                                    ? "bg-yellow-400 text-black"
                                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                                    }`}
                            >
                                {filter.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <p className="text-gray-400 text-center py-10">Loading matches...</p>
                ) : matches.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">
                        No matches found for {selectedFilter}.
                    </p>
                ) : (
                    <SportsGrid sports={matches} />
                )}
            </main>
        </div>
    );
}
