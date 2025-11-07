import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import WalletPage from "./pages/WalletPage";
import MyBets from "./pages/MyBets";
import BetDetails from "./pages/BetDetails";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import OpenBets from "./pages/OpenBets";
import ProtectedRoute from "./components/ProtectedRoute";
import { connectUserSocket, getUserSocket, disconnectUserSocket } from "./socket/userSocket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import notificationSound from "./assets/notify.mp3";

function App() {
  useEffect(() => {
    const socket = connectUserSocket();
    if (!socket) return;

    if (socket._listenersAttached) return;
    socket._listenersAttached = true;

    const audio = new Audio(notificationSound);
    const playSound = () => {
      try {
        audio.currentTime = 0;
        audio.play();
      } catch { }
    };

    socket.off("txn:approved").on("txn:approved", (txn) => {
      toast.success(`Payment ${txn.amount} approved`);
      playSound();
    });

    socket.off("match:result").on("match:result", (data) => {
      if (data.status === "won") {
        toast.success(`You won ${data.amount} in ${data.matchId}`);
      } else {
        toast.error(`You lost ${data.amount} in ${data.matchId}`);
      }
      playSound();
    });

    socket.off("bet:pending").on("bet:pending", (bet) => {
      toast.info(`New bet on ${bet.team} (${bet.matchId})`);
      playSound();

      let blinkCount = 0;
      const blink = setInterval(() => {
        document.title =
          document.title === "New Bet Alert"
            ? "PlayGround Exchange"
            : "New Bet Alert";
        if (++blinkCount > 6) {
          clearInterval(blink);
          document.title = "PlayGround Exchange";
        }
      }, 800);
    });

    socket.off("bet:matched").on("bet:matched", (bet) => {
      toast.success(`Bet matched for ${bet.matchId}`);
      playSound();
    });

    socket.off("bet:result").on("bet:result", (data) => {
      if (data.result === "won") {
        toast.success(`You won ${data.amount} (Bet ID: ${data.betId})`);
      } else {
        toast.error(`You lost (Bet ID: ${data.betId})`);
      }
      playSound();
    });

    return () => {
      disconnectUserSocket();
    };
  }, []);

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={2500} theme="dark" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/my-bets" element={<ProtectedRoute><MyBets /></ProtectedRoute>} />
        <Route path="/open-bets" element={<ProtectedRoute><OpenBets /></ProtectedRoute>} />
        <Route path="/bet/:matchId" element={<ProtectedRoute><BetDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
