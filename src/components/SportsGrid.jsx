import React from "react";

const FLAG_MAP = {
    india: "https://flagcdn.com/w320/in.png",
    australia: "https://flagcdn.com/w320/au.png",
    pakistan: "https://flagcdn.com/w320/pk.png",
    england: "https://flagcdn.com/w320/gb-eng.png",
    "south africa": "https://flagcdn.com/w320/za.png",
    "new zealand": "https://flagcdn.com/w320/nz.png",
    "sri lanka": "https://flagcdn.com/w320/lk.png",
    bangladesh: "https://flagcdn.com/w320/bd.png",
    "west indies": "https://upload.wikimedia.org/wikipedia/en/7/74/West_Indies_Cricket_Team_Flag.png",
    afghanistan: "https://flagcdn.com/w320/af.png",
    zimbabwe: "https://flagcdn.com/w320/zw.png",
    ireland: "https://flagcdn.com/w320/ie.png",
    namibia: "https://flagcdn.com/w320/na.png",
};

export default function SportsGrid({ sports = [], onBetClick }) {
    if (!sports.length)
        return <div className="text-center text-gray-400 py-6">No matches available.</div>;

    const getFlag = (teamName) => {
        if (!teamName) return null;
        return FLAG_MAP[teamName.toLowerCase()] || null;
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">⚡ Cricket Matches</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sports.map((m, idx) => {
                    const isLive = m.status === "live";
                    const isCompleted = m.status === "completed" || m.status === "finished";
                    const isUpcoming = !isLive && !isCompleted;
                    const flagA = getFlag(m.teamA);
                    const flagB = getFlag(m.teamB);

                    return (
                        <div
                            key={idx}
                            className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-yellow-500/30 transition-transform duration-300 hover:scale-[1.02]"
                        >
                            <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
                                <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${isLive
                                        ? "bg-red-600 text-white animate-pulse"
                                        : isCompleted
                                            ? "bg-gray-600 text-white"
                                            : "bg-yellow-400 text-black"
                                        }`}
                                >
                                    {m.status?.toUpperCase() || "UPCOMING"}
                                </span>
                                <span className="text-xs text-gray-400 font-medium truncate max-w-[150px]">
                                    🏆 {m.leagueName || "Unknown League"}
                                </span>
                            </div>

                            <div className="flex relative bg-black/40">
                                {[{ team: m.teamA, score: m.teamA_score, flag: flagA }, { team: m.teamB, score: m.teamB_score, flag: flagB }].map((t, i) => (
                                    <div key={i} className="w-1/2 flex flex-col relative">
                                        {t.flag ? (
                                            <img src={t.flag} alt={t.team} className="w-full h-28 object-cover" />
                                        ) : (
                                            <div className="w-full h-28 bg-black" />
                                        )}

                                        {isLive && t.score && (
                                            <div className="absolute top-2 right-2 bg-black/70 border border-yellow-400 px-2 py-1 rounded">
                                                <p className="text-xs font-bold text-yellow-300">{t.score}</p>
                                            </div>
                                        )}

                                        <div className="bg-gray-950 py-2 text-center">
                                            <p className="text-white text-sm font-semibold truncate">{t.team || "Team"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-gray-950">
                                <p className="text-sm text-gray-400 mb-2">
                                    🏏 {m.sport || "Cricket"} •{" "}
                                    {m.startTime
                                        ? new Date(m.startTime).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "Date not available"}
                                </p>

                                <p className="text-yellow-400 font-semibold mb-3">
                                    Odds: {m.oddsA || "-"} / {m.oddsB || "-"}
                                </p>

                                {isUpcoming && (
                                    <button
                                        onClick={() => onBetClick && onBetClick(m)}
                                        className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 w-full"
                                    >
                                        Bet Now
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
