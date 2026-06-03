export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data = {}) {
    const score = data.score ?? 0;

    this.add.text(240, 280, 'Game Over', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(240, 340, `Final score: ${score}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#d8f3dc',
    }).setOrigin(0.5);

    const playAgainButton = this.add.text(240, 410, 'Play Again', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#355070',
      padding: {
        x: 18,
        y: 10,
      },
    }).setOrigin(0.5);

    playAgainButton.setInteractive({ useHandCursor: true });
    playAgainButton.on('pointerdown', () => this.scene.start('TitleScene'));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('TitleScene'));
  }
}
