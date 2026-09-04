import { useState, useEffect } from "react";
import { getSocket } from "../network/socket";

interface InventoryItem {
  id: string;
  defId: string;
  name: string;
  type: string;
  rarity: string;
  levelReq?: number;
  classReq?: string;
  baseStats: Record<string, number>;
  description: string;
  sellValue?: number;
  slotIdx?: number | null;
  upgradeLvl?: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: "#aaa",
  uncommon: "#4a4",
  rare: "#48f",
  epic: "#a4f",
  mythic: "#f84",
  ancient: "#f44",
};

const SLOT_NAMES: Record<number, string> = {
  0: "Weapon", 1: "Helmet", 2: "Armor", 3: "Gloves", 4: "Boots",
  5: "Belt", 6: "Ring", 7: "Necklace", 8: "Bracelet", 9: "Charm",
};

export function InventoryPanel({ onClose }: { onClose: () => void }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipment, setEquipment] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("inv:load", (res: any) => {
      if (res?.ok) {
        setInventory(res.inventory);
        setEquipment(res.equipment);
      }
    });

    const onUpdated = () => {
      socket.emit("inv:load", (res: any) => {
        if (res?.ok) {
          setInventory(res.inventory);
          setEquipment(res.equipment);
        }
      });
    };
    socket.on("inv:updated", onUpdated);
    return () => { socket.off("inv:updated", onUpdated); };
  }, []);

  const equip = (itemId: string) => {
    const socket = getSocket();
    socket.emit("inv:equip", { itemId }, (res: any) => {
      if (res?.ok) {
        setInventory((prev) => prev.filter((i) => i.id !== itemId));
        if (selected?.id === itemId) setSelected(null);
      }
    });
  };

  const unequip = (itemId: string) => {
    const socket = getSocket();
    socket.emit("inv:unequip", { itemId }, (res: any) => {
      if (res?.ok) {
        setEquipment((prev) => prev.filter((i) => i.id !== itemId));
        socket.emit("inv:load", (r: any) => {
          if (r?.ok) { setInventory(r.inventory); setEquipment(r.equipment); }
        });
      }
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>Inventory</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Equipment slots */}
          <div style={styles.equipSection}>
            <h3 style={styles.sectionTitle}>Equipment</h3>
            <div style={styles.equipGrid}>
              {Object.entries(SLOT_NAMES).map(([idx, name]) => {
                const slotIdx = parseInt(idx);
                const item = equipment.find((e) => e.slotIdx === slotIdx);
                return (
                  <div
                    key={idx}
                    style={{
                      ...styles.equipSlot,
                      borderColor: item ? RARITY_COLORS[item.rarity] || "#666" : "#333",
                    }}
                    onClick={() => item && setSelected(item)}
                  >
                    <div style={styles.slotLabel}>{name}</div>
                    {item ? (
                      <div style={{ ...styles.itemIcon, color: RARITY_COLORS[item.rarity] || "#fff" }}>
                        {item.name.charAt(0)}
                      </div>
                    ) : (
                      <div style={styles.emptySlot}>—</div>
                    )}
                    {item && (
                      <button
                        style={styles.unequipBtn}
                        onClick={(e) => { e.stopPropagation(); unequip(item.id); }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory grid */}
          <div style={styles.invSection}>
            <h3 style={styles.sectionTitle}>Bag ({inventory.length}/100)</h3>
            <div style={styles.invGrid}>
              {inventory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.invSlot,
                    borderColor: RARITY_COLORS[item.rarity] || "#444",
                    background: selected?.id === item.id ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.3)",
                  }}
                  onClick={() => setSelected(item)}
                >
                  <div style={{ ...styles.itemIcon, color: RARITY_COLORS[item.rarity] || "#fff" }}>
                    {item.name.charAt(0)}
                  </div>
                  <div style={styles.itemName}>{item.name}</div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 20 - inventory.length) }).map((_, i) => (
                <div key={`empty-${i}`} style={styles.emptyInvSlot} />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={styles.detail}>
              <h3 style={{ color: RARITY_COLORS[selected.rarity] || "#fff" }}>{selected.name}</h3>
              <div style={styles.detailType}>{selected.rarity} {selected.type}</div>
              <div style={styles.detailDesc}>{selected.description}</div>
              <div style={styles.detailStats}>
                {Object.entries(selected.baseStats).map(([stat, val]) => (
                  <div key={stat}>+{val} {stat}</div>
                ))}
              </div>
              {selected.levelReq ? <div style={styles.detailReq}>Requires Level {selected.levelReq}</div> : null}
              {selected.classReq ? <div style={styles.detailReq}>Requires: {selected.classReq}</div> : null}
              {inventory.includes(selected) && (
                <button style={styles.equipBtn} onClick={() => equip(selected.id)}>Equip</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  panel: {
    background: "#1a1520", borderRadius: 12, width: 700, maxHeight: "85vh",
    display: "flex", flexDirection: "column", border: "1px solid #333",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #333" },
  title: { color: "#e8c17a", fontSize: "1.2rem", margin: 0 },
  closeBtn: { background: "none", border: "none", color: "#888", fontSize: "1.2rem", cursor: "pointer" },
  body: { display: "flex", gap: 12, padding: 12, overflow: "auto", flex: 1 },
  equipSection: { width: 200 },
  sectionTitle: { color: "#888", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: 8 },
  equipGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 },
  equipSlot: {
    background: "rgba(0,0,0,0.4)", border: "1px solid #333", borderRadius: 6,
    padding: 6, textAlign: "center", position: "relative", cursor: "pointer", minHeight: 52,
  },
  slotLabel: { fontSize: "0.55rem", color: "#666", textTransform: "uppercase" },
  itemIcon: { fontSize: "1.2rem", fontWeight: 700 },
  emptySlot: { color: "#333", fontSize: "1.2rem" },
  unequipBtn: {
    position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", border: "none",
    color: "#888", fontSize: "0.6rem", cursor: "pointer", borderRadius: 3, padding: "1px 4px",
  },
  invSection: { flex: 1 },
  invGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 },
  invSlot: {
    background: "rgba(0,0,0,0.3)", border: "1px solid #444", borderRadius: 4,
    padding: 4, textAlign: "center", cursor: "pointer", transition: "background 0.15s",
  },
  emptyInvSlot: { background: "rgba(0,0,0,0.15)", border: "1px solid #222", borderRadius: 4, minHeight: 48 },
  itemName: { fontSize: "0.55rem", color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  detail: {
    width: 180, background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: 12,
    border: "1px solid #333", alignSelf: "flex-start",
  },
  detailType: { fontSize: "0.7rem", color: "#888", textTransform: "capitalize", marginTop: 4 },
  detailDesc: { fontSize: "0.7rem", color: "#999", marginTop: 8, lineHeight: 1.4 },
  detailStats: { fontSize: "0.7rem", color: "#4a4", marginTop: 8 },
  detailReq: { fontSize: "0.65rem", color: "#f84", marginTop: 4 },
  equipBtn: {
    marginTop: 10, width: "100%", padding: "6px 0", background: "#2a6a2a", color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.8rem",
  },
};
