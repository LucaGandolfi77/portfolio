import Phaser from 'phaser'
import { MainScene } from './scenes/MainScene'

export const PhaserGame = (containerId: string) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: containerId,
    backgroundColor: '#2d2d2d',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%'
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [MainScene]
  }

  return new Phaser.Game(config)
}