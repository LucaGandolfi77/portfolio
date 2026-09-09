const Render = (() => {
  'use strict';
  const D = VOIDBOUND;
  let canvas, ctx, W, H, camera, map_buffer;
  let frame_count = 0;
  let shake = { x: 0, y: 0, intensity: 0 };
  let damage_flash = 0;
  let level_up_banners = [];
  let death_effects = [];

  function init(c) {
    canvas = c;
    ctx = canvas.getContext('2d');
    resize();
    camera = { x: 0, y: 0 };
    map_buffer = document.createElement('canvas');
    map_buffer.width = D.MAP.W;
    map_buffer.height = D.MAP.H;
    Sprites.generate_all();
    render_map_buffer();
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  }

  function render_map_buffer() {
    const mc = map_buffer.getContext('2d');
    mc.fillStyle = '#0a0a14';
    mc.fillRect(0, 0, D.MAP.W, D.MAP.H);

    // tiles con variazione di tono e texture
    for (let x = 0; x < D.MAP.W; x += 64) {
      for (let y = 0; y < D.MAP.H; y += 64) {
        const hash = ((x * 7 + y * 13) % 17) / 17;
        mc.fillStyle = hash < 0.3 ? '#0e0e1a' : hash < 0.6 ? '#0c0c16' : '#0b0b15';
        mc.fillRect(x, y, 64, 64);
        // micro-dettagli
        if (hash > 0.85) {
          mc.fillStyle = 'rgba(255,255,255,0.015)';
          mc.fillRect(x + 10, y + 10, 2, 2);
        }
        // grana suolo
        if (hash > 0.4 && hash < 0.5) {
          mc.fillStyle = 'rgba(60,50,80,0.06)';
          mc.fillRect(x + 20, y + 30, 8, 3);
        }
      }
    }

    // strade laterali
    mc.fillStyle = '#111120';
    mc.fillRect(0, D.MAP.lanes.top.y - 90, D.MAP.W, 180);
    mc.fillRect(0, D.MAP.lanes.bot.y - 90, D.MAP.W, 180);

    // texture asfalto strade
    for (let sx = 0; sx < D.MAP.W; sx += 32) {
      for (const ly of [D.MAP.lanes.top.y, D.MAP.lanes.bot.y]) {
        if (Math.random() < 0.4) {
          mc.fillStyle = `rgba(30,30,50,${0.05 + Math.random() * 0.05})`;
          mc.fillRect(sx, ly - 80 + Math.random() * 160, 20 + Math.random() * 12, 2);
        }
      }
    }

    // bordi strade (linee luminose)
    mc.strokeStyle = 'rgba(40,60,120,0.3)';
    mc.lineWidth = 2;
    mc.beginPath();
    mc.moveTo(0, D.MAP.lanes.top.y - 90); mc.lineTo(D.MAP.W, D.MAP.lanes.top.y - 90);
    mc.moveTo(0, D.MAP.lanes.top.y + 90); mc.lineTo(D.MAP.W, D.MAP.lanes.top.y + 90);
    mc.moveTo(0, D.MAP.lanes.bot.y - 90); mc.lineTo(D.MAP.W, D.MAP.lanes.bot.y - 90);
    mc.moveTo(0, D.MAP.lanes.bot.y + 90); mc.lineTo(D.MAP.W, D.MAP.lanes.bot.y + 90);
    mc.stroke();

    // strisce pedonali incroci
    for (const cx of [600, 1200, 1800, 2400, 3000, 3600, 4200]) {
      for (const ly of [D.MAP.lanes.top.y, D.MAP.lanes.bot.y]) {
        mc.fillStyle = 'rgba(40,50,80,0.15)';
        for (let s = -40; s < 40; s += 10) {
          mc.fillRect(cx + s, ly - 6, 4, 12);
        }
      }
    }

    // linee tratteggiate centrali
    mc.strokeStyle = '#1a1a30';
    mc.lineWidth = 1;
    mc.setLineDash([8, 8]);
    mc.beginPath();
    mc.moveTo(0, D.MAP.lanes.top.y); mc.lineTo(D.MAP.W, D.MAP.lanes.top.y);
    mc.moveTo(0, D.MAP.lanes.bot.y); mc.lineTo(D.MAP.W, D.MAP.lanes.bot.y);
    mc.stroke();
    mc.setLineDash([]);

    // area jungle
    mc.fillStyle = '#0d0d18';
    mc.fillRect(1050, 950, D.MAP.W - 2100, 1300);

    // bordi jungle
    mc.strokeStyle = 'rgba(30,60,40,0.3)';
    mc.lineWidth = 2;
    mc.strokeRect(1050, 950, D.MAP.W - 2100, 1300);

    // dettagli jungle (erba varia)
    for (let gx = 1060; gx < D.MAP.W - 1050; gx += 30) {
      for (let gy = 960; gy < 2250; gy += 30) {
        const r = Math.random();
        if (r < 0.25) {
          mc.fillStyle = `rgba(20,${50 + Math.random() * 30},30,${0.15 + Math.random() * 0.15})`;
          mc.fillRect(gx, gy, 3, 8);
        } else if (r < 0.3) {
          // piccole fioriture
          mc.fillStyle = `rgba(${80 + Math.random() * 60},${40 + Math.random() * 40},${100 + Math.random() * 50},0.15)`;
          mc.fillRect(gx + 2, gy + 2, 2, 2);
        }
      }
    }

    // === ELEMENTI DECORATIVI ===

    // rocce sparse nella jungle
    const rocks = [
      {x:1200,y:1100,s:12},{x:1400,y:1350,s:8},{x:1600,y:1150,s:15},
      {x:2000,y:1250,s:10},{x:2400,y:1100,s:14},{x:2800,y:1350,s:9},
      {x:1300,y:1900,s:11},{x:1700,y:2100,s:13},{x:2200,y:2000,s:10},
      {x:2600,y:1850,s:12},{x:3000,y:2050,s:8},{x:3500,y:1200,s:14},
      {x:500,y:600,s:6},{x:700,y:2600,s:7},{x:4100,y:800,s:8},{x:4300,y:2400,s:6},
    ];
    for (const rock of rocks) {
      // ombra
      mc.fillStyle = 'rgba(0,0,0,0.2)';
      mc.beginPath();
      mc.ellipse(rock.x + 3, rock.y + 3, rock.s, rock.s * 0.6, 0, 0, Math.PI * 2);
      mc.fill();
      // corpo roccia
      mc.fillStyle = '#1a1a28';
      mc.beginPath();
      mc.ellipse(rock.x, rock.y, rock.s, rock.s * 0.6, 0, 0, Math.PI * 2);
      mc.fill();
      // highlight
      mc.fillStyle = 'rgba(60,60,90,0.3)';
      mc.beginPath();
      mc.ellipse(rock.x - 2, rock.y - 2, rock.s * 0.5, rock.s * 0.3, 0, 0, Math.PI * 2);
      mc.fill();
      // bordo
      mc.strokeStyle = 'rgba(80,80,120,0.2)';
      mc.lineWidth = 1;
      mc.beginPath();
      mc.ellipse(rock.x, rock.y, rock.s, rock.s * 0.6, 0, 0, Math.PI * 2);
      mc.stroke();
    }

    // cristalli luminosi nella jungle
    const crystals = [
      {x:1500,y:1400,c:'#4060ff',s:6},{x:1900,y:1300,c:'#6040ff',s:5},
      {x:2300,y:1500,c:'#40a0ff',s:7},{x:2700,y:1400,c:'#8060ff',s:4},
      {x:2100,y:1800,c:'#5080ff',s:6},{x:1600,y:2000,c:'#6050ff',s:5},
      {x:2500,y:1900,c:'#4080ff',s:8},{x:3100,y:1600,c:'#7060ff',s:4},
    ];
    for (const cr of crystals) {
      // alone glow
      const cgrad = mc.createRadialGradient(cr.x, cr.y, 0, cr.x, cr.y, cr.s * 4);
      cgrad.addColorStop(0, cr.c + '20');
      cgrad.addColorStop(1, 'transparent');
      mc.fillStyle = cgrad;
      mc.beginPath();
      mc.arc(cr.x, cr.y, cr.s * 4, 0, Math.PI * 2);
      mc.fill();
      // cristallo (triangolo)
      mc.fillStyle = cr.c + '60';
      mc.beginPath();
      mc.moveTo(cr.x, cr.y - cr.s * 1.5);
      mc.lineTo(cr.x + cr.s * 0.7, cr.y + cr.s * 0.5);
      mc.lineTo(cr.x - cr.s * 0.7, cr.y + cr.s * 0.5);
      mc.closePath();
      mc.fill();
      // highlight
      mc.fillStyle = '#ffffff30';
      mc.beginPath();
      mc.moveTo(cr.x - 1, cr.y - cr.s);
      mc.lineTo(cr.x + cr.s * 0.3, cr.y);
      mc.lineTo(cr.x - cr.s * 0.3, cr.y);
      mc.closePath();
      mc.fill();
    }

    // rovine/strutture antiche
    const ruins = [
      {x:1200,y:1600,w:40,h:8},{x:2800,y:1600,w:40,h:8},
      {x:1800,y:1100,w:6,h:35},{x:2200,y:2100,w:6,h:35},
      {x:2000,y:1500,w:30,h:30},{x:2400,y:1700,w:30,h:30},
    ];
    for (const ru of ruins) {
      mc.fillStyle = 'rgba(40,35,55,0.4)';
      mc.fillRect(ru.x, ru.y, ru.w, ru.h);
      mc.strokeStyle = 'rgba(80,70,110,0.25)';
      mc.lineWidth = 1;
      mc.strokeRect(ru.x, ru.y, ru.w, ru.h);
      // crepe
      if (ru.w > 20) {
        mc.strokeStyle = 'rgba(30,25,45,0.3)';
        mc.beginPath();
        mc.moveTo(ru.x + ru.w * 0.3, ru.y);
        mc.lineTo(ru.x + ru.w * 0.4, ru.y + ru.h);
        mc.moveTo(ru.x + ru.w * 0.7, ru.y);
        mc.lineTo(ru.x + ru.w * 0.6, ru.y + ru.h);
        mc.stroke();
      }
    }

    // pozzi/oscurità ambientali
    const pits = [
      {x:1400,y:1700,r:20},{x:2600,y:1500,r:18},
      {x:2000,y:1900,r:15},{x:3200,y:1700,r:12},
    ];
    for (const pit of pits) {
      const pgrad = mc.createRadialGradient(pit.x, pit.y, 0, pit.x, pit.y, pit.r);
      pgrad.addColorStop(0, 'rgba(5,5,10,0.6)');
      pgrad.addColorStop(0.7, 'rgba(10,10,20,0.3)');
      pgrad.addColorStop(1, 'transparent');
      mc.fillStyle = pgrad;
      mc.beginPath();
      mc.arc(pit.x, pit.y, pit.r, 0, Math.PI * 2);
      mc.fill();
      mc.strokeStyle = 'rgba(40,30,60,0.2)';
      mc.lineWidth = 1;
      mc.stroke();
    }

    // === DETTAGLI AGGIUNTIVI ===

    // pozze d'acqua luminosa
    const puddles = [
      {x:1350,y:1450,r:18},{x:2650,y:1550,r:14},{x:1900,y:1750,r:12},
      {x:2200,y:1350,r:16},{x:3100,y:1900,r:10},{x:1600,y:2100,r:13},
      {x:2800,y:1200,r:11},{x:2400,y:2050,r:15},
    ];
    for (const p of puddles) {
      const pgrad = mc.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      pgrad.addColorStop(0, 'rgba(30,60,120,0.15)');
      pgrad.addColorStop(0.6, 'rgba(40,80,160,0.08)');
      pgrad.addColorStop(1, 'transparent');
      mc.fillStyle = pgrad;
      mc.beginPath();
      mc.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      mc.fill();
      // riflesso
      mc.fillStyle = 'rgba(100,160,255,0.06)';
      mc.beginPath();
      mc.ellipse(p.x - p.r * 0.2, p.y - p.r * 0.2, p.r * 0.4, p.r * 0.2, 0.3, 0, Math.PI * 2);
      mc.fill();
    }

    // sentieri di terra nella jungle
    const paths = [
      [{x:1200,y:1200},{x:1800,y:1400},{x:2400,y:1600}],
      [{x:1600,y:1000},{x:2000,y:1600},{x:2400,y:2200}],
      [{x:2800,y:1200},{x:2400,y:1600},{x:2000,y:2000}],
      [{x:1400,y:1800},{x:2000,y:1600},{x:2600,y:1400}],
    ];
    for (const path of paths) {
      mc.strokeStyle = 'rgba(50,40,35,0.12)';
      mc.lineWidth = 6;
      mc.lineCap = 'round';
      mc.lineJoin = 'round';
      mc.beginPath();
      mc.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        mc.lineTo(path[i].x, path[i].y);
      }
      mc.stroke();
      // bordi sentiero
      mc.strokeStyle = 'rgba(40,35,30,0.06)';
      mc.lineWidth = 10;
      mc.beginPath();
      mc.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        mc.lineTo(path[i].x, path[i].y);
      }
      mc.stroke();
    }

    // totem/colonne spezzate
    const totems = [
      {x:1500,y:1300,h:25},{x:2500,y:1700,h:30},
      {x:1800,y:2000,h:20},{x:3000,y:1400,h:22},
      {x:2200,y:1200,h:28},{x:1300,y:1900,h:18},
    ];
    for (const t of totems) {
      // ombra
      mc.fillStyle = 'rgba(0,0,0,0.15)';
      mc.fillRect(t.x + 3, t.y + 3, 8, t.h);
      // colonna
      mc.fillStyle = 'rgba(50,45,65,0.5)';
      mc.fillRect(t.x, t.y, 8, t.h);
      // testa totem
      mc.fillStyle = 'rgba(70,60,90,0.4)';
      mc.fillRect(t.x - 2, t.y - 4, 12, 6);
      // rune luminose
      mc.fillStyle = 'rgba(100,80,160,0.3)';
      mc.fillRect(t.x + 2, t.y + 5, 4, 2);
      mc.fillRect(t.x + 2, t.y + 12, 4, 2);
      if (t.h > 22) mc.fillRect(t.x + 2, t.y + 19, 4, 2);
    }

    // erba alta ondeggiante (linee)
    for (let i = 0; i < 60; i++) {
      const bx = 1100 + Math.random() * (D.MAP.W - 2200);
      const by = 980 + Math.random() * 1240;
      const gh = 6 + Math.random() * 10;
      const shade = 40 + Math.random() * 40;
      mc.strokeStyle = `rgba(20,${shade},30,${0.08 + Math.random() * 0.1})`;
      mc.lineWidth = 1;
      mc.beginPath();
      mc.moveTo(bx, by);
      mc.quadraticCurveTo(bx + 3, by - gh * 0.6, bx + 1 + Math.random() * 3, by - gh);
      mc.stroke();
    }

    // piccoli teschi/spoglie
    const skulls = [
      {x:1700,y:1500},{x:2300,y:1800},{x:1900,y:1200},{x:2700,y:1350},
      {x:1400,y:2050},{x:2900,y:1950},
    ];
    for (const sk of skulls) {
      mc.fillStyle = 'rgba(180,170,150,0.15)';
      // cranio
      mc.beginPath();
      mc.arc(sk.x, sk.y, 4, 0, Math.PI * 2);
      mc.fill();
      // orbite
      mc.fillStyle = 'rgba(30,20,40,0.2)';
      mc.fillRect(sk.x - 2, sk.y - 1, 2, 2);
      mc.fillRect(sk.x + 1, sk.y - 1, 2, 2);
    }

    // catene/rami caduti
    const chains = [
      {x1:1250,y1:1150,x2:1280,y2:1180},{x1:2700,y1:1650,x2:2730,y2:1620},
      {x1:1850,y1:1950,x2:1880,y2:1980},{x1:2150,y1:1250,x2:2120,y2:1280},
    ];
    for (const ch of chains) {
      mc.strokeStyle = 'rgba(80,70,60,0.15)';
      mc.lineWidth = 2;
      mc.beginPath();
      mc.moveTo(ch.x1, ch.y1);
      mc.lineTo(ch.x2, ch.y2);
      mc.stroke();
      // maglie
      const mx = (ch.x1 + ch.x2) / 2, my = (ch.y1 + ch.y2) / 2;
      mc.strokeStyle = 'rgba(100,90,80,0.12)';
      mc.beginPath();
      mc.arc(mx, my, 3, 0, Math.PI * 2);
      mc.stroke();
    }

    // simboli runici sul terreno
    const runes = [
      {x:2000,y:1600,r:15,c:'100,60,160'},{x:1500,y:1400,r:10,c:'60,120,100'},
      {x:2500,y:1800,r:12,c:'120,60,80'},{x:1800,y:1200,r:8,c:'60,80,140'},
    ];
    for (const ru of runes) {
      mc.strokeStyle = `rgba(${ru.c},0.12)`;
      mc.lineWidth = 1;
      // cerchio esterno
      mc.beginPath();
      mc.arc(ru.x, ru.y, ru.r, 0, Math.PI * 2);
      mc.stroke();
      // croce interna
      mc.beginPath();
      mc.moveTo(ru.x, ru.y - ru.r * 0.6);
      mc.lineTo(ru.x, ru.y + ru.r * 0.6);
      mc.moveTo(ru.x - ru.r * 0.6, ru.y);
      mc.lineTo(ru.x + ru.r * 0.6, ru.y);
      mc.stroke();
      // punti cardinali
      for (let a = 0; a < 4; a++) {
        const ang = a * Math.PI / 2;
        mc.fillStyle = `rgba(${ru.c},0.15)`;
        mc.beginPath();
        mc.arc(ru.x + Math.cos(ang) * ru.r, ru.y + Math.sin(ang) * ru.r, 2, 0, Math.PI * 2);
        mc.fill();
      }
    }

    // dettagli sulle strade (ombra auto, segni)
    for (let sx = 200; sx < D.MAP.W; sx += 500) {
      for (const ly of [D.MAP.lanes.top.y, D.MAP.lanes.bot.y]) {
        // ombre di veicoli fantasma
        if (Math.random() < 0.3) {
          mc.fillStyle = 'rgba(20,20,35,0.08)';
          mc.fillRect(sx, ly - 15, 30 + Math.random() * 20, 10);
        }
        // segni di frenata
        if (Math.random() < 0.15) {
          mc.strokeStyle = 'rgba(30,30,45,0.08)';
          mc.lineWidth = 2;
          mc.beginPath();
          mc.moveTo(sx, ly + 20);
          mc.lineTo(sx + 15, ly + 25);
          mc.stroke();
        }
      }
    }

    // zone di spawn indicatori (cerchi deboli)
    for (const spot of D.MAP.jungle_spots) {
      mc.strokeStyle = 'rgba(100,60,160,0.04)';
      mc.lineWidth = 1;
      mc.setLineDash([3, 3]);
      mc.beginPath();
      mc.arc(spot.x, spot.y, 30, 0, Math.PI * 2);
      mc.stroke();
      mc.setLineDash([]);
    }

    // checkpoints visivi lungo le lane
    for (const ck of D.MAP.lanes.top.waypoints) {
      mc.fillStyle = 'rgba(40,80,160,0.06)';
      mc.beginPath();
      mc.arc(ck.x, ck.y, 25, 0, Math.PI * 2);
      mc.fill();
    }
    for (const ck of D.MAP.lanes.bot.waypoints) {
      mc.fillStyle = 'rgba(160,40,40,0.06)';
      mc.beginPath();
      mc.arc(ck.x, ck.y, 25, 0, Math.PI * 2);
      mc.fill();
    }

    // luci ambientali (punti luminosi sparsi)
    const lights = [
      {x:600,y:400,c:'60,100,200'},{x:1200,y:400,c:'60,100,200'},
      {x:3600,y:400,c:'60,100,200'},{x:4200,y:400,c:'60,100,200'},
      {x:600,y:2800,c:'200,60,60'},{x:1200,y:2800,c:'200,60,60'},
      {x:3600,y:2800,c:'200,60,60'},{x:4200,y:2800,c:'200,60,60'},
      {x:2400,y:1600,c:'100,60,160'},{x:2000,y:1200,c:'60,120,100'},
      {x:2800,y:2000,c:'60,120,100'},
    ];
    for (const lt of lights) {
      const ltgrad = mc.createRadialGradient(lt.x, lt.y, 0, lt.x, lt.y, 40);
      ltgrad.addColorStop(0, `rgba(${lt.c},0.08)`);
      ltgrad.addColorStop(1, 'transparent');
      mc.fillStyle = ltgrad;
      mc.beginPath();
      mc.arc(lt.x, lt.y, 40, 0, Math.PI * 2);
      mc.fill();
    }

    // bushes
    for (const b of D.MAP.bushes) {
      mc.fillStyle = 'rgba(15,50,25,0.6)';
      mc.fillRect(b.x, b.y, b.w, b.h);
      // ombra bushes
      mc.fillStyle = 'rgba(0,0,0,0.15)';
      mc.fillRect(b.x + 3, b.y + 3, b.w, b.h);
      // foglie
      for (let px = b.x + 6; px < b.x + b.w - 6; px += 10) {
        for (let py = b.y + 6; py < b.y + b.h - 6; py += 10) {
          if (Math.random() < 0.35) {
            const shade = 70 + Math.random() * 50;
            mc.fillStyle = `rgba(25,${shade},35,${0.25 + Math.random() * 0.3})`;
            mc.fillRect(px, py, 4, 4);
          }
        }
      }
      // bordo luminoso
      mc.strokeStyle = 'rgba(40,120,50,0.2)';
      mc.lineWidth = 1;
      mc.strokeRect(b.x, b.y, b.w, b.h);
    }

    // speed zones
    for (const sz of D.MAP.speed_zones) {
      const grad = mc.createRadialGradient(sz.x, sz.y, 0, sz.x, sz.y, sz.r);
      grad.addColorStop(0, 'rgba(40,100,200,0.15)');
      grad.addColorStop(1, 'rgba(40,100,200,0.02)');
      mc.fillStyle = grad;
      mc.beginPath();
      mc.arc(sz.x, sz.y, sz.r, 0, Math.PI * 2);
      mc.fill();
      mc.strokeStyle = 'rgba(40,100,200,0.3)';
      mc.lineWidth = 2;
      mc.stroke();
      // frecce direzionali
      mc.strokeStyle = 'rgba(40,100,200,0.2)';
      mc.lineWidth = 1;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        const ax = sz.x + Math.cos(a) * sz.r * 0.6;
        const ay = sz.y + Math.sin(a) * sz.r * 0.6;
        mc.beginPath();
        mc.moveTo(ax, ay);
        mc.lineTo(ax + Math.cos(a) * 8, ay + Math.sin(a) * 8);
        mc.stroke();
      }
    }

    // jump pads
    for (const jp of D.MAP.jump_pads) {
      const grad = mc.createRadialGradient(jp.x, jp.y, 0, jp.x, jp.y, 30);
      grad.addColorStop(0, 'rgba(80,160,255,0.25)');
      grad.addColorStop(1, 'rgba(80,160,255,0.02)');
      mc.fillStyle = grad;
      mc.beginPath();
      mc.arc(jp.x, jp.y, 30, 0, Math.PI * 2);
      mc.fill();
      const a = Math.atan2(jp.ty - jp.y, jp.tx - jp.x);
      mc.strokeStyle = 'rgba(80,160,255,0.5)';
      mc.lineWidth = 2;
      mc.setLineDash([6, 6]);
      mc.beginPath();
      mc.moveTo(jp.x, jp.y);
      mc.lineTo(jp.x + Math.cos(a) * 60, jp.y + Math.sin(a) * 60);
      mc.stroke();
      mc.setLineDash([]);
      // freccia
      mc.fillStyle = 'rgba(80,160,255,0.6)';
      mc.beginPath();
      mc.moveTo(jp.x + Math.cos(a) * 22, jp.y + Math.sin(a) * 22);
      mc.lineTo(jp.x + Math.cos(a + 0.5) * 14, jp.y + Math.sin(a + 0.5) * 14);
      mc.lineTo(jp.x + Math.cos(a - 0.5) * 14, jp.y + Math.sin(a - 0.5) * 14);
      mc.fill();
    }

    // basi
    for (const base of [D.BASES.blue, D.BASES.red]) {
      const col = base.team === 0 ? [20, 60, 160] : [160, 20, 20];
      // aura esterna
      const grad = mc.createRadialGradient(base.x, base.y, 40, base.x, base.y, 100);
      grad.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0.15)`);
      grad.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0.01)`);
      mc.fillStyle = grad;
      mc.beginPath();
      mc.arc(base.x, base.y, 100, 0, Math.PI * 2);
      mc.fill();
      // cerchio interno
      mc.beginPath();
      mc.arc(base.x, base.y, 40, 0, Math.PI * 2);
      mc.fillStyle = `rgba(${col[0] + 20},${col[1] + 40},${col[2] + 40},0.2)`;
      mc.fill();
      mc.strokeStyle = `rgba(${col[0] + 20},${col[1] + 60},${col[2] + 80},0.5)`;
      mc.lineWidth = 3;
      mc.stroke();
      // nucleo
      mc.beginPath();
      mc.arc(base.x, base.y, 12, 0, Math.PI * 2);
      mc.fillStyle = `rgba(${col[0] + 40},${col[1] + 80},${col[2] + 120},0.4)`;
      mc.fill();
      // anelli decorativi
      mc.strokeStyle = `rgba(${col[0] + 20},${col[1] + 40},${col[2] + 60},0.15)`;
      mc.lineWidth = 1;
      mc.beginPath();
      mc.arc(base.x, base.y, 60, 0, Math.PI * 2);
      mc.stroke();
      mc.beginPath();
      mc.arc(base.x, base.y, 80, 0, Math.PI * 2);
      mc.stroke();
    }
  }

  function update_camera(player) {
    if (!player) return;
    camera.x += (player.x - W / 2 - camera.x) * 0.1;
    camera.y += (player.y - H / 2 - camera.y) * 0.1;
    camera.x = Math.max(0, Math.min(D.MAP.W - W, camera.x));
    camera.y = Math.max(0, Math.min(D.MAP.H - H, camera.y));
  }

  function add_shake(intensity) {
    shake.intensity = Math.min(shake.intensity + intensity, 12);
  }

  function add_damage_flash() {
    damage_flash = 0.4;
  }

  function add_level_up_banner(x, y, level) {
    level_up_banners.push({ x, y, level, timer: 90, vy: -1.5 });
  }

  function add_death_effect(x, y, color) {
    death_effects.push({ x, y, color, timer: 30, r: 0 });
  }

  function update_effects() {
    // shake
    if (shake.intensity > 0.1) {
      shake.x = (Math.random() - 0.5) * shake.intensity;
      shake.y = (Math.random() - 0.5) * shake.intensity;
      shake.intensity *= 0.88;
    } else {
      shake.x = 0; shake.y = 0; shake.intensity = 0;
    }
    // damage flash
    if (damage_flash > 0) damage_flash -= 0.02;
    // level up banners
    for (let i = level_up_banners.length - 1; i >= 0; i--) {
      const b = level_up_banners[i];
      b.timer--;
      b.y += b.vy;
      if (b.timer <= 0) level_up_banners.splice(i, 1);
    }
    // death effects
    for (let i = death_effects.length - 1; i >= 0; i--) {
      const d = death_effects[i];
      d.timer--;
      d.r += 2;
      if (d.timer <= 0) death_effects.splice(i, 1);
    }
  }

  function render_frame(state, entities, particles, projectiles, shards_dropped, player) {
    frame_count++;
    update_effects();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#080810';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    // screen shake
    ctx.translate(-camera.x + shake.x, -camera.y + shake.y);
    ctx.drawImage(map_buffer, 0, 0);

    // death effects (expanding rings)
    for (const d of death_effects) {
      ctx.globalAlpha = d.timer / 30;
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (const g of state.goals) {
      if (!g.alive) continue;
      render_goal(g);
    }

    for (const sd of shards_dropped) {
      render_shard(sd);
    }

    const sorted = entities.filter(e => !e.dead).sort((a, b) => a.y - b.y);
    for (const e of sorted) {
      if (e.type === 'champion' && e.invisible && e.team !== player.team) continue;
      render_entity(e, player);
    }

    for (const p of projectiles) {
      render_projectile(p);
    }

    for (const p of particles) {
      render_particle(p);
    }

    for (const ef of Game.attack_effects) {
      render_attack_effect(ef);
    }

    // level up banners
    for (const b of level_up_banners) {
      ctx.globalAlpha = Math.min(1, b.timer / 20);
      ctx.fillStyle = '#ffdd00';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`✦ LIVELLO ${b.level} ✦`, b.x, b.y);
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // damage flash overlay
    if (damage_flash > 0) {
      ctx.fillStyle = `rgba(255,30,30,${damage_flash * 0.25})`;
      ctx.fillRect(0, 0, W, H);
    }

    render_hud(state, entities, player);
    render_minimap(state, entities, player);
    render_channel_bar(player);
    render_attack_range(player);
    update_cooldown_rings(player);
  }

  function render_goal(g) {
    const team_color = g.team === 0 ? '#3080d0' : '#d03030';
    const team_color2 = g.team === 0 ? '#60b0ff' : '#ff6060';
    const hp_pct = g.current_hp / g.hp;
    const r = g.tier === 3 ? 55 : 40;
    const pulse = Math.sin(frame_count * 0.05) * 3;

    // aura esterna
    const grad = ctx.createRadialGradient(g.x, g.y, r * 0.5, g.x, g.y, r + pulse + 15);
    grad.addColorStop(0, team_color + '15');
    grad.addColorStop(1, team_color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(g.x, g.y, r + pulse + 15, 0, Math.PI * 2);
    ctx.fill();

    // cerchio principale
    ctx.beginPath();
    ctx.arc(g.x, g.y, r + pulse, 0, Math.PI * 2);
    ctx.fillStyle = team_color + '20';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
    ctx.fillStyle = team_color + '35';
    ctx.fill();
    ctx.strokeStyle = team_color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // anello interno
    ctx.beginPath();
    ctx.arc(g.x, g.y, r - 4, 0, Math.PI * 2);
    ctx.strokeStyle = team_color2 + '40';
    ctx.lineWidth = 1;
    ctx.stroke();

    // nucleo
    ctx.beginPath();
    ctx.arc(g.x, g.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = team_color2 + '60';
    ctx.fill();

    // HP testo
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.ceil(g.current_hp), g.x, g.y + 4);

    // barra HP esterna
    if (hp_pct < 1) {
      ctx.beginPath();
      ctx.arc(g.x, g.y, r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hp_pct);
      ctx.strokeStyle = '#ffdd00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // label tier
    if (g.tier === 3) {
      ctx.fillStyle = team_color2;
      ctx.font = 'bold 9px monospace';
      ctx.fillText('SANCTUM', g.x, g.y - r - 8);
    }
  }

  function render_shard(sd) {
    const alpha = Math.min(1, sd.timer / 15);
    const bob = Math.sin(frame_count * 0.08) * 3;
    ctx.globalAlpha = alpha;
    const color = sd.team === 0 ? '#60a0ff' : '#ff6060';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sd.x, sd.y + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.arc(sd.x, sd.y + bob, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function render_entity(e, player) {
    if (e.type === 'champion') {
      render_champion(e, player);
    } else if (e.type === 'creep') {
      render_creep(e);
    } else if (e.type === 'boss') {
      render_boss(e);
    } else if (e.type === 'turret') {
      render_turret(e);
    }
  }

  function render_champion(e, player) {
    const r = D.ROSTER[e.roster_idx];
    const sprites = Sprites.get_champion_sprites(e.roster_idx);
    const moving = e.vx !== 0 || e.vy !== 0;
    const anim_frame = moving
      ? (Math.floor(frame_count / 8) % 2 === 0 ? 'walk1' : 'walk2')
      : 'idle';
    const sprite = sprites ? sprites[anim_frame] : null;

    if (e.team !== player.team) ctx.globalAlpha = 0.5;

    const sz = 40;

    // ombra a terra
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + sz / 2 - 2, sz / 3, sz / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // cerchio a terra (colore team)
    ctx.fillStyle = e.team === 0 ? 'rgba(60,140,255,0.08)' : 'rgba(255,80,80,0.08)';
    ctx.beginPath();
    ctx.arc(e.x, e.y, sz / 2 + 4, 0, Math.PI * 2);
    ctx.fill();

    // status effects visivi
    if (e.slow_timer > 0) {
      ctx.strokeStyle = 'rgba(100,160,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2 + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (e.stun_timer > 0) {
      const stun_angle = frame_count * 0.15;
      for (let i = 0; i < 3; i++) {
        const a = stun_angle + (i * Math.PI * 2 / 3);
        const sx = e.x + Math.cos(a) * (sz / 2 + 10);
        const sy = e.y + Math.sin(a) * (sz / 2 + 10);
        ctx.fillStyle = '#ffdd00';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('★', sx, sy);
      }
    }
    if (e.buff_atk_timer > 0) {
      ctx.strokeStyle = 'rgba(255,180,0,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // scudo
    if (e.shield > 0) {
      const shield_pulse = 0.4 + Math.sin(frame_count * 0.1) * 0.2;
      ctx.strokeStyle = '#60c0ff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = shield_pulse;
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
      // scintille scudo
      const spark_angle = frame_count * 0.08;
      for (let i = 0; i < 4; i++) {
        const a = spark_angle + i * Math.PI / 2;
        ctx.fillStyle = '#a0e0ff';
        ctx.beginPath();
        ctx.arc(e.x + Math.cos(a) * (sz / 2 + 8), e.y + Math.sin(a) * (sz / 2 + 8), 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = e.team !== player.team ? 0.5 : 1;
    }

    // canale
    if (e.channeling) {
      ctx.strokeStyle = '#ffdd00';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2 + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // sprite con flip
    if (sprite) {
      const flip = e.vx < 0;
      if (flip) {
        ctx.save();
        ctx.translate(e.x + sprite.width / 2, e.y - sprite.height / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(sprite, 0, 0);
        ctx.restore();
      } else {
        ctx.drawImage(sprite, e.x - sprite.width / 2, e.y - sprite.height / 2);
      }
    } else {
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2, 0, Math.PI * 2);
      ctx.fillStyle = r.color + '40';
      ctx.fill();
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(r.icon, e.x, e.y + 5);
    }

    // indicatore invisibilità
    if (e.invisible && e.team === player.team) {
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2 + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#8080ff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // health bar migliorata
    const bar_w = sz * 1.8;
    const bar_h = 5;
    const bar_y = e.y - sz / 2 - 16;
    // sfondo
    ctx.fillStyle = 'rgba(10,10,20,0.8)';
    roundRect(ctx, e.x - bar_w / 2 - 1, bar_y - 1, bar_w + 2, bar_h + 2, 3);
    ctx.fill();
    // HP
    const hp_pct = e.hp / e.max_hp;
    const hp_color = hp_pct > 0.5 ? '#40c060' : hp_pct > 0.25 ? '#ddaa00' : '#dd3030';
    if (hp_pct > 0) {
      ctx.fillStyle = hp_color;
      roundRect(ctx, e.x - bar_w / 2, bar_y, bar_w * hp_pct, bar_h, 2);
      ctx.fill();
    }
    // bordo
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    roundRect(ctx, e.x - bar_w / 2, bar_y, bar_w, bar_h, 2);
    ctx.stroke();

    // livello
    ctx.fillStyle = '#ffdd40';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv${e.level}`, e.x, bar_y - 4);

    // shard
    if (e.shards > 0) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = '8px monospace';
      ctx.fillText(`${e.shards}`, e.x, e.y + sz / 2 + 12);
    }

    ctx.globalAlpha = 1;
  }

  function render_creep(e) {
    const c_type = e.creep_type || D.CREEPS[Math.min(e.creep_tier, 2)].type;
    const sprites = Sprites.get_creep_sprites(c_type);
    const moving = e.target && dist(e, e.target) > (e.r + 30);
    const anim_frame = moving
      ? (Math.floor(frame_count / 10) % 2 === 0 ? 'walk1' : 'idle')
      : 'idle';
    const sprite = sprites ? sprites[anim_frame] : null;
    const sz = e.r * 2;

    // stealth visual (lurker type)
    if (e.stealth && (!e.target || dist(e, e.target) > 80)) {
      ctx.globalAlpha = 0.25;
    }

    // ombra
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + sz / 2, sz / 3, sz / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (sprite) {
      ctx.drawImage(sprite, e.x - sprite.width / 2, e.y - sprite.height / 2);
    } else {
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2, 0, Math.PI * 2);
      ctx.fillStyle = (e.color || '#7a4f8a') + '40';
      ctx.fill();
      ctx.strokeStyle = e.color || '#7a4f8a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // shield visual (warden type)
    if (e.shield > 0) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#60c0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // health bar
    const hp_pct = e.hp / e.max_hp;
    const bar_w = sz * 1.5;
    const bar_h = 3;
    const bar_y = e.y - sz / 2 - 6;
    ctx.fillStyle = 'rgba(10,10,20,0.7)';
    ctx.fillRect(e.x - bar_w / 2 - 1, bar_y - 1, bar_w + 2, bar_h + 2);
    const hp_color = hp_pct > 0.5 ? '#a060c0' : hp_pct > 0.25 ? '#c0a060' : '#c06060';
    ctx.fillStyle = hp_color;
    if (hp_pct > 0) {
      roundRect(ctx, e.x - bar_w / 2, bar_y, bar_w * hp_pct, bar_h, 1);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function render_boss(e) {
    const sprites = Sprites.get_boss_sprites();
    const sprite = sprites ? sprites.idle : null;
    const sz = 100;

    // tentacoli aura
    const tentacles = 8;
    for (let i = 0; i < tentacles; i++) {
      const a = (i / tentacles) * Math.PI * 2 + frame_count * 0.01;
      const len = sz / 2 + 15 + Math.sin(frame_count * 0.04 + i) * 8;
      const tx = e.x + Math.cos(a) * len;
      const ty = e.y + Math.sin(a) * len;
      ctx.strokeStyle = `rgba(255,30,60,${0.15 + Math.sin(frame_count * 0.05 + i) * 0.1})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(a) * (sz / 2 - 5), e.y + Math.sin(a) * (sz / 2 - 5));
      ctx.quadraticCurveTo(
        e.x + Math.cos(a + 0.3) * (sz / 2 + 5),
        e.y + Math.sin(a + 0.3) * (sz / 2 + 5),
        tx, ty
      );
      ctx.stroke();
    }

    // aura pulsante
    const aura_r = sz / 2 + 10 + Math.sin(frame_count * 0.03) * 5;
    const grad = ctx.createRadialGradient(e.x, e.y, sz / 3, e.x, e.y, aura_r);
    grad.addColorStop(0, 'rgba(255,30,60,0.15)');
    grad.addColorStop(0.5, 'rgba(255,30,60,0.08)');
    grad.addColorStop(1, 'rgba(255,30,60,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(e.x, e.y, aura_r, 0, Math.PI * 2);
    ctx.fill();

    // ombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + sz / 3, sz / 2.5, sz / 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (sprite) {
      ctx.drawImage(sprite, e.x - sprite.width / 2, e.y - sprite.height / 2);
    } else {
      ctx.beginPath();
      ctx.arc(e.x, e.y, sz / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ff204030';
      ctx.fill();
      ctx.strokeStyle = '#ff3060';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ff2040';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('‡', e.x, e.y + 8);
    }

    // health bar
    const hp_pct = e.hp / e.max_hp;
    const bar_w = sz * 1.5;
    const bar_h = 6;
    const bar_y = e.y - sz / 2 - 18;
    ctx.fillStyle = 'rgba(10,10,20,0.8)';
    roundRect(ctx, e.x - bar_w / 2 - 1, bar_y - 1, bar_w + 2, bar_h + 2, 3);
    ctx.fill();
    ctx.fillStyle = '#ff3060';
    if (hp_pct > 0) {
      roundRect(ctx, e.x - bar_w / 2, bar_y, bar_w * hp_pct, bar_h, 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    roundRect(ctx, e.x - bar_w / 2, bar_y, bar_w, bar_h, 2);
    ctx.stroke();

    // nome boss
    ctx.fillStyle = '#ff3060';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ÆTHERMAW', e.x, bar_y - 5);
  }

  function render_turret(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);

    ctx.fillStyle = e.color + '60';
    ctx.fillRect(-8, -6, 16, 12);
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -6, 16, 12);

    ctx.fillStyle = '#ff4040';
    ctx.fillRect(6, -2, 6, 4);

    ctx.restore();

    const hp_pct = e.hp / e.max_hp;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(e.x - 10, e.y - 12, 20, 3);
    ctx.fillStyle = '#a0a040';
    ctx.fillRect(e.x - 10, e.y - 12, 20 * hp_pct, 3);
  }

  function render_projectile(p) {
    const trail_len = 4;
    for (let i = trail_len; i > 0; i--) {
      const alpha = (1 - i / trail_len) * 0.35;
      const sz = p.r * (1 - i / trail_len * 0.6);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - p.dx * i * 0.5, p.y - p.dy * i * 0.5, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // corpo principale
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    // nucleo luminoso
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // alone
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function render_particle(p) {
    const alpha = p.life / p.max_life;
    const sz = p.size * (0.3 + alpha * 0.7);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
    ctx.fill();
    // alone leggero
    if (sz > 2) {
      ctx.globalAlpha = alpha * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function render_attack_effect(ef) {
    const progress = 1 - ef.timer / (ef.type === 'slash' ? 10 : 6);
    if (ef.type === 'slash') {
      // melee slash arc - larger and more dramatic
      const arc_len = Math.PI * 0.8;
      const radius = (ef.range || 35) * (0.4 + progress * 0.8);
      ctx.save();
      ctx.translate(ef.x, ef.y);
      ctx.rotate(ef.angle);
      // outer glow ring
      ctx.globalAlpha = (1 - progress) * 0.15;
      ctx.fillStyle = ef.color;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 8, -arc_len / 2, arc_len / 2);
      ctx.lineTo(0, 0);
      ctx.fill();
      // main arc stroke
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = ef.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius, -arc_len / 2, arc_len / 2);
      ctx.stroke();
      // inner filled triangle
      ctx.globalAlpha = (1 - progress) * 0.25;
      ctx.fillStyle = ef.color;
      ctx.beginPath();
      ctx.arc(0, 0, radius, -arc_len / 2, arc_len / 2);
      ctx.lineTo(0, 0);
      ctx.fill();
      // speed lines
      ctx.globalAlpha = (1 - progress) * 0.5;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const a = -arc_len / 2 + (arc_len / 5) * (i + 1);
        const len = radius * 0.3 + progress * 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (radius - len), Math.sin(a) * (radius - len));
        ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    } else if (ef.type === 'muzzle') {
      // ranged muzzle flash
      ctx.save();
      ctx.translate(ef.x, ef.y);
      ctx.rotate(ef.angle);
      ctx.globalAlpha = 1 - progress;
      // flash core
      const flash_r = 6 + progress * 4;
      const grad = ctx.createRadialGradient(flash_r, 0, 0, flash_r, 0, flash_r + 8);
      grad.addColorStop(0, ef.color);
      grad.addColorStop(0.5, ef.color + '80');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(flash_r, 0, flash_r + 8, 0, Math.PI * 2);
      ctx.fill();
      // flash rays
      ctx.strokeStyle = ef.color;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5 - 0.5) * Math.PI * 0.4;
        const len = 8 + progress * 12;
        ctx.beginPath();
        ctx.moveTo(flash_r, 0);
        ctx.lineTo(flash_r + Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // attack range indicator for the player
  function render_attack_range(player) {
    if (!player || player.dead) return;
    const r = D.ROSTER[player.roster_idx];
    const range = player.range;
    const pulse = Math.sin(frame_count * 0.06) * 0.08;
    ctx.save();
    ctx.strokeStyle = `rgba(255,100,80,${0.12 + pulse})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, range + 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // update cooldown rings on DOM buttons
  function update_cooldown_rings(player) {
    if (!player) return;
    const atk_cd = player.atk_timer / (1 / player.atk_speed);
    const atk_ring = document.getElementById('cd-atk');
    if (atk_ring) {
      const pct = Math.max(0, Math.min(1, atk_cd));
      const deg = pct * 360;
      if (pct > 0.01) {
        atk_ring.style.background = `conic-gradient(rgba(255,80,80,0.5) ${deg}deg, transparent ${deg}deg)`;
        atk_ring.style.display = 'block';
      } else {
        atk_ring.style.display = 'none';
      }
    }
    // ability cooldowns
    for (let i = 0; i < 3; i++) {
      const ids = ['cd-ab1', 'cd-ab2', 'cd-ult'];
      const cds = player.ability_cds[i];
      const max_cd = 8; // approx max cd for display
      const ring = document.getElementById(ids[i]);
      if (ring) {
        const pct = Math.max(0, Math.min(1, cds / max_cd));
        const deg = pct * 360;
        if (pct > 0.01) {
          const col = i === 0 ? '80,150,255' : i === 1 ? '80,220,120' : '255,200,50';
          ring.style.background = `conic-gradient(rgba(${col},0.5) ${deg}deg, transparent ${deg}deg)`;
          ring.style.display = 'block';
        } else {
          ring.style.display = 'none';
        }
      }
    }
    // channel button
    const chan_ring = document.getElementById('cd-chan');
    if (chan_ring) {
      const chan_pct = player.channeling ? (1 - player.channel_timer / 8) : 0;
      const deg = Math.max(0, Math.min(1, chan_pct)) * 360;
      if (chan_pct > 0.01 && player.channeling) {
        chan_ring.style.background = `conic-gradient(rgba(200,80,255,0.5) ${deg}deg, transparent ${deg}deg)`;
        chan_ring.style.display = 'block';
      } else {
        chan_ring.style.display = 'none';
      }
    }
  }

  function render_hud(state, entities, player) {
    const pad = 12;

    // pannello punteggio
    ctx.fillStyle = 'rgba(8,8,16,0.9)';
    roundRect(ctx, pad, pad, 220, 50, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,80,140,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, pad, pad, 220, 50, 10);
    ctx.stroke();

    // punteggio
    ctx.fillStyle = '#40a0ff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(state.scores[0], pad + 12, pad + 32);
    ctx.fillStyle = '#555';
    ctx.fillText(':', pad + 55, pad + 32);
    ctx.fillStyle = '#ff4040';
    ctx.fillText(state.scores[1], pad + 68, pad + 32);

    // timer
    const mins = Math.floor(state.time / 60);
    const secs = Math.floor(state.time % 60);
    ctx.fillStyle = state.double_points ? '#ffdd00' : '#aaa';
    ctx.font = `${state.double_points ? 'bold ' : ''}18px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, pad + 130, pad + 28);

    if (state.double_points) {
      ctx.fillStyle = '#ffdd00';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('PUNTI x2', pad + 130, pad + 42);
    }

    // boss info
    if (state.boss_alive) {
      ctx.fillStyle = '#ff3060';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('‡ FAUCI DELL\'ÆTERE', pad + 215, pad + 20);
    } else if (state.boss_exposed) {
      ctx.fillStyle = '#ffdd00';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`SANTUARI ESPOSTI ${Math.ceil(state.boss_expose_timer)}s`, pad + 215, pad + 20);
    }

    // pannello giocatore
    const r = D.ROSTER[player.roster_idx];
    const info_y = pad + 60;
    ctx.fillStyle = 'rgba(8,8,16,0.9)';
    roundRect(ctx, pad, info_y, 170, 46, 8);
    ctx.fill();
    ctx.strokeStyle = r.color + '40';
    ctx.lineWidth = 1;
    roundRect(ctx, pad, info_y, 170, 46, 8);
    ctx.stroke();

    // nome campione
    ctx.fillStyle = r.color;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${r.icon} ${r.name} Lv${player.level}`, pad + 8, info_y + 16);

    // barra HP migliorata
    const hp_pct = player.hp / player.max_hp;
    const bar_x = pad + 8, bar_y = info_y + 24, bar_w = 154, bar_h = 6;
    ctx.fillStyle = 'rgba(20,20,30,0.8)';
    roundRect(ctx, bar_x, bar_y, bar_w, bar_h, 3);
    ctx.fill();
    const hp_color = hp_pct > 0.5 ? '#40c060' : hp_pct > 0.25 ? '#ddaa00' : '#dd3030';
    if (hp_pct > 0) {
      ctx.fillStyle = hp_color;
      roundRect(ctx, bar_x, bar_y, bar_w * hp_pct, bar_h, 3);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, bar_x, bar_y, bar_w, bar_h, 3);
    ctx.stroke();

    // testo HP
    ctx.fillStyle = '#999';
    ctx.font = '9px monospace';
    ctx.fillText(`${Math.ceil(player.hp)}/${player.max_hp}`, pad + 8, info_y + 42);
    if (player.shards > 0) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText(`✦ ${player.shards}`, pad + 100, info_y + 42);
    }
  }

  function render_minimap(state, entities, player) {
    const mm_w = 140, mm_h = 93;
    const mm_x = W - mm_w - 12;
    const mm_y = 12;
    const sx = mm_w / D.MAP.W;
    const sy = mm_h / D.MAP.H;

    // sfondo
    ctx.fillStyle = 'rgba(8,8,16,0.92)';
    roundRect(ctx, mm_x - 2, mm_y - 2, mm_w + 4, mm_h + 4, 8);
    ctx.fill();

    // terreno
    ctx.fillStyle = '#0c0c16';
    ctx.fillRect(mm_x, mm_y, mm_w, mm_h);

    // strade
    ctx.fillStyle = '#151528';
    ctx.fillRect(mm_x, mm_y + D.MAP.lanes.top.y * sy - 3, mm_w, 6);
    ctx.fillRect(mm_x, mm_y + D.MAP.lanes.bot.y * sy - 3, mm_w, 6);

    // jungle
    ctx.fillStyle = '#0d1810';
    const jx = 1050 * sx, jy = 950 * sy, jw = (D.MAP.W - 2100) * sx, jh = 1300 * sy;
    ctx.fillRect(mm_x + jx, mm_y + jy, jw, jh);

    // bushes
    ctx.fillStyle = 'rgba(20,60,30,0.5)';
    for (const b of D.MAP.bushes) {
      ctx.fillRect(mm_x + b.x * sx, mm_y + b.y * sy, Math.max(1, b.w * sx), Math.max(1, b.h * sy));
    }

    // basi
    for (const base of [D.BASES.blue, D.BASES.red]) {
      ctx.fillStyle = base.team === 0 ? 'rgba(40,100,200,0.3)' : 'rgba(200,40,40,0.3)';
      ctx.beginPath();
      ctx.arc(mm_x + base.x * sx, mm_y + base.y * sy, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // goals
    for (const g of state.goals) {
      if (!g.alive) continue;
      ctx.fillStyle = g.team === 0 ? '#3080d0' : '#d03030';
      ctx.fillRect(mm_x + g.x * sx - 2, mm_y + g.y * sy - 2, 4, 4);
    }

    // entità
    for (const e of entities) {
      if (e.dead) continue;
      if (e.type === 'champion') {
        ctx.fillStyle = e.is_player ? '#ffdd00' : (e.team === 0 ? '#40a0ff' : '#ff4040');
        ctx.fillRect(mm_x + e.x * sx - 2, mm_y + e.y * sy - 2, 5, 5);
      } else if (e.type === 'creep') {
        ctx.fillStyle = '#604080';
        ctx.fillRect(mm_x + e.x * sx - 1, mm_y + e.y * sy - 1, 2, 2);
      } else if (e.type === 'boss') {
        ctx.fillStyle = '#ff2040';
        ctx.beginPath();
        ctx.arc(mm_x + e.x * sx, mm_y + e.y * sy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff6080';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (e.type === 'turret') {
        ctx.fillStyle = '#a0a040';
        ctx.fillRect(mm_x + e.x * sx - 1, mm_y + e.y * sy - 1, 3, 3);
      }
    }

    // viewport
    ctx.strokeStyle = 'rgba(255,220,0,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mm_x + camera.x * sx, mm_y + camera.y * sy, W * sx, H * sy);

    // bordo
    ctx.strokeStyle = 'rgba(100,120,180,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, mm_x, mm_y, mm_w, mm_h, 6);
    ctx.stroke();
  }

  function render_channel_bar(player) {
    if (!player.channeling) return;
    const bar_w = 100;
    const bar_h = 8;
    const x = player.x - camera.x - bar_w / 2;
    const y = player.y - camera.y - 50;
    const pct = 1 - (player.channel_timer / D.CHANNEL_TIME);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, x - 1, y - 1, bar_w + 2, bar_h + 2, 4);
    ctx.fill();
    ctx.fillStyle = '#ffdd00';
    roundRect(ctx, x, y, bar_w * pct, bar_h, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffdd00';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, bar_w, bar_h, 3);
    ctx.stroke();
  }

  function render_end_screen(state) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RITI COMPIUTI', W / 2, H / 2 - 70);

    ctx.font = 'bold 56px monospace';
    ctx.fillStyle = '#40a0ff';
    ctx.fillText(state.scores[0], W / 2 - 70, H / 2);
    ctx.fillStyle = '#555';
    ctx.fillText(':', W / 2, H / 2);
    ctx.fillStyle = '#ff4040';
    ctx.fillText(state.scores[1], W / 2 + 70, H / 2);

    ctx.font = '22px monospace';
    const won = state.scores[0] > state.scores[1];
    ctx.fillStyle = won ? '#40d060' : state.scores[0] === state.scores[1] ? '#ddaa00' : '#ff4040';
    ctx.fillText(won ? 'VITTORIA' : state.scores[0] === state.scores[1] ? 'PAREGGIO' : 'SCONFITTA', W / 2, H / 2 + 45);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('Tocca per rigiocare', W / 2, H / 2 + 90);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return { init, resize, update_camera, render_frame, render_end_screen,
           add_shake, add_damage_flash, add_level_up_banner, add_death_effect,
           get camera() { return camera; }, get W() { return W; }, get H() { return H; } };
})();

if (typeof module !== 'undefined') module.exports = Render;
