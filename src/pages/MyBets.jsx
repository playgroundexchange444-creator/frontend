import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api from "../api/axiosConfig";
import { connectUserSocket, getUserSocket } from "../socket/userSocket";
import { Loader2 } from "lucide-react";

const COMMISSION_RATE = 0.05;

const getId = (v) => (v && typeof v === "object" ? v._id : v);
const toNum = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};
const fmt = (n) =>
    typeof n === "number"
        ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
        : n;
const pick = (obj, path, fallback) => {
    try {
        return (
            path
                .split(".")
                .reduce((a, k) => (a && a[k] !== undefined ? a[k] : undefined), obj) ??
            fallback
        );
    } catch {
        return fallback;
    }
};
const requiredTakerStakeBalanced = ({ makerStake, makerOdds, takerOdds }) => {
    const ms = toNum(makerStake, 0);
    const mo = toNum(makerOdds, 1);
    const to = toNum(takerOdds, 2);
    if (!ms || !mo || !to) return 0;
    const denom = Math.max(1e-6, to - 1);
    return +(ms * Math.max(0, mo - 1) / denom).toFixed(2);
};
const p2pOddsFromStakes = (ms, ts) => {
    const makerP2P = ms > 0 ? +(1 + ts / ms).toFixed(2) : 0;
    const takerP2P = ts > 0 ? +(1 + ms / ts).toFixed(2) : 0;
    return { makerP2P, takerP2P };
};

export default function MyBets() {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("pending");
    const [me, setMe] = useState(null);

    const fetchMe = async () => {
        try {
            const res = await api.get("/user/profile");
            setMe(res.data?.user || null);
        } catch {
            setMe(null);
        }
    };

    const fetchBets = async () => {
        try {
            const res = await api.get("/bets/my");
            setBets(res.data?.bets || []);
        } catch {
            setBets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
        fetchBets();
        connectUserSocket();
        const socket = getUserSocket();
        if (!socket) return;
        socket.on("bet:matched", fetchBets);
        socket.on("bet:settled", fetchBets);
        socket.on("bet:update", fetchBets);
        socket.on("wallet:update", fetchBets);
        return () => {
            socket.off("bet:matched", fetchBets);
            socket.off("bet:settled", fetchBets);
            socket.off("bet:update", fetchBets);
            socket.off("wallet:update", fetchBets);
        };
    }, []);

    const rows = useMemo(() => {
        if (!me) return [];
        return (bets || []).map((b) => {
            const teamA =
                b.teamA ?? pick(b, "match.teamA") ?? pick(b, "teams.teamA") ?? "-";
            const teamB =
                b.teamB ?? pick(b, "match.teamB") ?? pick(b, "teams.teamB") ?? "-";
            const makerId = getId(b.makerId);
            const takerId = getId(b.takerId);
            const youAreMaker = me && String(makerId) === String(me._id);
            const youAreTaker = me && takerId && String(takerId) === String(me._id);
            const yourRole = youAreMaker ? "Maker" : youAreTaker ? "Taker" : "Viewer";
            const makerTeam = b.makerTeam ?? b.team ?? "-";
            const takerTeam =
                b.takerTeam ??
                (makerTeam && teamA !== "-" && teamB !== "-"
                    ? makerTeam === teamA
                        ? teamB
                        : teamA
                    : "-");
            const ms = toNum(b.makerStake ?? b.stake, 0);
            const mo = toNum(b.makerOdds ?? b.odds, 0);
            const tsMatched =
                b.takerStake != null ? toNum(b.takerStake, 0) : null;
            const to =
                b.takerOdds != null
                    ? toNum(b.takerOdds, 0)
                    : b.oppositeOdds != null
                        ? toNum(b.oppositeOdds, 0)
                        : null;
            const reqTS =
                tsMatched != null
                    ? tsMatched
                    : requiredTakerStakeBalanced({
                        makerStake: ms,
                        makerOdds: mo,
                        takerOdds: to ?? 2,
                    });
            const matched =
                b.status === "active" ||
                b.status === "won" ||
                b.status === "lost" ||
                b.settled;
            const pool = matched
                ? +(ms + (tsMatched ?? 0)).toFixed(2)
                : reqTS
                    ? +(ms + reqTS).toFixed(2)
                    : ms;
            const { makerP2P, takerP2P } = p2pOddsFromStakes(
                ms,
                tsMatched ?? reqTS ?? 0
            );
            let youResult = "Waiting";
            let youPreview = "—";
            if (b.status === "active") {
                youResult = "Pool";
                youPreview = `${fmt(pool)} (net after commission)`;
            } else if (b.status === "won" || b.status === "lost" || b.settled) {
                const makerWins =
                    (b.winnerTeam ?? b.winner ?? "").toString() ===
                    makerTeam.toString();
                const winnerIsMaker = makerWins;
                if (youAreMaker) {
                    if (winnerIsMaker) {
                        const profitSide = tsMatched ?? 0;
                        const net = +(
                            ms +
                            (tsMatched ?? 0) -
                            profitSide * COMMISSION_RATE
                        ).toFixed(2);
                        youResult = "You WON";
                        youPreview = `Credited ${fmt(net)}`;
                    } else {
                        youResult = "You LOST";
                        youPreview = `Debited ${fmt(ms)}`;
                    }
                } else if (youAreTaker) {
                    if (!tsMatched) {
                        youResult = "—";
                        youPreview = "—";
                    } else if (!winnerIsMaker) {
                        const profitSide = ms;
                        const net = +(
                            ms +
                            tsMatched -
                            profitSide * COMMISSION_RATE
                        ).toFixed(2);
                        youResult = "You WON";
                        youPreview = `Credited ${fmt(net)}`;
                    } else {
                        youResult = "You LOST";
                        youPreview = `Debited ${fmt(tsMatched)}`;
                    }
                } else {
                    youResult = makerWins ? `${makerTeam} WON` : `${takerTeam} WON`;
                    youPreview = fmt(pool);
                }
            }

            return {
                id: b._id,
                matchId: b.matchId,
                sport: (b.sport || "").toUpperCase(),
                teamsLabel: `${teamA} vs ${teamB}`,
                yourRole,
                makerStake: ms ? fmt(ms) : "—",
                makerOdds: mo || "—",
                takerStake:
                    tsMatched != null ? fmt(tsMatched) : reqTS ? `Req: ${fmt(reqTS)}` : "—",
                takerOdds: to || "—",
                poolLabel: fmt(pool),
                status: b.settled
                    ? b.winnerTeam === makerTeam
                        ? youAreMaker
                            ? "WON"
                            : "LOST"
                        : youAreTaker
                            ? "WON"
                            : "LOST"
                    : (b.status || "—").toUpperCase(),
                makerTeam,
                takerTeam,
                p2pMaker: makerP2P ? `${makerP2P}×` : "—",
                p2pTaker: takerP2P ? `${takerP2P}×` : "—",
                youResult,
                youPreview,
            };
        });
    }, [bets, me]);

    const filteredRows = rows.filter((r) =>
        tab === "settled"
            ? ["WON", "LOST", "SETTLED"].includes(r.status)
            : r.status === tab.toUpperCase()
    );

    return (
        <div className="bg-[#0b0d17] min-h-screen text-white">
            <Header />
            <div className="border-b border-yellow-400/40 bg-black shadow-md px-6 py-4 flex gap-3 md:gap-4 justify-center sticky top-0 z-10">
                {["pending", "active", "settled"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-md font-semibold transition-all ${tab === t
                            ? "bg-yellow-400 text-black"
                            : "border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                            }`}
                    >
                        {t === "pending"
                            ? " Pending"
                            : t === "active"
                                ? " Active"
                                : "Settled"}
                    </button>
                ))}
            </div>
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-[50vh] text-gray-400">
                        <Loader2 className="animate-spin mr-2" /> Loading your bets...
                    </div>
                ) : filteredRows.length === 0 ? (
                    <p className="text-center text-gray-400 mt-20">No {tab} bets found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-900/60 rounded-lg overflow-hidden">
                            <thead className="bg-gray-800">
                                <tr className="text-xs uppercase tracking-wider text-gray-300">
                                    <th className="text-left px-4 py-3">Match</th>
                                    <th className="text-left px-4 py-3">Teams</th>
                                    <th className="text-left px-4 py-3">Your Role</th>
                                    <th className="text-left px-4 py-3">Maker (Stake | Odds | P2P)</th>
                                    <th className="text-left px-4 py-3">Taker (Stake | Odds | P2P)</th>
                                    <th className="text-left px-4 py-3">Pool / Result</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((r) => (
                                    <tr
                                        key={r.id}
                                        className="border-b border-yellow-400/10 hover:bg-[#0f1623] transition"
                                    >
                                        <td className="px-4 py-3 align-top">
                                            <div className="text-yellow-400 text-[11px]">{r.sport}</div>
                                            <div className="text-sm">{r.matchId}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-200 align-top">
                                            {r.teamsLabel}
                                        </td>
                                        <td className="px-4 py-3 text-sm align-top">
                                            <div className="font-medium">{r.yourRole}</div>
                                            <div className="text-[11px] text-gray-400">
                                                You →{" "}
                                                {r.yourRole === "Maker"
                                                    ? r.makerTeam
                                                    : r.yourRole === "Taker"
                                                        ? r.takerTeam
                                                        : "-"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm align-top">
                                            <div>
                                                {r.makerStake} <span className="text-gray-500">|</span> Odds:{" "}
                                                {r.makerOdds}
                                            </div>
                                            <div className="text-[11px] text-gray-400">
                                                Team: {r.makerTeam} <span className="text-gray-600">|</span> P2P:{" "}
                                                {r.p2pMaker}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm align-top">
                                            <div>
                                                {r.takerStake} <span className="text-gray-500">|</span> Odds:{" "}
                                                {r.takerOdds}
                                            </div>
                                            <div className="text-[11px] text-gray-400">
                                                Team: {r.takerTeam} <span className="text-gray-600">|</span> P2P:{" "}
                                                {r.p2pTaker}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm align-top">
                                            <div className="font-medium">{r.poolLabel}</div>
                                            <div
                                                className={`text-[11px] ${r.youResult.includes("WON")
                                                    ? "text-green-400"
                                                    : r.youResult.includes("LOST")
                                                        ? "text-red-400"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                {r.youResult}: {r.youPreview}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm align-top">
                                            <span
                                                className={`px-2 py-1 rounded-md text-xs ${r.status === "ACTIVE"
                                                    ? "bg-yellow-400/20 text-yellow-300"
                                                    : r.status === "PENDING"
                                                        ? "bg-gray-700 text-gray-200"
                                                        : r.status === "WON"
                                                            ? "bg-green-500/20 text-green-300"
                                                            : r.status === "LOST"
                                                                ? "bg-red-500/20 text-red-300"
                                                                : "bg-gray-700 text-gray-300"
                                                    }`}
                                            >
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-[11px] text-gray-500 mt-3">
                            * “Req. Stake” = opponent must lock this to balance P2P risk. Final credit =
                            pool minus {Math.round(COMMISSION_RATE * 100)}% of winner’s profit.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
