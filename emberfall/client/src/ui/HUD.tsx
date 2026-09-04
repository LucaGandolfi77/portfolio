import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import { InventoryPanel } from "./InventoryPanel";
import { QuestTracker } from "./QuestTracker";

export function HUD() {
  const character = useGameStore((s) => s.character);
  const [showInventory, setShowInventory] = useState(false);

  if (!character) return null;

  const xpPct = character.level < 60 ? (character.xp / (100 * Math.pow(1.5, character.level - 1))) * 100 : 100;

  return (
    <>
      {/* Top-left: Player frame */}
      <div style={styles.playerFrame}>
        <div style={styles.playerName}>{character.name}</div>
        <div style={styles.playerClass}>Lv.{character.level} {character.classType}</div>
        <div style={styles.bar}>
          <div style={{ ...styles.barFill, background: "#c33", width: `${(character.hp / character.maxHp) * 100}%` }} />
          <span style={styles.barText}>{character.hp}/{character.maxHp}</span>
        </div>
        <div style={styles.bar}>
          <div style={{ ...styles.barFill, background: "#38f", width: `${(character.mana / character.maxMana) * 100}%` }} />
          <span style={styles.barText}>{character.mana}/{character.maxMana}</span>
        </div>
        <div style={styles.bar}>
          <div style={{ ...styles.barFill, background: "#da3", width: `${xpPct}%` }} />
          <span style={styles.barText}>XP {character.xp}/{Math.round(100 * Math.pow(1.5, character.level - 1))}</span>
        </div>
      </div>

      {/* Bottom: Hotbar */}
      <div style={styles.hotbar}>
        <HotbarSlot keybind="1" label="Bash" />
        <HotbarSlot keybind="2" label="Whirl" />
        <HotbarSlot keybind="3" label="Bulwark" />
      </div>

      {/* Bottom-left: Action buttons */}
      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={() => setShowInventory(true)}>
          Bag
        </button>
      </div>

      {showInventory && <InventoryPanel onClose={() => setShowInventory(false)} />}
      <QuestTracker />
    </>
  );
}

function HotbarSlot({ keybind, label }: { keybind: string; label: string }) {
  return (
    <div style={styles.slot}>
      <div style={styles.slotKey}>{keybind}</div>
      <div style={styles.slotLabel}>{label}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  playerFrame: {
    position: "fixed", top: 12, left: 12,
    background: "rgba(10, 8, 15, 0.85)", borderRadius: 8, padding: "10px 14px",
    border: "1px solid rgba(232,193,122,0.2)", width: 200, zIndex: 50,
    backdropFilter: "blur(4px)",
  },
  playerName: { color: "#e8c17a", fontWeight: 700, fontSize: "0.9rem" },
  playerClass: { color: "#888", fontSize: "0.7rem", marginBottom: 6 },
  bar: {
    position: "relative", height: 14, background: "rgba(0,0,0,0.5)",
    borderRadius: 4, overflow: "hidden", marginBottom: 3,
  },
  barFill: { height: "100%", transition: "width 0.3s", borderRadius: 4 },
  barText: {
    position: "absolute", inset: 0, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "0.55rem", color: "#fff", fontWeight: 700,
    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
  },
  hotbar: {
    position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
    display: "flex", gap: 6, zIndex: 50,
  },
  slot: {
    width: 48, height: 48, background: "rgba(10, 8, 15, 0.85)",
    border: "1px solid rgba(232,193,122,0.3)", borderRadius: 6,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  },
  slotKey: { fontSize: "0.55rem", color: "#888" },
  slotLabel: { fontSize: "0.6rem", color: "#ccc", fontWeight: 600 },
  actions: {
    position: "fixed", bottom: 16, right: 16, display: "flex", gap: 6, zIndex: 50,
  },
  actionBtn: {
    background: "rgba(10, 8, 15, 0.85)", border: "1px solid rgba(232,193,122,0.3)",
    color: "#e8c17a", padding: "8px 16px", borderRadius: 6, cursor: "pointer",
    fontWeight: 700, fontSize: "0.8rem",
  },
};
