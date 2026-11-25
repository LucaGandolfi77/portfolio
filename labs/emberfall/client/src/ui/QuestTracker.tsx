import { useState, useEffect } from "react";
import { getSocket } from "../network/socket";

interface QuestObjective {
  type: string;
  target: string;
  count: number;
}

interface ActiveQuest {
  id: string;
  name: string;
  description: string;
  objectives: string; // JSON string
  counters: string;   // JSON string
}

export function QuestTracker() {
  const [quests, setQuests] = useState<ActiveQuest[]>([]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("quest:load", (res: any) => {
      if (res?.ok) setQuests(res.active);
    });

    const onProgress = (data: { questId: string; counters: Record<string, number> }) => {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === data.questId ? { ...q, counters: JSON.stringify(data.counters) } : q
        )
      );
    };
    socket.on("quest:progress:update", onProgress);
    return () => { socket.off("quest:progress:update", onProgress); };
  }, []);

  if (quests.length === 0) return null;

  return (
    <div style={styles.container}>
      <div style={styles.title}>Active Quests</div>
      {quests.map((q) => {
        const objectives = JSON.parse(q.objectives) as QuestObjective[];
        const counters = JSON.parse(q.counters) as Record<string, number>;
        return (
          <div key={q.id} style={styles.quest}>
            <div style={styles.questName}>{q.name}</div>
            {objectives.map((obj, i) => {
              const key = `${obj.type}:${obj.target}`;
              const current = counters[key] ?? 0;
              const done = current >= obj.count;
              return (
                <div key={i} style={{ ...styles.objective, color: done ? "#4a4" : "#aaa" }}>
                  {done ? "✓" : "○"} {obj.target.replace(/_/g, " ")} ({current}/{obj.count})
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed", top: 12, right: 12,
    background: "rgba(10, 8, 15, 0.85)", borderRadius: 8, padding: "10px 14px",
    border: "1px solid rgba(232,193,122,0.2)", width: 200, zIndex: 50,
    backdropFilter: "blur(4px)",
  },
  title: { color: "#e8c17a", fontWeight: 700, fontSize: "0.8rem", marginBottom: 6 },
  quest: { marginBottom: 8 },
  questName: { color: "#ccc", fontWeight: 600, fontSize: "0.75rem", marginBottom: 2 },
  objective: { fontSize: "0.65rem", marginLeft: 4 },
};
