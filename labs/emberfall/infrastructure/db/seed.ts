import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed] Seeding Emberfall database...");

  // Item Definitions (20 items for MVP)
  const items = await Promise.all([
    prisma.itemDefinition.create({ data: { id: "iron_sword", name: "Iron Sword", type: "weapon", rarity: "common", baseStats: { attack: 8, speed: 1.0 }, description: "A sturdy blade forged in Greenvale.", sellValue: 15 } }),
    prisma.itemDefinition.create({ data: { id: "iron_helm", name: "Iron Helm", type: "helmet", rarity: "common", baseStats: { defense: 5 }, description: "Standard-issue head protection.", sellValue: 12 } }),
    prisma.itemDefinition.create({ data: { id: "iron_chest", name: "Iron Chestplate", type: "armor", rarity: "common", baseStats: { defense: 12, vitality: 2 }, description: "Covers the vital organs well.", sellValue: 20 } }),
    prisma.itemDefinition.create({ data: { id: "iron_gloves", name: "Iron Gauntlets", type: "gloves", rarity: "common", baseStats: { defense: 3, attack: 1 }, description: "Reinforced knuckle guards.", sellValue: 8 } }),
    prisma.itemDefinition.create({ data: { id: "leather_boots", name: "Leather Boots", type: "boots", rarity: "common", baseStats: { defense: 2, agility: 1 }, description: "Comfortable for long marches.", sellValue: 10 } }),
    prisma.itemDefinition.create({ data: { id: "copper_ring", name: "Copper Band", type: "ring", rarity: "common", baseStats: { vitality: 3 }, description: "A simple copper ring.", sellValue: 5 } }),
    prisma.itemDefinition.create({ data: { id: "ember_blade", name: "Ember Blade", type: "weapon", rarity: "uncommon", levelReq: 5, baseStats: { attack: 18, magicAttack: 5 }, description: "The blade glows faintly with ember energy.", sellValue: 60 } }),
    prisma.itemDefinition.create({ data: { id: "ashward_helm", name: "Ashward Helm", type: "helmet", rarity: "uncommon", levelReq: 5, baseStats: { defense: 10, vitality: 4 }, description: "Worn by the scouts of Ashen Ridge.", sellValue: 55 } }),
    prisma.itemDefinition.create({ data: { id: "vanguard_plate", name: "Vanguard Plate", type: "armor", rarity: "uncommon", levelReq: 5, classReq: "vanguard", baseStats: { defense: 22, vitality: 6 }, description: "Heavy plate forged for vanguards.", sellValue: 90 } }),
    prisma.itemDefinition.create({ data: { id: "ranger_cloak", name: "Windwalker Cloak", type: "armor", rarity: "uncommon", levelReq: 5, classReq: "ranger", baseStats: { defense: 10, agility: 8 }, description: "Light cloak that muffles footsteps.", sellValue: 85 } }),
    prisma.itemDefinition.create({ data: { id: "arcane_staff", name: "Glowroot Staff", type: "weapon", rarity: "uncommon", levelReq: 5, classReq: "arcanist", baseStats: { magicAttack: 20, intellect: 5 }, description: "Channelled from deep forest roots.", sellValue: 80 } }),
    prisma.itemDefinition.create({ data: { id: "mystic_orb", name: "Spirit Orb", type: "weapon", rarity: "uncommon", levelReq: 5, classReq: "mystic", baseStats: { magicAttack: 15, spirit: 8 }, description: "Orb of flowing spiritual energy.", sellValue: 75 } }),
    prisma.itemDefinition.create({ data: { id: "feral_claws", name: "Razor Claws", type: "weapon", rarity: "uncommon", levelReq: 5, classReq: "feral", baseStats: { attack: 14, agility: 6 }, description: "Sharp enough to rend stone.", sellValue: 70 } }),
    prisma.itemDefinition.create({ data: { id: "ember_necklace", name: "Emberheart Pendant", type: "necklace", rarity: "rare", levelReq: 8, baseStats: { vitality: 8, spirit: 5, magicDefence: 6 }, description: "Pulsates with raw ember energy.", sellValue: 120 } }),
    prisma.itemDefinition.create({ data: { id: "cinder_belt", name: "Cinder Belt", type: "belt", rarity: "rare", levelReq: 8, baseStats: { defense: 8, attack: 5 }, description: "Forged in volcanic heat.", sellValue: 110 } }),
    prisma.itemDefinition.create({ data: { id: "moon_ring", name: "Moonlit Signet", type: "ring", rarity: "rare", levelReq: 10, baseStats: { magicAttack: 10, mana: 30 }, description: "Glows under moonlight.", sellValue: 150 } }),
    prisma.itemDefinition.create({ data: { id: "heal_potion", name: "Minor Restoration Tonic", type: "consumable", rarity: "common", baseStats: { heal: 50 }, description: "Restores 50 HP.", sellValue: 5 } }),
    prisma.itemDefinition.create({ data: { id: "mana_potion", name: "Clarity Draught", type: "consumable", rarity: "common", baseStats: { restoreMana: 30 }, description: "Restores 30 Mana.", sellValue: 5 } }),
    prisma.itemDefinition.create({ data: { id: "strength_gem", name: "Might Shard", type: "gem", rarity: "uncommon", baseStats: { might: 3 }, description: "A crystallized fragment of raw power.", sellValue: 40 } }),
    prisma.itemDefinition.create({ data: { id: "speed_gem", name: "Agility Shard", type: "gem", rarity: "uncommon", baseStats: { agility: 3 }, description: "A crystallized fragment of swiftness.", sellValue: 40 } }),
  ]);
  console.log(`[seed] Created ${items.length} item definitions`);

  // Quest Definitions (5 quests for MVP)
  const quests = await Promise.all([
    prisma.questDefinition.create({
      data: {
        id: "q_welcome",
        name: "First Steps",
        description: "Speak with Elder Theron in Emberhold to begin your journey.",
        objectives: JSON.stringify([{ type: "talk", target: "elder_theron", count: 1 }]),
        rewards: JSON.stringify({ xp: 50, coins: 20 }),
        npcGiver: "elder_theron",
      },
    }),
    prisma.questDefinition.create({
      data: {
        id: "q_rid_pests",
        name: "Pest Control",
        description: "Clear 5 Ember Rats from the outskirts of Greenvale.",
        objectives: JSON.stringify([{ type: "kill", target: "ember_rat", count: 5 }]),
        rewards: JSON.stringify({ xp: 120, coins: 50, items: ["heal_potion", "heal_potion"] }),
        npcGiver: "farmer_bren",
        levelReq: 1,
      },
    }),
    prisma.questDefinition.create({
      data: {
        id: "q_gather_embers",
        name: "Gathering Embers",
        description: "Collect 3 Ember Cores from Cinderbound Scouts.",
        objectives: JSON.stringify([{ type: "kill", target: "cinderbound_scout", count: 3 }]),
        rewards: JSON.stringify({ xp: 200, coins: 80, items: ["mana_potion"] }),
        npcGiver: "alchemist_vel",
        levelReq: 2,
      },
    }),
    prisma.questDefinition.create({
      data: {
        id: "q_lost_patrol",
        name: "The Lost Patrol",
        description: "Find the remains of Captain Aldric's patrol near Ashen Ridge.",
        objectives: JSON.stringify([{ type: "interact", target: "patrol_remains", count: 1 }]),
        rewards: JSON.stringify({ xp: 300, coins: 120, items: ["strength_gem"] }),
        npcGiver: "captain_aldric",
        levelReq: 3,
      },
    }),
    prisma.questDefinition.create({
      data: {
        id: "q_cinder_warden",
        name: "The Cinder Warden",
        description: "Defeat the Cinder Warden lurking in the Ember Cavern.",
        objectives: JSON.stringify([{ type: "kill", target: "cinder_warden", count: 1 }]),
        rewards: JSON.stringify({ xp: 500, coins: 200, items: ["ember_blade", "ashward_helm"] }),
        npcGiver: "captain_aldric",
        levelReq: 5,
      },
    }),
  ]);
  console.log(`[seed] Created ${quests.length} quest definitions`);

  console.log("[seed] Seed complete!");
}

main()
  .catch((e) => {
    console.error("[seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
