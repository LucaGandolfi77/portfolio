import { useState } from "react";
import { getSocket } from "../network/socket";
import { useGameStore } from "../state/gameStore";

export function LoginScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuth = useGameStore((s) => s.setAuth);

  const submit = () => {
    if (!username.trim() || !password.trim()) {
      setError("Fill in all fields");
      return;
    }
    const socket = getSocket();
    socket.emit(mode, { username: username.trim(), password }, (res: any) => {
      if (res.error) {
        setError(res.error);
      } else {
        setAuth({ token: res.token, userId: res.userId, username: res.username });
      }
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔥 Emberfall Online</h1>
        <p style={styles.sub}>{mode === "login" ? "Welcome back, Wanderer" : "Forge your legacy"}</p>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(""); }}
          autoFocus
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.btn} onClick={submit}>
          {mode === "login" ? "Enter Vessalia" : "Create Account"}
        </button>

        <button
          style={styles.link}
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
        >
          {mode === "login" ? "New here? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100vw", height: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #0a0a0f 0%, #1a1020 50%, #0a0a0f 100%)",
  },
  card: {
    background: "rgba(20, 15, 30, 0.9)", borderRadius: 16, padding: "2.5rem 2rem",
    width: 360, display: "flex", flexDirection: "column", gap: "1rem",
    border: "1px solid rgba(232, 193, 122, 0.2)",
    boxShadow: "0 0 40px rgba(232, 130, 50, 0.1)",
  },
  title: { color: "#e8c17a", fontSize: "1.8rem", textAlign: "center", fontWeight: 700 },
  sub: { color: "#8a7a6a", fontSize: "0.85rem", textAlign: "center", marginBottom: "0.5rem" },
  input: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,193,122,0.2)",
    borderRadius: 8, padding: "0.75rem 1rem", color: "#e8c17a", fontSize: "0.95rem",
    outline: "none", transition: "border-color 0.2s",
  },
  btn: {
    background: "linear-gradient(135deg, #c0501a, #e8822a)", color: "#fff",
    border: "none", borderRadius: 8, padding: "0.8rem", fontSize: "1rem",
    fontWeight: 700, cursor: "pointer", marginTop: "0.5rem",
  },
  link: {
    background: "none", border: "none", color: "#8a7a6a", fontSize: "0.8rem",
    cursor: "pointer", textAlign: "center", padding: "0.3rem",
  },
  error: { color: "#e85050", fontSize: "0.8rem", textAlign: "center" },
};
