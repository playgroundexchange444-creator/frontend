// 📁 main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { SettingsProvider } from "./context/SettingsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  // 🔧 Temporarily disable StrictMode to prevent double useEffect
  // <React.StrictMode>
  <SettingsProvider>
    <App />
  </SettingsProvider>
  // </React.StrictMode>
);
