import { useEffect, useState } from "react";
import { GameCanvas } from "./game/GameCanvas";
import { LoginScreen } from "./ui/LoginScreen";
import { HUD } from "./ui/HUD";
import { useGameStore } from "./state/gameStore";
import { connectSocket } from "./network/socket";

export default function App() {
  const [connected, setConnected] = useState(false);
  const auth = useGameStore((s) => s.auth);

  useEffect(() => {
    connectSocket().then(() => setConnected(true));
  }, []);

  if (!connected) {
    return (
      <div style={styles.loading}>
        <h1 style={styles.title}>🔥 Emberfall Online</h1>
        <p style={styles.sub}>Connecting to server...</p>
      </div>
    );
  }

  if (!auth) return <LoginScreen />;

  return (
    <>
      <GameCanvas />
      <HUD />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    width: "100vw", height: "100vh",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    background: "#0a0a0f", color: "#e8c17a",
  },
  title: { fontSize: "2.5rem", marginBottom: "1rem" },
  sub: { fontSize: "1rem", color: "#888" },
};
