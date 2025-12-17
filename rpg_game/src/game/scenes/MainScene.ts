import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super('MainScene')
  }

  preload() {
    // Load assets here
    this.load.image('tiles', 'https://labs.phaser.io/assets/tilemaps/tiles/cybernoid.png') // Placeholder
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png') // Placeholder
  }

  create() {
    this.add.text(100, 100, 'Zelda RPG Clone', { fontSize: '32px', color: '#ffffff' })
    
    this.player = this.physics.add.sprite(400, 300, 'player')
    this.player.setCollideWorldBounds(true)

    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    // Listen for joystick events
    window.addEventListener('joystick-move', (e: any) => {
        const data = e.detail
        if (data && data.vector) {
            const speed = 160
            this.player.setVelocity(data.vector.x * speed, data.vector.y * speed * -1) // Invert Y for nipplejs vs phaser
        }
    })

    window.addEventListener('joystick-end', () => {
        this.player.setVelocity(0)
    })
  }

  update() {
    if (!this.cursors) return

    const speed = 160
    // Keyboard controls override joystick if pressed
    if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) {
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
}