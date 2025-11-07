import React from "react";

export default function AddFundsButton({ amount, txnId, upiId, adminWhats }) {
    const finalUpiId = upiId || "playgroundexchange@upi";
    const finalWhatsApp = (adminWhats || "").replace(/[^\d]/g, "");

    const upiLink = `upi://pay?pa=${encodeURIComponent(
        finalUpiId
    )}&pn=PlayGroundExchange&am=${amount}&cu=INR&tn=${encodeURIComponent(
        `Top-up for txn:${txnId}`
    )}`;

    const waMsg = encodeURIComponent(
        `I have paid ₹${amount}. TxnID: ${txnId}. UserID: ${localStorage.getItem(
            "userId"
        )}`
    );
    const waLink = `https://wa.me/${finalWhatsApp}?text=${waMsg}`;

    const handleOpenUPI = () => {
        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
            window.location.href = upiLink;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-gray-900 text-white rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-yellow-400">Add Balance</h2>
            <p className="text-gray-400 text-center">
                Pay ₹{amount} to our official UPI and send proof via WhatsApp.
            </p>

            <button
                onClick={handleOpenUPI}
                className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md hover:bg-yellow-400 transition"
            >
                Open UPI App
            </button>

            <span className="text-gray-500">or</span>

            <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    upiLink
                )}`}
                alt="upi-qr"
                className="rounded-lg shadow-md"
            />

            <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 transition"
            >
                Send Proof via WhatsApp
            </a>
        </div>
    );
}
