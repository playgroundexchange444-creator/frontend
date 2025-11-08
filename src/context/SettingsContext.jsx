import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosConfig";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/settings");
                if (res.data?.success) {
                    setSettings(res.data.settings);
                } else {
                    console.warn("Settings API returned no data");
                }
            } catch (err) {
                console.error("Error fetching settings:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used inside a SettingsProvider");
    }
    return context;
};
