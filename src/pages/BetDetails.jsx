// 📁 src/pages/BetDetails.jsx – Final production-ready

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Trophy, XCircle, Clock } from "lucide-react";
import api from "../api/axiosConfig";
import { getUserSocket } from "../socket/userSocket";
import { toast } from "react-toastify";

const TEAM_FLAGS = {
    India: "/flags/india.png",
    Australia: "/flags/australia.png",
    Pakistan: "/flags/pakistan.png",
    England: "/flags/england.png",
    default: "/flags/default.png",
};

const COMMISSION_RATE = 0.05;

export default function BetDetails() {
    const { matchId } = useParams();
    const navigate = useNavigate();

    const [bet, setBet] = useState(null);
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liveStatus, setLiveStatus] = useState("loading");
    const [me, setMe] = useState(null);
    const [winAmount, setWinAmount] = useState(null);

    const calculateWinAmount = useCallback(
        (b) => {
            if (!me || !b) return null;
            const makerWins = b?.winnerTeam === b?.makerTeam;
            const youAreMaker = String(b?.makerId) === String(me?._id);
            const youAreTaker = String(b?.takerId) === String(me?._id);

            const ms = b.makerStake;
            const ts = b.takerStake || 0;

            if (b.status !== "won" && b.status !== "lost") return null;

            if (youAreMaker && makerWins) {
                const gross = ms + ts;
                const profit = ts;
                return +(gross - profit * COMMISSION_RATE).toFixed(2);
            }
            if (youAreTaker && !makerWins) {
                const gross = ms + ts;
                const profit = ms;
                return +(gross - profit * COMMISSION_RATE).toFixed(2);
            }
            return null;
        },
        [me]
    );

    const fetchData = useCallback(async () => {
        try {
            const [betRes, meRes] = await Promise.all([
                api.get(`/bets/${matchId}`),
                api.get("/user/profile"),
            ]);
            if (betRes.data?.success) {
                setBet(betRes.data.bet);
                setLiveStatus(betRes.data.bet.status);
            }
            setMe(meRes.data?.user || null);
        } catch {
            toast.error("Error loading bet details.");
        } finally {
            setLoading(false);
        }
    }, [matchId]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    useEffect(() => {
        if (!bet || !me) return;
        setWinAmount(calculateWinAmount(bet));
    }, [bet, me, calculateWinAmount]);

    useEffect(() => {
        const socket = getUserSocket();
        if (!socket) return;

        socket.on("match:update", (p) => {
            if (p.matchId === matchId) {
                setScore(p.score);
                setLiveStatus(p.status);
            }
        });

        socket.on("bet:result", (p) => {
            if (p.matchId === matchId) {
                toast.info(` Match settled: ${p.status.toUpperCase()}`);
                fetchData();
            }
        });

        return () => {
            socket.off("match:update");
            socket.off("bet:result");
        };
    }, [matchId, fetchData]);

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading...
            </div>
        );

    if (!bet)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
                <p>❌ Bet not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-md"
                >
                    Go Back
                </button>
            </div>
        );

    const teamA = bet.teamA || bet.teams?.[0] || "Team A";
    const teamB = bet.teamB || bet.teams?.[1] || "Team B";

    return (
        <div className="min-h-screen bg-[#0b0d17] text-white p-6">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-300 hover:text-yellow-400"
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold text-yellow-400 flex-1 text-center">
                    {bet.matchId}
                </h1>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
                <h2 className="text-yellow-400 font-bold mb-2">Your Bet</h2>
                <p>
                    Team: <span className="text-yellow-300">{bet.team}</span>
                </p>
                <p>
                    Stake: <span className="text-green-400">₹{bet.stake}</span>
                </p>
                <p>
                    Odds: <span className="text-white">{bet.odds}</span>
                </p>
                <p>Status: {bet.status}</p>
                {winAmount && (
                    <p className="text-green-400 mt-2 font-semibold">
                        ✅ Winning Amount: ₹{winAmount}
                    </p>
                )}
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h2 className="text-yellow-400 font-bold mb-2">Live Score</h2>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img
                            src={TEAM_FLAGS[teamA] || TEAM_FLAGS.default}
                            alt={teamA}
                            className="w-6 h-6 rounded-full"
                        />
                        <span className="font-bold">{teamA}</span>
                    </div>
                    <span className="text-green-400 font-bold">{score?.teamA || "--"}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                        <img
                            src={TEAM_FLAGS[teamB] || TEAM_FLAGS.default}
                            alt={teamB}
                            className="w-6 h-6 rounded-full"
                        />
                        <span className="font-bold">{teamB}</span>
                    </div>
                    <span className="text-red-400 font-bold">{score?.teamB || "--"}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    Current status: <span className="text-yellow-300">{liveStatus}</span>
                </p>
            </div>
        </div>
    );
}
