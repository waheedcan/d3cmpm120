export default class PinballScene extends Phaser.Scene {
  constructor() {
    super('PinballScene');
  }

  create() {
    this.physics.world.setBounds(0, 0, 480, 640);

    const leftWall = this.add.rectangle(16, 320, 32, 640, 0x355070);
    const rightWall = this.add.rectangle(464, 320, 32, 640, 0x355070);
    const bottomGutter = this.add.rectangle(240, 624, 480, 32, 0x6d597a);

    this.physics.add.existing(leftWall, true);
    this.physics.add.existing(rightWall, true);
    this.physics.add.existing(bottomGutter, true);

    const ball = this.add.circle(420, 80, 14, 0xf8f9fa);
    this.physics.add.existing(ball);

    ball.body.setCircle(14);
    ball.body.setBounce(0.85);
    ball.body.setCollideWorldBounds(true);
    ball.body.setVelocity(-80, 0);

    this.physics.add.collider(ball, [leftWall, rightWall, bottomGutter]);
  }
}
