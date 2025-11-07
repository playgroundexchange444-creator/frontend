import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Header from "../components/Header";
import { Loader2, ArrowLeft, CheckCircle2, Users } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { connectUserSocket, getUserSocket } from "../socket/userSocket";

export default function OpenBets() {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();

    const fetchBets = async () => {
        try {
            const res = await api.get("/bets/open");
            setBets(res.data?.bets || []);
        } catch {
            setBets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBets();
        connectUserSocket();
        const socket = getUserSocket();
        if (!socket) return;
        socket.on("bet:update", fetchBets);
        return () => socket.off("bet:update", fetchBets);
    }, []);

    const handleAccept = async (betId, matchStatus) => {
        if (matchStatus === "live" || matchStatus === "completed") {
            toast.error("Match already started or finished!");
            return;
        }
        if (!window.confirm("Are you sure you want to accept this bet?")) return;

        setProcessingId(betId);
        try {
            await api.post(`/bets/accept/${betId}`);
            toast.success("Bet accepted successfully!");
            fetchBets();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed! Try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const getAcceptanceData = (bet) => {
        const teamA = bet.teamA || bet.match?.teamA;
        const teamB = bet.teamB || bet.match?.teamB;
        const makerTeam = bet.makerTeam ?? bet.team;
        const oppositeTeam = makerTeam === teamA ? teamB : teamA;

        const makerStake = Number(bet.makerStake ?? bet.stake);
        const makerOdds = Number(bet.makerOdds ?? bet.odds);
        const takerOdds = Number(bet.takerOdds ?? bet.oppositeOdds) || 2.0;

        const takerStake = +(
            (makerStake * (makerOdds - 1)) /
            Math.max(0.0001, takerOdds - 1)
        ).toFixed(2);

        const makerP2POdds = +(1 + takerStake / makerStake).toFixed(2);
        const takerP2POdds = +(1 + makerStake / takerStake).toFixed(2);

        return {
            makerTeam,
            oppositeTeam,
            makerStake,
            makerOdds,
            takerStake,
            makerP2POdds,
            takerP2POdds,
        };
    };

    return (
        <div className="bg-[#0b0d17] min-h-screen text-white">
            <Header />

            <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-400/50 bg-black shadow">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-yellow-400 hover:text-white transition"
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold text-yellow-400">Open Bets</h1>
                <div className="w-6" />
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-[50vh] text-gray-400">
                        <Loader2 className="animate-spin mr-2" /> Loading...
                    </div>
                ) : bets.length === 0 ? (
                    <p className="text-center text-gray-400 mt-20">No open bets right now.</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bets.map((bet) => {
                            const data = getAcceptanceData(bet);
                            return (
                                <div
                                    key={bet._id}
                                    className="bg-gray-900 border border-yellow-400/30 p-5 rounded-xl shadow-lg"
                                >
                                    <div className="flex justify-between mb-2">
                                        <h3 className="text-yellow-400 font-semibold">
                                            {bet.sport?.toUpperCase()}
                                        </h3>
                                        <span className="text-xs text-gray-400">
                                            Maker: {bet.makerId?.username}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-300">Match: {bet.matchId}</p>
                                    <p className="text-sm text-gray-300">Maker Team: {data.makerTeam}</p>
                                    <p className="text-sm text-gray-300">
                                        Your Team: <span className="text-green-400">{data.oppositeTeam}</span>
                                    </p>
                                    <p className="text-sm text-gray-300">Stake: ₹{data.makerStake}</p>
                                    <p className="text-sm text-gray-300">Odds: {data.makerOdds}</p>

                                    <div className="mt-2 bg-black/30 text-sm p-2 rounded-md">
                                        <Users className="inline mr-1" size={14} /> Your Stake Needed:{" "}
                                        <span className="text-yellow-400">₹{data.takerStake}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        P2P Odds → Maker: {data.makerP2POdds}× | You: {data.takerP2POdds}×
                                    </p>

                                    <button
                                        onClick={() => handleAccept(bet._id, bet.match?.status)}
                                        disabled={processingId === bet._id}
                                        className={`mt-4 w-full py-2 rounded-md font-semibold ${processingId === bet._id
                                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                            : "bg-yellow-400 text-black hover:bg-yellow-500"
                                            }`}
                                    >
                                        {processingId === bet._id ? (
                                            <Loader2 className="animate-spin inline mr-2" size={16} />
                                        ) : (
                                            <CheckCircle2 className="inline mr-2" size={16} />
                                        )}
                                        Accept Bet
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
