export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    this.add.text(240, 320, 'Gravity Gardens', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(240, 372, 'The ball is always in control.\nYou never are.', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#d8f3dc',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(240, 500, 'Press Space to start', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('PinballScene');
    });
  }
}
