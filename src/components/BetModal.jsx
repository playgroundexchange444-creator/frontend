import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

export default function BetModal({ isOpen, onClose, match }) {
    if (!isOpen || !match) return null;

    const [stake, setStake] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(false);

    const teamA = match.teamA || match.teams?.teamA || "Team A";
    const teamB = match.teamB || match.teams?.teamB || "Team B";
    const oddsA = Number(match.oddsA || match.odds?.teamA || 1.5);
    const oddsB = Number(match.oddsB || match.odds?.teamB || 1.5);

    useEffect(() => {
        if (match.status === "live" || match.status === "completed") {
            toast.error("Betting is closed for this match!");
            onClose();
        }
    }, [match.status, onClose]);

    const makerStake = Number(stake || 0);
    const makerOdds =
        selectedTeam === teamA
            ? oddsA
            : selectedTeam === teamB
                ? oddsB
                : null;

    const takerOdds =
        selectedTeam === teamA
            ? oddsB
            : selectedTeam === teamB
                ? oddsA
                : null;

    const opposingTeam =
        selectedTeam === teamA
            ? teamB
            : selectedTeam === teamB
                ? teamA
                : null;

    const p2p = useMemo(() => {
        if (!selectedTeam || !makerStake || !makerOdds || !takerOdds)
            return { takerStake: 0, makerP2POdds: 0, takerP2POdds: 0 };

        const denom = Math.max(0.000001, takerOdds - 1);
        const takerStake = +(
            (makerStake * (makerOdds - 1)) /
            denom
        ).toFixed(2);

        const makerP2POdds = +(
            1 +
            takerStake / makerStake
        ).toFixed(2);

        const takerP2POdds =
            takerStake > 0
                ? +(1 + makerStake / takerStake).toFixed(2)
                : 0;

        return { takerStake, makerP2POdds, takerP2POdds };
    }, [selectedTeam, makerStake, makerOdds, takerOdds]);

    const handleConfirm = async () => {
        if (!selectedTeam || !stake) {
            toast.warning("Please select a team and enter stake!");
            return;
        }

        if (Number(stake) <= 0) {
            toast.warning("Stake should be greater than 0.");
            return;
        }

        const payload = {
            matchId: match.matchId,
            sport: match.sport || "cricket",
            team: selectedTeam,
            stake: Number(stake),
            odds: selectedTeam === teamA ? oddsA : oddsB,
            acceptWindowSec: 120,
        };

        console.log("✅ Final Payload Sending to Backend:", payload);

        try {
            setLoading(true);
            const res = await api.post("/bets/place", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            toast.success("Bet placed successfully!");
            onClose();
        } catch (err) {
            console.error("❌ API ERROR:", err);
            toast.error(err.response?.data?.message || "Bet place failed!");
        } finally {
            setLoading(false);
        }
    };






    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-[#10131f] border border-yellow-400/40 rounded-xl p-6 w-[90%] max-w-md text-center relative shadow-lg">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <X size={20} />
                </button>

                <h2 className="text-yellow-400 font-bold text-xl mb-2">Place Your Bet</h2>
                <p className="text-gray-400 text-sm mb-4">
                    {teamA} vs {teamB} — {match.sport || "Cricket"}
                </p>

                <div className="flex justify-center gap-4 mb-4">
                    {[teamA, teamB].map((team) => (
                        <button
                            key={team}
                            onClick={() => setSelectedTeam(team)}
                            className={`px-4 py-2 rounded font-semibold border ${selectedTeam === team
                                ? "bg-yellow-400 text-black border-yellow-400"
                                : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                                }`}
                        >
                            {team} ({team === teamA ? oddsA : oddsB})
                        </button>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Your Stake (₹)
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
                    />
                </div>

                {selectedTeam && makerStake > 0 && (
                    <div className="text-sm mb-4 space-y-1">
                        <p className="text-yellow-300">
                            You bet on <b>{selectedTeam}</b> with ₹{makerStake}
                        </p>
                        <p className="text-gray-300">
                            Opponent: <b>{opposingTeam}</b>
                        </p>
                        <p className="text-gray-300">
                            Opponent Stake (P2P): <b>₹{p2p.takerStake}</b>
                        </p>
                        <p className="text-gray-400 text-xs">
                            P2P Odds — You: <b>{p2p.makerP2POdds}×</b> | Opponent:{" "}
                            <b>{p2p.takerP2POdds}×</b>
                        </p>
                    </div>
                )}

                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-md transition flex justify-center items-center"
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin mr-2" /> Placing Bet...
                        </>
                    ) : (
                        "Confirm Bet"
                    )}
                </button>
            </div>
        </div>
    );
}
