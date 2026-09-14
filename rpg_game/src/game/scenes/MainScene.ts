import Phaser from 'phaser'

interface Enemy {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  hp: number
  maxHp: number
  alive: boolean
}

interface Npc {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  name: string
  dialog: string
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private enemies: Enemy[] = []
  private npcs: Npc[] = []
  private isInvulnerable = false
  private playerHp = 100
  private playerMaxHp = 100
  private score = 0
  private attackRange = 60
  private dialogBox: Phaser.GameObjects.Rectangle | null = null
  private dialogText: Phaser.GameObjects.Text | null = null
  private interactCooldown = false

  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.image('tiles', 'https://labs.phaser.io/assets/tilemaps/tiles/cybernoid.png')
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png')
  }

  create() {
    this.add.text(100, 20, 'Zelda RPG Clone', { fontSize: '24px', color: '#ffffff' })

    this.player = this.physics.add.sprite(400, 300, 'player')
    this.player.setCollideWorldBounds(true)

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys()
    }

    this.spawnEnemies()
    this.spawnNpcs()

    this.physics.add.overlap(
      this.player,
      this.enemies.map(e => e.sprite),
      this.onPlayerEnemyOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    window.addEventListener('joystick-move', (e: any) => {
      const data = e.detail
      if (data && data.vector) {
        const speed = 160
        this.player.setVelocity(data.vector.x * speed, data.vector.y * speed * -1)
      }
    })

    window.addEventListener('joystick-end', () => {
      this.player.setVelocity(0)
    })

    window.addEventListener('game-attack', ((e: CustomEvent) => {
      const { damage, combo } = e.detail
      this.handleAttack(damage, combo)
    }) as EventListener)

    window.addEventListener('game-skill', ((e: CustomEvent) => {
      const { skillId } = e.detail
      this.handleSkill(skillId)
    }) as EventListener)

    window.addEventListener('game-dodge', (() => {
      this.handleDodge()
    }) as EventListener)

    window.addEventListener('game-interact', (() => {
      this.handleInteract()
    }) as EventListener)

    window.addEventListener('game-equip', ((e: CustomEvent) => {
      this.handleEquip(e.detail)
    }) as EventListener)
  }

  update() {
    if (!this.cursors) return

    const speed = 160
    if (
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.cursors.up.isDown ||
      this.cursors.down.isDown
    ) {
      this.player.setVelocity(0)
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed)
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed)
      }
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed)
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed)
      }
    }
  }

  private spawnEnemies() {
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 150 },
      { x: 500, y: 400 },
      { x: 150, y: 450 },
      { x: 700, y: 300 }
    ]

    positions.forEach(pos => {
      const enemy = this.physics.add.sprite(pos.x, pos.y, 'player')
      enemy.setTint(0xff0000)
      enemy.setCollideWorldBounds(true)
      this.enemies.push({ sprite: enemy, hp: 30, maxHp: 30, alive: true })
    })
  }

  private spawnNpcs() {
    const npcData = [
      { x: 300, y: 100, name: 'Elder', dialog: 'Welcome, adventurer! Defeat the enemies to earn gold.' },
      { x: 500, y: 250, name: 'Merchant', dialog: 'I sell potions and weapons. Talk to me when you have gold!' }
    ]

    npcData.forEach(data => {
      const npcSprite = this.physics.add.sprite(data.x, data.y, 'player')
      npcSprite.setTint(0x00aaff)
      npcSprite.setImmovable(true)
      this.npcs.push({ sprite: npcSprite, name: data.name, dialog: data.dialog })
    })
  }

  private handleAttack(damage: number, _combo: number) {
    this.player.setTint(0xffff00)
    this.time.delayedCall(150, () => {
      if (this.player.active) this.player.clearTint()
    })

    const playerX = this.player.x
    const playerY = this.player.y

    this.enemies.forEach(enemy => {
      if (!enemy.alive) return
      const dist = Phaser.Math.Distance.Between(playerX, playerY, enemy.sprite.x, enemy.sprite.y)
      if (dist < this.attackRange) {
        enemy.hp -= damage
        enemy.sprite.setTint(0xffffff)
        this.time.delayedCall(100, () => {
          if (enemy.sprite.active) enemy.sprite.setTint(0xff0000)
        })
        if (enemy.hp <= 0) {
          this.killEnemy(enemy)
        }
      }
    })
  }

  private handleSkill(skillId: string) {
    switch (skillId) {
      case 'fireball': {
        const fireball = this.add.circle(this.player.x, this.player.y + 10, 8, 0xff4400)
        this.tweens.add({
          targets: fireball,
          x: this.player.x + 200,
          alpha: 0,
          duration: 600,
          onComplete: () => {
            fireball.destroy()
            this.enemies.forEach(enemy => {
              if (!enemy.alive) return
              const dist = Phaser.Math.Distance.Between(this.player.x + 100, this.player.y, enemy.sprite.x, enemy.sprite.y)
              if (dist < 60) {
                enemy.hp -= 20
                enemy.sprite.setTint(0xffffff)
                this.time.delayedCall(100, () => {
                  if (enemy.sprite.active) enemy.sprite.setTint(0xff0000)
                })
                if (enemy.hp <= 0) this.killEnemy(enemy)
              }
            })
          }
        })
        break
      }
      case 'shield': {
        const shield = this.add.circle(this.player.x, this.player.y, 40, 0x0088ff, 0.4)
        shield.setStrokeStyle(3, 0x0088ff)
        this.tweens.add({
          targets: shield,
          alpha: 0,
          duration: 2000,
          onComplete: () => shield.destroy()
        })
        this.isInvulnerable = true
        this.time.delayedCall(2000, () => {
          this.isInvulnerable = false
        })
        break
      }
      case 'dash': {
        const facing = this.player.flipX ? -1 : 1
        this.player.setVelocityX(facing * 400)
        this.isInvulnerable = true
        this.player.setAlpha(0.5)
        this.time.delayedCall(300, () => {
          this.player.setVelocityX(0)
          this.isInvulnerable = false
          this.player.setAlpha(1)
        })
        break
      }
      case 'heal': {
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI * 2 * i) / 10
          const particle = this.add.circle(
            this.player.x + Math.cos(angle) * 25,
            this.player.y + Math.sin(angle) * 25,
            4,
            0x00ff00
          )
          this.tweens.add({
            targets: particle,
            y: particle.y - 30,
            alpha: 0,
            duration: 800,
            delay: i * 50,
            onComplete: () => particle.destroy()
          })
        }
        this.playerHp = Math.min(this.playerHp + 25, this.playerMaxHp)
        break
      }
    }
  }

  private handleDodge() {
    if (this.isInvulnerable) return
    const facing = this.player.flipX ? -1 : 1
    this.player.setVelocityX(facing * 300)
    this.isInvulnerable = true
    this.player.setAlpha(0.3)
    this.time.delayedCall(400, () => {
      this.player.setVelocityX(0)
      this.isInvulnerable = false
      this.player.setAlpha(1)
    })
  }

  private handleInteract() {
    if (this.interactCooldown) return
    const playerX = this.player.x
    const playerY = this.player.y

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(playerX, playerY, npc.sprite.x, npc.sprite.y)
      if (dist < 80) {
        this.showDialog(npc.name, npc.dialog)
        this.interactCooldown = true
        this.time.delayedCall(500, () => {
          this.interactCooldown = false
        })
        return
      }
    }
  }

  private handleEquip(equipment: any) {
    if (!equipment) return
    switch (equipment.slot) {
      case 'weapon':
        this.player.setTint(0xff6666)
        break
      case 'armor':
        this.player.setTint(0x6666ff)
        break
      case 'helmet':
        this.player.setTint(0x66ff66)
        break
      default:
        this.player.clearTint()
    }
    this.time.delayedCall(300, () => {
      if (this.player.active) this.player.clearTint()
    })
  }

  private killEnemy(enemy: Enemy) {
    enemy.alive = false
    this.score += 100
    this.tweens.add({
      targets: enemy.sprite,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => {
        enemy.sprite.destroy()
      }
    })
    window.dispatchEvent(new CustomEvent('game-score', { detail: { score: this.score } }))
  }

  private showDialog(name: string, text: string) {
    if (this.dialogBox) this.dialogBox.destroy()
    if (this.dialogText) this.dialogText.destroy()

    const cx = this.cameras.main.width / 2
    const cy = this.cameras.main.height - 80

    this.dialogBox = this.add.rectangle(cx, cy, 400, 60, 0x000000, 0.8)
    this.dialogBox.setStrokeStyle(2, 0xffffff)
    this.dialogText = this.add.text(cx, cy, `${name}: ${text}`, {
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 380 },
      align: 'center'
    }).setOrigin(0.5)

    this.time.delayedCall(4000, () => {
      if (this.dialogBox) this.dialogBox.destroy()
      if (this.dialogText) this.dialogText.destroy()
      this.dialogBox = null
      this.dialogText = null
    })
  }

  private onPlayerEnemyOverlap(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    if (this.isInvulnerable) return
    const enemy = this.enemies.find(e => e.sprite === enemyObj)
    if (!enemy || !enemy.alive) return

    this.playerHp -= 5
    this.isInvulnerable = true
    this.player.setTint(0xff0000)
    this.time.delayedCall(500, () => {
      this.isInvulnerable = false
      if (this.player.active) this.player.clearTint()
    })

    window.dispatchEvent(new CustomEvent('game-hit', { detail: { hp: this.playerHp, maxHp: this.playerMaxHp } }))
  }
}
