export default class SummaryScene extends Phaser.Scene {
  constructor() {
    super('SummaryScene');
  }

  create(data) {
    const message = data.result === 'win' ? 'You cleared the garden.' : 'Out of balls.';
    const score = data.score ?? 0;
    const nextScene = data.nextScene ?? 'TitleScene';

    this.add.text(240, 280, message, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(240, 330, `Bumpers hit: ${score}/5`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#d8f3dc',
    }).setOrigin(0.5);

    const continueButton = this.add.text(240, 400, 'Continue', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#355070',
      padding: {
        x: 18,
        y: 10,
      },
    }).setOrigin(0.5);

    continueButton.setInteractive({ useHandCursor: true });
    continueButton.on('pointerdown', () => this.scene.start(nextScene));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start(nextScene));
  }
}
