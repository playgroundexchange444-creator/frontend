import { disconnectUserSocket } from "../socket/userSocket";

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");

  disconnectUserSocket();
};
