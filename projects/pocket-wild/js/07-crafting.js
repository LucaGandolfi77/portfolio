/* ================= CRAFTING ================= */
const RECIPES=[
 {n:'Sphere',icon:'🔮',cost:{grass:2,ess:1},give:()=>addSphere(0,1),desc:'Catch basic Pals'},
 {n:'Great Sphere',icon:'🔵',cost:{wood:3,ess:2},give:()=>addSphere(1,1),desc:'Better catch rate'},
 {n:'Ultra Sphere',icon:'💗',cost:{stone:3,ess:4,berry:1},give:()=>addSphere(2,1),desc:'Rare Pals'},
 {n:'Potion',icon:'🧪',cost:{berry:3},give:()=>{G.inv.potion=(G.inv.potion||0)+1;},desc:'Heal 60 HP'},
 {n:'Cooked Berries',icon:'🍡',cost:{berry:3},give:()=>{G.inv.cooked=(G.inv.cooked||0)+2;},desc:'+40 hunger'},
 {n:'Stew',icon:'🍲',cost:{berry:2,grass:2},give:()=>{G.inv.stew=(G.inv.stew||0)+1;},desc:'+60 hunger'},
 {n:'Sword',icon:'⚔️',cost:{wood:3,stone:2},give:()=>{G.inv.sword=1;G.equip='sword';},desc:'Melee weapon (18 dmg)'},
 {n:'Bow',icon:'🏹',cost:{wood:3,grass:2},give:()=>{G.inv.bow=1;G.equip='bow';},desc:'Ranged weapon'},
 {n:'Arrow ×3',icon:'➶',cost:{stone:1},give:()=>{G.inv.arrows=(G.inv.arrows||0)+3;},desc:'Ammo for the bow'},
 {n:'Berry Seeds',icon:'🌱',cost:{berry:2},give:()=>{G.inv.seeds=(G.inv.seeds||0)+1;},desc:'Plant on grass, harvest berries'},
 {n:'Skill Scroll',icon:'📜',cost:{ess:3,wood:2},give:()=>{G.inv.scroll=(G.inv.scroll||0)+1;},desc:'Teach a Pal a new skill'},
 {n:'Fishing Rod',icon:'🎣',cost:{wood:3,grass:2},give:()=>{G.inv.rod=1;},desc:'Fish sea Pals from any shore'},
 {n:'Lure',icon:'🪱',cost:{berry:2},give:()=>{G.inv.lure=(G.inv.lure||0)+1;},desc:'Bites come faster (fishing)'}
];
const STRUCTURES=[
 {id:'campfire',n:'Campfire',icon:'🔥',cost:{wood:3,stone:2},desc:'Light + slow heal at night'},
 {id:'lantern',n:'Lantern',icon:'🏮',cost:{stone:2,grass:2},desc:'Pushes back the dark at night'},
 {id:'bed',n:'Bed',icon:'🛏️',cost:{grass:4,wood:3},desc:'Full heal + respawn point'},
 {id:'workbench',n:'Workbench',icon:'🛠️',cost:{wood:5},desc:'Crafting station'},
 {id:'chest',n:'Chest',icon:'📦',cost:{wood:4},desc:'Extra storage'},
 {id:'ranch',n:'Ranch',icon:'🥚',cost:{wood:6,grass:4},desc:'Breed two Pals → eggs'},
 {id:'arena',n:'Arena',icon:'⚔️',cost:{stone:6,wood:3},desc:'Duel an AI trainer'},
 {id:'tower',n:'Tower of Trials',icon:'🗼',cost:{stone:8,wood:5,ess:3},desc:'Climb 10 floors of trials'}
];

