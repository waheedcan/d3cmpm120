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

    this.ball = this.add.circle(420, 560, 14, 0xf8f9fa);
    this.physics.add.existing(this.ball);

    this.ball.body.setCircle(14);
    this.ball.body.setBounce(0.85);
    this.ball.body.setCollideWorldBounds(true);

    this.leftFlipper = this.add.rectangle(160, 520, 96, 16, 0xeaac8b);
    this.rightFlipper = this.add.rectangle(320, 520, 96, 16, 0xeaac8b);

    this.leftFlipper.setOrigin(0, 0.5);
    this.rightFlipper.setOrigin(1, 0.5);

    this.physics.add.existing(this.leftFlipper);
    this.physics.add.existing(this.rightFlipper);

    this.leftFlipper.body.setAllowGravity(false);
    this.leftFlipper.body.setImmovable(true);
    this.rightFlipper.body.setAllowGravity(false);
    this.rightFlipper.body.setImmovable(true);

    this.physics.add.collider(this.ball, [leftWall, rightWall, bottomGutter, this.leftFlipper, this.rightFlipper]);

    const maxChargeTime = 1500;
    const minLaunchVelocity = 450;
    const maxLaunchVelocity = 1100;
    let chargeStartTime = null;
    this.hasLaunched = false;

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.hasLaunched || chargeStartTime !== null) {
        return;
      }

      chargeStartTime = this.time.now;
    });

    this.input.keyboard.on('keyup-SPACE', () => {
      if (this.hasLaunched || chargeStartTime === null) {
        return;
      }

      const chargeTime = Math.min(this.time.now - chargeStartTime, maxChargeTime);
      const chargePercent = chargeTime / maxChargeTime;
      const launchVelocity = minLaunchVelocity + (maxLaunchVelocity - minLaunchVelocity) * chargePercent;

      this.ball.body.setVelocityY(-launchVelocity);
      this.hasLaunched = true;
      chargeStartTime = null;
    });

    this.input.keyboard.on('keydown-A', () => {
      this.leftFlipper.body.setAngularVelocity(-900);
    });

    this.input.keyboard.on('keyup-A', () => {
      this.leftFlipper.body.setAngularVelocity(900);
    });

    this.input.keyboard.on('keydown-LEFT', () => {
      this.leftFlipper.body.setAngularVelocity(-900);
    });

    this.input.keyboard.on('keyup-LEFT', () => {
      this.leftFlipper.body.setAngularVelocity(900);
    });

    this.input.keyboard.on('keydown-D', () => {
      this.rightFlipper.body.setAngularVelocity(900);
    });

    this.input.keyboard.on('keyup-D', () => {
      this.rightFlipper.body.setAngularVelocity(-900);
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.rightFlipper.body.setAngularVelocity(900);
    });

    this.input.keyboard.on('keyup-RIGHT', () => {
      this.rightFlipper.body.setAngularVelocity(-900);
    });
  }

  update() {
    if (this.leftFlipper.rotation < -0.75) {
      this.leftFlipper.rotation = -0.75;
      this.leftFlipper.body.setAngularVelocity(0);
    }

    if (this.leftFlipper.rotation > 0) {
      this.leftFlipper.rotation = 0;
      this.leftFlipper.body.setAngularVelocity(0);
    }

    if (this.rightFlipper.rotation > 0.75) {
      this.rightFlipper.rotation = 0.75;
      this.rightFlipper.body.setAngularVelocity(0);
    }

    if (this.rightFlipper.rotation < 0) {
      this.rightFlipper.rotation = 0;
      this.rightFlipper.body.setAngularVelocity(0);
    }
  }
}
