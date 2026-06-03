import TitleScene from './scenes/TitleScene.js';
import PinballScene from './scenes/PinballScene.js';

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 980 },
    },
  },
  scene: [TitleScene, PinballScene],
};

new Phaser.Game(config);
