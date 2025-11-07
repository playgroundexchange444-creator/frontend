import { io } from "socket.io-client";

let userSocket = null;

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.replace("/api", "") ||
  "http://localhost:4000";

export const connectUserSocket = () => {
  if (userSocket?.connected || userSocket?.connecting) return userSocket;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  userSocket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
  });

  if (!userSocket._baseEventsAttached) {
    userSocket.on("connect", () => {});
    userSocket.on("disconnect", () => {});
    userSocket.on("connect_error", () => {});
    userSocket._baseEventsAttached = true;
  }

  userSocket.connect();
  return userSocket;
};

export const getUserSocket = () => userSocket;

export const disconnectUserSocket = () => {
  if (userSocket) {
    try {
      userSocket.removeAllListeners();
      userSocket.disconnect();
    } catch {}
    userSocket = null;
  }
};
