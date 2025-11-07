import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function OddsTicker() {
    const [odds, setOdds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOdds = async () => {
            try {
                const res = await api.get("/odds/fetch?sport=cricket");
                if (res.data.success) setOdds(res.data.data);
            } finally {
                setLoading(false);
            }
        };
        fetchOdds();
    }, []);

    if (loading) return <p className="text-gray-400">Loading odds...</p>;

    return (
        <div className="bg-gray-800 text-yellow-400 p-3 rounded-lg overflow-x-auto whitespace-nowrap">
            {odds.length === 0 ? (
                <span>No live odds available.</span>
            ) : (
                odds.map((item) => (
                    <span key={item.matchId} className="mx-4 font-semibold">
                        {item.teams.teamA} 🆚 {item.teams.teamB} —{" "}
                        <span className="text-green-400">{item.odds.teamA}</span> /{" "}
                        <span className="text-red-400">{item.odds.teamB}</span>
                    </span>
                ))
            )}
        </div>
    );
}
