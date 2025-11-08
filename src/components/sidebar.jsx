import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import SportsGrid from "./SportsGrid";

export default function Sidebar() {
    const [selectedSport, setSelectedSport] = useState("cricket");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState(false);

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
        <div className="min-h-screen w-full bg-[#0b0d17] text-white flex overflow-x-hidden">

            <div className="md:hidden fixed top-0 left-0 w-full bg-[#10131f] flex justify-between items-center px-4 py-3 z-50 shadow-md">
                <span className="text-yellow-400 font-bold text-lg">Sports</span>
                <button onClick={() => setOpenMenu(!openMenu)}>
                    <i className="fas fa-bars text-white text-2xl"></i>
                </button>
            </div>

            <aside
                className={`bg-[#10131f] border-r border-gray-700 w-60 p-4 fixed md:relative top-0 left-0 z-40 h-full transition-transform duration-300 
                ${openMenu ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <h2 className="text-yellow-400 font-semibold text-lg mb-4 mt-10 md:mt-0">Sports</h2>
                {["Cricket"].map((sport) => (
                    <div
                        key={sport}
                        onClick={() => {
                            setSelectedSport(sport.toLowerCase());
                            setOpenMenu(false);
                        }}
                        className={`cursor-pointer mb-3 p-3 rounded-lg border transition ${selectedSport === sport.toLowerCase()
                            ? "bg-yellow-400 text-black border-yellow-400"
                            : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                            }`}
                    >
                        {sport}
                    </div>
                ))}
            </aside>

            <main className="flex-1 p-6 w-full md:ml-0 ml-0 mt-16 md:mt-0">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                    <h2 className="text-2xl font-bold text-yellow-400 capitalize">
                        {selectedSport} Matches
                    </h2>

                    <div className="flex gap-2 flex-wrap">
                        {["all", "live", "upcoming", "completed"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-4 py-2 rounded text-sm ${selectedFilter === filter
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
                    <p className="text-center text-gray-400 py-10">Loading matches...</p>
                ) : matches.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">No matches found.</p>
                ) : (
                    <SportsGrid sports={matches} />
                )}
            </main>
        </div>
    );
}
