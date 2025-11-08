import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

export default function BetModal({ isOpen, onClose, match }) {
    if (!isOpen || !match) return null;

    const [stake, setStake] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(false);

    const teamA = match.teamA || "Team A";
    const teamB = match.teamB || "Team B";
    const oddsA = Number(match.oddsA || 1.5);
    const oddsB = Number(match.oddsB || 1.5);

    useEffect(() => {
        if (match.status === "live" || match.status === "completed") {
            toast.error("Betting is closed for this match!");
            onClose();
        }
    }, [match.status, onClose]);

    const makerStake = Number(stake || 0);
    const makerOdds = selectedTeam === teamA ? oddsA : selectedTeam === teamB ? oddsB : null;
    const takerOdds = selectedTeam === teamA ? oddsB : selectedTeam === teamB ? oddsA : null;
    const opposingTeam = selectedTeam === teamA ? teamB : selectedTeam === teamB ? teamA : null;

    const p2p = useMemo(() => {
        if (!selectedTeam || !makerStake || !makerOdds || !takerOdds) return { takerStake: 0, makerP2POdds: 0, takerP2POdds: 0 };
        const denom = Math.max(0.000001, takerOdds - 1);
        const takerStake = +((makerStake * (makerOdds - 1)) / denom).toFixed(2);
        return {
            takerStake,
            makerP2POdds: +(1 + takerStake / makerStake).toFixed(2),
            takerP2POdds: takerStake > 0 ? +(1 + makerStake / takerStake).toFixed(2) : 0,
        };
    }, [selectedTeam, makerStake, makerOdds, takerOdds]);

    const handleConfirm = async () => {
        if (!selectedTeam || !stake) return toast.warning("Please select a team and enter stake!");
        if (Number(stake) <= 0) return toast.warning("Stake should be greater than 0.");

        try {
            setLoading(true);
            await api.post("/bets/place", {
                matchId: match.matchId,
                sport: match.sport || "cricket",
                team: selectedTeam,
                stake: Number(stake),
                odds: selectedTeam === teamA ? oddsA : oddsB,
                acceptWindowSec: 120,
            });
            toast.success("Bet placed successfully!");
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Bet placement failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#10131f] w-full max-w-md rounded-xl border border-yellow-400/40 shadow-lg p-5 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <X size={22} />
                </button>

                <h2 className="text-yellow-400 font-bold text-xl mb-2">Place Your Bet</h2>
                <p className="text-gray-400 text-sm mb-4">
                    {teamA} vs {teamB} — {match.sport || "Cricket"}
                </p>

                <div className="flex justify-center gap-3 mb-4">
                    {[teamA, teamB].map((team) => (
                        <button
                            key={team}
                            onClick={() => setSelectedTeam(team)}
                            className={`px-4 py-2 rounded-md font-semibold border text-sm ${selectedTeam === team
                                ? "bg-yellow-400 text-black border-yellow-400"
                                : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                                }`}
                        >
                            {team} ({team === teamA ? oddsA : oddsB})
                        </button>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 mb-1 text-sm">Your Stake (₹)</label>
                    <input
                        type="number"
                        min="1"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter amount"
                    />
                </div>

                {selectedTeam && makerStake > 0 && (
                    <div className="text-sm bg-gray-900/50 rounded-lg p-3 mb-4">
                        <p className="text-yellow-300 mb-1">You bet on <b>{selectedTeam}</b> with ₹{makerStake}</p>
                        <p className="text-gray-300">Opponent: <b>{opposingTeam}</b></p>
                        <p className="text-gray-300">Opponent Stake (P2P): <b>₹{p2p.takerStake}</b></p>
                        <p className="text-gray-400 text-xs">P2P Odds — You: <b>{p2p.makerP2POdds}×</b> | Opponent: <b>{p2p.takerP2POdds}×</b></p>
                    </div>
                )}

                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md flex justify-center items-center"
                >
                    {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> Placing...</> : "Confirm Bet"}
                </button>
            </div>
        </div>
    );
}
