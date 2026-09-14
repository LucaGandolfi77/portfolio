import Phaser from 'phaser'
import { MainScene } from './scenes/MainScene'

export const sendToScene = (eventName: string, data?: any) => {
  if ((window as any).__phaserGame) {
    const scene = (window as any).__phaserGame.scene.getScene('MainScene')
    if (scene) {
      scene.events.emit(eventName, data)
    }
  }
}

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
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: [MainScene]
  }

  const game = new Phaser.Game(config)
  ;(window as any).__phaserGame = game
  return game
}
