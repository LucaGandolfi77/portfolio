// minigame.js — Referendum Rumble: Signal Storm Engine
// Hexagonal grid strategy + reflex duel on HTML5 Canvas

'use strict';

/**
 * Hex grid layout constants.
 * 19 nodes in a 3-4-5-4-3 honeycomb layout.
 */
const HEX_ROWS = [3, 4, 5, 4, 3];
const TOTAL_NODES = 19;

const COLORS = {
  bg: '#0A0E1A',
  cyan: '#00C2D4',
  cyanDark: '#007A8A',
  cyanGlow: 'rgba(0, 194, 212, 0.5)',
  crimson: '#E63946',
  crimsonDark: '#8C1C24',
  crimsonGlow: 'rgba(230, 57, 70, 0.5)',
  neutral: '#2A2F45',
  neutralLight: '#3A4060',
  connection: 'rgba(255,255,255,0.08)',
  textWhite: '#E2E8F0'
};

const POWER_UPS = [
  { id: 'overclock', icon: '⚡', label: 'Overclock', duration: 8000 },
  { id: 'shield', icon: '🛡', label: 'Shield', duration: 0 },
  { id: 'scramble', icon: '🌀', label: 'Scramble', duration: 0 },
  { id: 'surge', icon: '💥', label: 'Surge', duration: 0 }
];

/**
 * Compute hex grid positions for an 800×600 canvas.
 * Returns array of { x, y, row, col } for each node.
 * @returns {Array<{ x: number, y: number, row: number, col: number, index: number }>}
 */
function computeHexPositions() {
  const nodes = [];
  const cx = 400, cy = 300;
  const spacingX = 90;
  const spacingY = 78;
  const totalRows = HEX_ROWS.length;
  const midRow = Math.floor(totalRows / 2);
  let idx = 0;

  for (let r = 0; r < totalRows; r++) {
    const count = HEX_ROWS[r];
    const rowOffset = r - midRow;
    const y = cy + rowOffset * spacingY;
    const startX = cx - (count - 1) * spacingX / 2;

    for (let c = 0; c < count; c++) {
      nodes.push({
        x: startX + c * spacingX,
        y: y,
        row: r,
        col: c,
        index: idx++
      });
    }
  }

  return nodes;
}

/**
 * Compute adjacency list for the hexagonal grid.
 * Two nodes are adjacent if they're in neighboring rows and close columns.
 * @param {Array} positions
 * @returns {Array<number[]>}
 */
function computeAdjacency(positions) {
  const adj = positions.map(() => []);
  const threshold = 105; // slightly larger than spacing to catch diagonals

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].x - positions[j].x;
      const dy = positions[i].y - positions[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }

  return adj;
}

/**
 * Signal Storm mini-game engine.
 */
class SignalStorm {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} config - { myFaction, opponentFaction, opponentName, myName, challengeId, underdogMultiplier, underdogFaction }
   * @param {Object} callbacks - { onGameEnd(result), onSyncSend(data) }
   */
  constructor(canvas, config, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.callbacks = callbacks;

    // Canvas dimensions
    this.W = 800;
    this.H = 600;
    canvas.width = this.W;
    canvas.height = this.H;

    // Grid
    this.positions = computeHexPositions();
    this.adjacency = computeAdjacency(this.positions);

    // Node state
    this.nodes = this.positions.map((pos, i) => ({
      index: i,
      x: pos.x,
      y: pos.y,
      owner: 'neutral',  // 'cyan', 'crimson', 'neutral'
      charge: 0,
      maxCharge: 100,
      powerUp: null,
      radius: 24,
      pulseAnim: 0
    }));

    // Base nodes: top-left for cyan, bottom-right for crimson
    this.cyanBase = 0;
    this.crimsonBase = TOTAL_NODES - 1;
    this.nodes[this.cyanBase].owner = 'cyan';
    this.nodes[this.cyanBase].charge = 80;
    this.nodes[this.crimsonBase].owner = 'crimson';
    this.nodes[this.crimsonBase].charge = 80;

    // Player state
    this.selectedNode = -1;
    this.myFaction = config.myFaction || 'cyan';
    this.opponentFaction = config.opponentFaction || 'crimson';

    // Pulses (attacks in flight)
    /** @type {Array<{ x: number, y: number, fromNode: number, toNode: number, faction: string, progress: number, speed: number, trail: Array }>} */
    this.pulses = [];

    // Power-ups on the field
    /** @type {Array<{ nodeIndex: number, type: Object, spawnTime: number }>} */
    this.fieldPowerUps = [];

    // Active power-up effects
    this.myPowerUps = {
      overclock: 0,  // timestamp when expires
      shield: false
    };
    this.opponentPowerUps = {
      overclock: 0,
      shield: false
    };

    // Scoring
    this.score = { deflections: 0, captures: 0, powerUps: 0 };
    this.opponentScore = { deflections: 0, captures: 0, powerUps: 0 };

    // Timing
    this.gameDuration = 90000; // 90 seconds
    this.startTime = 0;
    this.elapsed = 0;
    this.lastPropagation = 0;
    this.lastPowerUpSpawn = 0;
    this.lastSync = 0;
    this.propagationInterval = 800;

    // State
    this.running = false;
    this.gameOver = false;
    this.winner = null;
    this.animFrame = null;

    // Reduced motion
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Input
    this._boundClick = this._handleClick.bind(this);
    this._boundTouch = this._handleTouch.bind(this);
    canvas.addEventListener('click', this._boundClick);
    canvas.addEventListener('touchstart', this._boundTouch, { passive: false });

    // Particles
    /** @type {Array<{ x: number, y: number, vx: number, vy: number, life: number, color: string, size: number }>} */
    this.particles = [];

    // Ripple effects
    /** @type {Array<{ x: number, y: number, radius: number, maxRadius: number, color: string, alpha: number }>} */
    this.ripples = [];
  }

  /**
   * Start the game loop.
   */
  start() {
    this.running = true;
    this.gameOver = false;
    this.startTime = performance.now();
    this.lastPropagation = this.startTime;
    this.lastPowerUpSpawn = this.startTime;
    this.lastSync = this.startTime;
    this._loop(this.startTime);
  }

  /**
   * Stop the game and clean up.
   */
  stop() {
    this.running = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    this.canvas.removeEventListener('click', this._boundClick);
    this.canvas.removeEventListener('touchstart', this._boundTouch);
  }

  /**
   * Main game loop.
   * @param {number} timestamp
   * @private
   */
  _loop(timestamp) {
    if (!this.running) return;

    this.elapsed = timestamp - this.startTime;

    this._update(timestamp);
    this._render();

    if (!this.gameOver) {
      this.animFrame = requestAnimationFrame((t) => this._loop(t));
    }
  }

  /**
   * Update game state.
   * @param {number} timestamp
   * @private
   */
  _update(timestamp) {
    // Check time limit
    if (this.elapsed >= this.gameDuration) {
      this._endGame();
      return;
    }

    // Propagation tick
    const propInterval = this._getMyPropInterval();
    if (timestamp - this.lastPropagation >= propInterval) {
      this.lastPropagation = timestamp;
      this._propagationTick();
    }

    // Power-up spawning
    if (timestamp - this.lastPowerUpSpawn >= 15000) {
      this.lastPowerUpSpawn = timestamp;
      this._spawnPowerUp();
    }

    // Update pulses
    this._updatePulses(timestamp);

    // Update particles
    this._updateParticles();

    // Update ripples
    this._updateRipples();

    // Sync to opponent
    if (timestamp - this.lastSync >= 200) {
      this.lastSync = timestamp;
      this._sendSync();
    }

    // Check win condition: base captured
    if (this.nodes[this.cyanBase].owner === 'crimson') {
      this.winner = 'crimson';
      this._endGame();
    } else if (this.nodes[this.crimsonBase].owner === 'cyan') {
      this.winner = 'cyan';
      this._endGame();
    }
  }

  /**
   * Get propagation interval (halved if overclock active).
   * @returns {number}
   * @private
   */
  _getMyPropInterval() {
    const now = performance.now();
    if (this.myPowerUps.overclock > now) return this.propagationInterval / 2;
    return this.propagationInterval;
  }

  /**
   * Automatic propagation: charge owned nodes and auto-propagate full ones.
   * @private
   */
  _propagationTick() {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.owner === 'neutral') continue;

      // Charge increase
      const isBase = (i === this.cyanBase || i === this.crimsonBase);
      const chargeRate = isBase ? 16 : 8;
      node.charge = Math.min(node.maxCharge, node.charge + chargeRate);

      // Auto-propagate at full charge
      if (node.charge >= node.maxCharge) {
        const adjacent = this.adjacency[i];
        // Find weakest adjacent non-owned or neutral node
        let weakest = -1;
        let weakestCharge = Infinity;

        for (const adj of adjacent) {
          const adjNode = this.nodes[adj];
          if (adjNode.owner !== node.owner) {
            if (adjNode.charge < weakestCharge) {
              weakestCharge = adjNode.charge;
              weakest = adj;
            }
          }
        }

        if (weakest >= 0) {
          this._propagateTo(i, weakest, 50);
        }
      }
    }
  }

  /**
   * Propagate charge from one node to another.
   * @param {number} fromIdx
   * @param {number} toIdx
   * @param {number} amount
   * @private
   */
  _propagateTo(fromIdx, toIdx, amount) {
    const from = this.nodes[fromIdx];
    const to = this.nodes[toIdx];

    // Don't capture base nodes
    const isTargetBase = (toIdx === this.cyanBase || toIdx === this.crimsonBase);

    const transfer = Math.min(from.charge, amount);
    from.charge -= transfer;

    if (to.owner === from.owner) {
      // Friendly: just add charge
      to.charge = Math.min(to.maxCharge, to.charge + transfer);
    } else if (to.owner === 'neutral') {
      // Neutral → capture
      to.charge = transfer;
      to.owner = from.owner;
      this._addRipple(to.x, to.y, from.owner);

      // Check for power-up collection
      this._checkPowerUpCollection(toIdx, from.owner);
    } else {
      // Enemy
      if (isTargetBase) {
        // Base: can damage but not capture
        to.charge = Math.max(0, to.charge - transfer);
        return;
      }

      to.charge -= transfer;
      if (to.charge <= 0) {
        // Flip ownership
        to.charge = Math.abs(to.charge);
        to.owner = from.owner;
        this._addRipple(to.x, to.y, from.owner);
        this._checkPowerUpCollection(toIdx, from.owner);

        if (from.owner === this.myFaction) {
          this.score.captures++;
        } else {
          this.opponentScore.captures++;
        }
      }
    }
  }

  /**
   * Spawn a power-up on a random neutral node.
   * @private
   */
  _spawnPowerUp() {
    const neutralNodes = this.nodes
      .map((n, i) => ({ node: n, index: i }))
      .filter(({ node, index }) => node.owner === 'neutral' && !this.fieldPowerUps.some(p => p.nodeIndex === index));

    if (neutralNodes.length === 0) return;

    const target = neutralNodes[Math.floor(Math.random() * neutralNodes.length)];
    const puType = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];

    this.fieldPowerUps.push({
      nodeIndex: target.index,
      type: puType,
      spawnTime: performance.now()
    });
  }

  /**
   * Check if a captured node has a power-up to collect.
   * @param {number} nodeIdx
   * @param {string} faction
   * @private
   */
  _checkPowerUpCollection(nodeIdx, faction) {
    const puIdx = this.fieldPowerUps.findIndex(p => p.nodeIndex === nodeIdx);
    if (puIdx < 0) return;

    const pu = this.fieldPowerUps[puIdx];
    this.fieldPowerUps.splice(puIdx, 1);

    const isMe = faction === this.myFaction;
    const puTarget = isMe ? this.myPowerUps : this.opponentPowerUps;

    switch (pu.type.id) {
      case 'overclock':
        puTarget.overclock = performance.now() + 8000;
        break;

      case 'shield':
        puTarget.shield = true;
        break;

      case 'scramble': {
        // Enemy nodes lose 20 charge
        const enemyFaction = isMe ? this.opponentFaction : this.myFaction;
        for (const node of this.nodes) {
          if (node.owner === enemyFaction) {
            node.charge = Math.max(0, node.charge - 20);
          }
        }
        break;
      }

      case 'surge': {
        // All owned nodes gain +30
        for (const node of this.nodes) {
          if (node.owner === faction) {
            node.charge = Math.min(node.maxCharge, node.charge + 30);
          }
        }
        break;
      }
    }

    if (isMe) {
      this.score.powerUps++;
    } else {
      this.opponentScore.powerUps++;
    }
  }

  /**
   * Update pulse positions and check for hits.
   * @param {number} timestamp
   * @private
   */
  _updatePulses(timestamp) {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pulse = this.pulses[i];
      const from = this.nodes[pulse.fromNode];
      const to = this.nodes[pulse.toNode];

      pulse.progress += pulse.speed;

      // Update position
      pulse.x = from.x + (to.x - from.x) * pulse.progress;
      pulse.y = from.y + (to.y - from.y) * pulse.progress;

      // Trail
      if (!this.reducedMotion) {
        pulse.trail.push({ x: pulse.x, y: pulse.y, alpha: 1.0 });
        if (pulse.trail.length > 12) pulse.trail.shift();
        pulse.trail.forEach(t => t.alpha *= 0.85);
      }

      // Pulse arrived
      if (pulse.progress >= 1.0) {
        // Check if defender has shield
        const defenderFaction = to.owner;
        const defenderPU = defenderFaction === this.myFaction ? this.myPowerUps : this.opponentPowerUps;

        if (defenderPU.shield) {
          // Auto-deflect
          defenderPU.shield = false;
          to.charge = Math.min(to.maxCharge, to.charge + 20);
          this._addParticles(to.x, to.y, COLORS.textWhite, 8);
        } else {
          // Hit: target loses 40 charge, may flip
          const isBase = (pulse.toNode === this.cyanBase || pulse.toNode === this.crimsonBase);
          to.charge -= 40;
          if (to.charge <= 0 && !isBase) {
            to.charge = 10;
            to.owner = pulse.faction;
            this._addRipple(to.x, to.y, pulse.faction);
          } else {
            to.charge = Math.max(0, to.charge);
          }
          this._addParticles(to.x, to.y, pulse.faction === 'cyan' ? COLORS.cyan : COLORS.crimson, 12);
        }

        this.pulses.splice(i, 1);
      }
    }
  }

  /**
   * Handle click input.
   * @param {MouseEvent} e
   * @private
   */
  _handleClick(e) {
    if (this.gameOver) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.W / rect.width;
    const scaleY = this.H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    this._processInput(mx, my);
  }

  /**
   * Handle touch input.
   * @param {TouchEvent} e
   * @private
   */
  _handleTouch(e) {
    if (this.gameOver) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.W / rect.width;
    const scaleY = this.H / rect.height;
    const mx = (touch.clientX - rect.left) * scaleX;
    const my = (touch.clientY - rect.top) * scaleY;

    this._processInput(mx, my);
  }

  /**
   * Process an input at canvas coordinates.
   * @param {number} mx
   * @param {number} my
   * @private
   */
  _processInput(mx, my) {
    // Check if clicking on a pulse (defense)
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pulse = this.pulses[i];
      if (pulse.faction === this.myFaction) continue; // can't deflect own pulses
      const dx = mx - pulse.x;
      const dy = my - pulse.y;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        // Deflected!
        const target = this.nodes[pulse.toNode];
        target.charge = Math.min(target.maxCharge, target.charge + 20);
        this.score.deflections++;
        this._addParticles(pulse.x, pulse.y, COLORS.textWhite, 10);
        this.pulses.splice(i, 1);
        return;
      }
    }

    // Check which node was clicked
    let clickedNode = -1;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const dx = mx - node.x;
      const dy = my - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 8) {
        clickedNode = i;
        break;
      }
    }

    if (clickedNode < 0) {
      this.selectedNode = -1;
      return;
    }

    const clickedOwner = this.nodes[clickedNode].owner;

    if (this.selectedNode < 0) {
      // No selection: select own node
      if (clickedOwner === this.myFaction) {
        this.selectedNode = clickedNode;
      }
    } else {
      // Already selected
      if (clickedNode === this.selectedNode) {
        // Deselect
        this.selectedNode = -1;
      } else if (clickedOwner === this.myFaction) {
        // Select different own node
        this.selectedNode = clickedNode;
      } else if (this.adjacency[this.selectedNode].includes(clickedNode)) {
        // Adjacent: manual propagate
        const selected = this.nodes[this.selectedNode];
        if (selected.charge >= 10) {
          const amount = Math.floor(selected.charge * 0.7);
          this._propagateTo(this.selectedNode, clickedNode, amount);
          this.selectedNode = -1;
        }
      } else if (clickedOwner !== this.myFaction && clickedOwner !== 'neutral') {
        // Non-adjacent enemy: pulse attack
        const selected = this.nodes[this.selectedNode];
        if (selected.charge >= 80) {
          this._launchPulse(this.selectedNode, clickedNode);
          selected.charge = 10;
          this.selectedNode = -1;
        }
      } else {
        this.selectedNode = -1;
      }
    }
  }

  /**
   * Launch a pulse attack from one node toward another.
   * @param {number} fromIdx
   * @param {number} toIdx
   * @private
   */
  _launchPulse(fromIdx, toIdx) {
    const from = this.nodes[fromIdx];
    this.pulses.push({
      x: from.x,
      y: from.y,
      fromNode: fromIdx,
      toNode: toIdx,
      faction: from.owner,
      progress: 0,
      speed: 1 / 90, // ~1.5s travel at 60fps
      trail: []
    });
  }

  /**
   * Apply opponent's sync data.
   * @param {Object} data
   */
  applySync(data) {
    if (!data || !data.nodes) return;

    // Merge opponent's view — opponent is authoritative for their side
    for (let i = 0; i < this.nodes.length; i++) {
      const remote = data.nodes[i];
      if (!remote) continue;

      // If remote claims ownership and local says neutral or remote faction, trust remote
      if (remote.owner === this.opponentFaction && this.nodes[i].owner !== this.myFaction) {
        this.nodes[i].owner = remote.owner;
        this.nodes[i].charge = remote.charge;
      } else if (remote.owner === 'neutral' && this.nodes[i].owner === this.opponentFaction) {
        this.nodes[i].owner = remote.owner;
        this.nodes[i].charge = remote.charge;
      }
    }

    // Merge incoming pulses
    if (data.pulses) {
      for (const rp of data.pulses) {
        if (rp.faction === this.opponentFaction) {
          const exists = this.pulses.some(
            p => p.fromNode === rp.fromNode && p.toNode === rp.toNode && Math.abs(p.progress - rp.progress) < 0.2
          );
          if (!exists) {
            this.pulses.push({
              ...rp,
              trail: [],
              x: this.nodes[rp.fromNode].x,
              y: this.nodes[rp.fromNode].y
            });
          }
        }
      }
    }

    if (data.opponentScore) {
      this.opponentScore = { ...this.opponentScore, ...data.opponentScore };
    }
  }

  /**
   * Send sync data to opponent.
   * @private
   */
  _sendSync() {
    const data = {
      nodes: this.nodes.map(n => ({
        owner: n.owner,
        charge: Math.round(n.charge)
      })),
      pulses: this.pulses
        .filter(p => p.faction === this.myFaction)
        .map(p => ({
          fromNode: p.fromNode,
          toNode: p.toNode,
          faction: p.faction,
          progress: p.progress
        })),
      opponentScore: this.score,
      timestamp: Date.now()
    };

    this.callbacks.onSyncSend?.(data);
  }

  /**
   * End the game and compute final scores.
   * @private
   */
  _endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.running = false;

    // Count owned nodes
    let myNodes = 0, oppNodes = 0;
    for (const node of this.nodes) {
      if (node.owner === this.myFaction) myNodes++;
      else if (node.owner === this.opponentFaction) oppNodes++;
    }

    // Compute scores
    const myScore = (myNodes * 10) + (this.score.deflections * 5) + (this.score.powerUps * 15);
    const oppScore = (oppNodes * 10) + (this.opponentScore.deflections * 5) + (this.opponentScore.powerUps * 15);

    // If base captured, winner already set
    if (!this.winner) {
      this.winner = myNodes >= oppNodes ? this.myFaction : this.opponentFaction;
    }

    this.callbacks.onGameEnd?.({
      challengeId: this.config.challengeId,
      winner: this.winner,
      myScore,
      oppScore,
      scoreA: this.myFaction === 'cyan' ? myScore : oppScore,
      scoreB: this.myFaction === 'crimson' ? myScore : oppScore,
      myNodes,
      oppNodes,
      deflections: this.score.deflections,
      powerUpsCollected: this.score.powerUps
    });

    // Final render
    this._render();
  }

  // ================== RENDERING ==================

  /**
   * Render one frame.
   * @private
   */
  _render() {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;

    // Clear
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw connections
    this._renderConnections(ctx);

    // Draw field power-ups
    this._renderFieldPowerUps(ctx);

    // Draw nodes
    this._renderNodes(ctx);

    // Draw pulses
    this._renderPulses(ctx);

    // Draw particles
    this._renderParticles(ctx);

    // Draw ripples
    this._renderRipples(ctx);

    // Draw selection indicator
    if (this.selectedNode >= 0) {
      const node = this.nodes[this.selectedNode];
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight adjacent nodes
      for (const adj of this.adjacency[this.selectedNode]) {
        const adjNode = this.nodes[adj];
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(adjNode.x, adjNode.y, adjNode.radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Game over overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(10, 14, 26, 0.7)';
      ctx.fillRect(0, 0, W, H);

      ctx.font = 'bold 48px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.winner === 'cyan' ? COLORS.cyan : COLORS.crimson;
      ctx.fillText(
        this.winner === this.myFaction ? 'VICTORY!' : 'DEFEAT',
        W / 2, H / 2 - 20
      );

      ctx.font = '24px Rajdhani, sans-serif';
      ctx.fillStyle = COLORS.textWhite;
      ctx.fillText('Tap anywhere to continue', W / 2, H / 2 + 30);
    }
  }

  /**
   * Draw grid connections.
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */
  _renderConnections(ctx) {
    ctx.strokeStyle = COLORS.connection;
    ctx.lineWidth = 1;

    for (let i = 0; i < this.adjacency.length; i++) {
      for (const j of this.adjacency[i]) {
        if (j <= i) continue; // avoid duplicate lines
        ctx.beginPath();
        ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
        ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
        ctx.stroke();
      }
    }
  }

  /**
   * Draw nodes with charge arcs and glow.
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */
  _renderNodes(ctx) {
    for (const node of this.nodes) {
      const isBase = (node.index === this.cyanBase || node.index === this.crimsonBase);
      let fillColor, glowColor;

      if (node.owner === 'cyan') {
        fillColor = COLORS.cyanDark;
        glowColor = COLORS.cyanGlow;
      } else if (node.owner === 'crimson') {
        fillColor = COLORS.crimsonDark;
        glowColor = COLORS.crimsonGlow;
      } else {
        fillColor = COLORS.neutral;
        glowColor = null;
      }

      // Glow
      if (glowColor && !this.reducedMotion) {
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
      }

      // Outline
      ctx.strokeStyle = node.owner === 'cyan' ? COLORS.cyan
        : node.owner === 'crimson' ? COLORS.crimson
        : COLORS.neutralLight;
      ctx.lineWidth = isBase ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Charge arc
      if (node.charge > 0) {
        const chargeAngle = (node.charge / node.maxCharge) * Math.PI * 2;
        ctx.strokeStyle = node.owner === 'cyan' ? COLORS.cyan
          : node.owner === 'crimson' ? COLORS.crimson
          : COLORS.neutralLight;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4, -Math.PI / 2, -Math.PI / 2 + chargeAngle);
        ctx.stroke();
      }

      // Charge text
      ctx.font = '12px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.textWhite;
      ctx.fillText(Math.round(node.charge).toString(), node.x, node.y);

      // Base label
      if (isBase) {
        ctx.font = 'bold 10px Rajdhani, sans-serif';
        ctx.fillStyle = node.owner === 'cyan' ? COLORS.cyan : COLORS.crimson;
        ctx.fillText('BASE', node.x, node.y + node.radius + 14);
      }
    }
  }

  /**
   * Draw pulses with trails.
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */
  _renderPulses(ctx) {
    for (const pulse of this.pulses) {
      const color = pulse.faction === 'cyan' ? COLORS.cyan : COLORS.crimson;

      // Trail
      if (!this.reducedMotion) {
        for (let t = 0; t < pulse.trail.length; t++) {
          const pt = pulse.trail[t];
          ctx.globalAlpha = pt.alpha * 0.4;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Main orb
      ctx.save();
      if (!this.reducedMotion) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner bright core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draw power-ups on the field.
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */
  _renderFieldPowerUps(ctx) {
    const now = performance.now();
    for (const pu of this.fieldPowerUps) {
      const node = this.nodes[pu.nodeIndex];
      const bounce = this.reducedMotion ? 0 : Math.sin(now / 400) * 4;

      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.type.icon, node.x, node.y - node.radius - 14 + bounce);
    }
  }

  /**
   * Add particle burst at position.
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {number} count
   * @private
   */
  _addParticles(x, y, color, count) {
    if (this.reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: 2 + Math.random() * 3
      });
    }
  }

  /**
   * Update particles.
   * @private
   */
  _updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles.
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */
  _renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Add ripple effect at position.
   * @param {number} x
   * @param {number} y
   * @param {string} faction
   * @private
   */
  _addRipple(x, y, faction) {
    if (this.reducedMotion) return;
    this.ripples.push({
      x, y,
      radius: 0,
      maxRadius: 50,
      color: faction === 'cyan' ? COLORS.cyan : COLORS.crimson,
      alpha: 0.6
    });
  }

  /**
   * Update ripples.
   * @private
   */
  _updateRipples() {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 2;
      r.alpha -= 0.02;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  /**
   * Render ripples.
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */
  _renderRipples(ctx) {
    for (const r of this.ripples) {
      ctx.globalAlpha = r.alpha;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Get remaining time in seconds.
   * @returns {number}
   */
  getRemainingTime() {
    return Math.max(0, Math.ceil((this.gameDuration - this.elapsed) / 1000));
  }

  /**
   * Get current node ownership count.
   * @returns {{ cyan: number, crimson: number, neutral: number }}
   */
  getNodeCounts() {
    let cyan = 0, crimson = 0, neutral = 0;
    for (const n of this.nodes) {
      if (n.owner === 'cyan') cyan++;
      else if (n.owner === 'crimson') crimson++;
      else neutral++;
    }
    return { cyan, crimson, neutral };
  }
}

// Export
window.SignalStorm = SignalStorm;
window.POWER_UPS = POWER_UPS;
