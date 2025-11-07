import React from "react";

export default function Footer() {
    return (
        <footer className="text-center text-gray-500 text-xs py-4 border-t border-gray-800 mt-8">
            © {new Date().getFullYear()} PlayGround Exchange — All rights reserved.
        </footer>
    );
}
