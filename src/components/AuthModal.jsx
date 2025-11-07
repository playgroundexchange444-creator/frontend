import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

const AuthModal = ({ isOpen, onClose, mode, setMode }) => {
    const [formData, setFormData] = useState({ name: "", username: "", password: "" });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const resetForm = () => setFormData({ name: "", username: "", password: "" });

    const handleSubmit = async () => {
        if (!formData.username || !formData.password) {
            toast.warn("Please fill all required fields");
            return;
        }
        if (mode === "signup" && !formData.name) {
            toast.warn("Please enter your name");
            return;
        }

        try {
            setLoading(true);
            const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
            const { data } = await api.post(endpoint, formData);

            if (!data.success) {
                toast.error(data.message || "Something went wrong");
                resetForm();
                return;
            }

            toast.success(data.message || "Success");

            if (mode === "signup") {
                resetForm();
                setTimeout(() => {
                    setMode("login");
                    setLoading(false);
                    toast.info("Now login with your new account");
                }, 1000);
                return;
            }

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("username", data.user.username);

            resetForm();
            setTimeout(() => {
                onClose();
                window.location.href = "/";
            }, 800);
        } catch (err) {
            const msg = err.response?.data?.message || "Server error";
            toast.error(msg);
            resetForm();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-900/80 border border-yellow-400/40 text-white rounded-2xl shadow-2xl w-[90%] max-w-md p-8 relative"
                    >
                        <button onClick={onClose} className="absolute top-3 right-4 text-yellow-400 hover:text-white">
                            ✕
                        </button>

                        <h2 className="text-3xl font-bold text-yellow-400 text-center mb-6">
                            {mode === "login" ? "Login" : "Sign Up"}
                        </h2>

                        {mode === "signup" && (
                            <div className="mb-4">
                                <label className="block text-sm mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-yellow-400"
                            />
                            {mode === "login" && <div className="text-right text-sm text-yellow-400 mt-1 cursor-pointer">Forgot Password?</div>}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-md hover:bg-yellow-500 transition"
                        >
                            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
                        </button>

                        <p className="text-center text-sm text-gray-400 mt-4">
                            {mode === "login" ? (
                                <>
                                    Don’t have an account?{" "}
                                    <span className="text-yellow-400 cursor-pointer" onClick={() => setMode("signup")}>
                                        Sign up
                                    </span>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <span className="text-yellow-400 cursor-pointer" onClick={() => setMode("login")}>
                                        Login
                                    </span>
                                </>
                            )}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
