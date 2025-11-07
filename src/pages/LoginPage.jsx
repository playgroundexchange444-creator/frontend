import React, { useState } from "react";
import AuthModal from "../components/AuthModal";

export default function LoginPage() {
    const [isOpen, setIsOpen] = useState(true);
    const [mode, setMode] = useState("login");

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <AuthModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                mode={mode}
                setMode={setMode}
            />
        </div>
    );
}
