import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api from "../api/axiosConfig";
import { useSettings } from "../context/SettingsContext";
import { QRCodeCanvas } from "qrcode.react";
import { Smartphone, IndianRupee, MessageCircle } from "lucide-react";

export default function WalletPage() {
    const { settings, loading: settingsLoading } = useSettings();

    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [upiId, setUpiId] = useState("");
    const [proofReady, setProofReady] = useState(false);

    const username = localStorage.getItem("username") || "";
    const userId = localStorage.getItem("userId") || "";

    useEffect(() => {
        const loadData = async () => {
            try {
                const w = await api.get("/wallet");
                if (w.data?.success) setBalance(w.data.balance || 0);
            } catch { }

            try {
                const t = await api.get("/wallet/transactions");
                if (t.data?.success) setTransactions(t.data.transactions || []);
            } catch { }

            try {
                const u = await api.get("/user/profile");
                if (u.data?.success) setUpiId(u.data.user?.upiId || "");
            } catch { }
        };
        loadData();
    }, []);

    useEffect(() => {
        setProofReady(false);
    }, [amount]);

    const payToUpi = useMemo(
        () => settings?.paymentUpiId || "playgroundexchange@upi",
        [settings?.paymentUpiId]
    );

    const adminWhatsapp = useMemo(
        () => (settings?.supportWhatsapp || "").replace(/[^\d]/g, ""),
        [settings?.supportWhatsapp]
    );

    const openUpiIntent = () => {
        const v = Number(amount);
        if (!v || v <= 0) return alert("Enter a valid amount.");
        const url = `upi://pay?pa=${encodeURIComponent(payToUpi)}&pn=PlayGroundExchange&am=${v}&cu=INR&tn=Wallet Top-up`;
        window.location.href = url;
    };

    const markSent = async () => {
        const v = Number(amount);
        if (!v || v <= 0) return alert("Enter a valid amount.");

        try {
            const res = await api.post("/wallet/add", { amount: v });
            if (res.data?.success) {
                alert("Request sent to admin for approval.");
                setProofReady(true);
                const t = await api.get("/wallet/transactions");
                if (t.data?.success) setTransactions(t.data.transactions || []);
            } else {
                alert("Failed to send request.");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Top-up request failed.");
        }
    };

    const openWhatsApp = () => {
        const v = Number(amount) || 0;
        const msg = `Wallet Top-up Request\nAmount: ₹${v}\nUsername: ${username}\nUserID: ${userId}`;
        window.open(`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    };

    const requestWithdraw = async () => {
        const v = Number(withdrawAmount);
        if (!v || v <= 0) return alert("Enter a valid amount.");
        if (!upiId) return alert("Set your UPI ID in profile.");
        if (v > balance) return alert("Insufficient balance.");

        try {
            const res = await api.post("/wallet/withdraw", { amount: v });
            alert(res.data?.message || "Withdrawal request submitted.");
            setWithdrawAmount("");
            const t = await api.get("/wallet/transactions");
            if (t.data?.success) setTransactions(t.data.transactions || []);
        } catch (err) {
            alert(err.response?.data?.message || "Withdraw failed.");
        }
    };

    if (settingsLoading) {
        return (
            <>
                <Header />
                <div className="min-h-[60vh] grid place-items-center text-gray-400">
                    Loading settings…
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0d17] text-white">
            <Header />

            <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 space-y-6">
                <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex justify-between">
                    <div>
                        <p className="text-xs text-gray-400">Current Balance</p>
                        <h2 className="text-4xl font-extrabold text-yellow-400">₹{balance}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Your UPI</p>
                        <p>{upiId || "Set in Profile"}</p>
                    </div>
                </section>

                <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">Add Funds</h3>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Amount"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-950 border border-gray-700 focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>
                                <button onClick={openUpiIntent} className="bg-yellow-400 text-black px-3 py-2 rounded-md hover:bg-yellow-300">
                                    <Smartphone size={16} /> UPI Pay
                                </button>
                            </div>

                            {Number(amount) > 0 && (
                                <div className="mt-3 flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400">Scan & Pay</p>
                                        <QRCodeCanvas value={`upi://pay?pa=${payToUpi}&pn=PlayGroundExchange&am=${amount}&cu=INR`} size={140} bgColor="#0b0d17" fgColor="#facc15" />
                                    </div>

                                    <div className="text-sm text-gray-300">
                                        <p>Send UPI to: <b className="text-yellow-300">{payToUpi}</b></p>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={markSent} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded">
                                                I’ve Sent
                                            </button>
                                            <button
                                                onClick={openWhatsApp}
                                                disabled={!proofReady}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded ${proofReady ? "bg-green-700 hover:bg-green-600" : "bg-gray-700 cursor-not-allowed"
                                                    }`}
                                            >
                                                <MessageCircle size={16} /> WhatsApp Admin
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">Withdraw</h3>
                    <div className="flex gap-3">
                        <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Amount"
                            className="flex-1 bg-gray-950 border border-gray-700 px-3 py-2 rounded"
                        />
                        <button onClick={requestWithdraw} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-white">
                            Request Withdraw
                        </button>
                    </div>
                </section>

                <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">Recent Transactions</h3>
                    {transactions.length === 0 ? (
                        <p className="text-gray-500">No transactions yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {transactions.map((t) => (
                                <div key={t._id} className="bg-gray-950 border border-gray-800 p-2 rounded flex justify-between">
                                    <span className="capitalize">{t.method}</span>
                                    <span className={t.type === "credit" ? "text-green-400" : "text-red-400"}>
                                        {t.type === "credit" ? "+" : "-"}₹{t.amount}
                                    </span>
                                    <span className="text-xs">{t.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
