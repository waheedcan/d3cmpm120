export default class PinballScene extends Phaser.Scene {
  constructor() {
    super('PinballScene');
  }

  create(data) {
    this.level = data.level ?? 1;
    this.levelConfig = this.getLevelConfig(this.level);

    this.physics.world.setBounds(0, 0, 480, 640);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.physics.world.gravity.y = this.levelConfig.gravityY;

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

    this.ballsRemaining = 3;
    this.hitBumpers = new Set();
    this.isResetting = false;

    this.livesText = this.add.text(32, 24, 'Balls: 3', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });

    this.bumperText = this.add.text(32, 52, 'Bumpers: 0/5', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });

    this.levelText = this.add.text(32, 80, `Level: ${this.level}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });

    this.bumpers = [
      this.createBumper('B1', 150, 130),
      this.createBumper('B2', 300, 120),
      this.createBumper('B3', 235, 215),
      this.createBumper('B4', 120, 300),
      this.createBumper('B5', 340, 300),
    ];

    this.bumpers.forEach((bumper) => {
      this.physics.add.overlap(this.ball, bumper, () => {
        this.hitBumper(bumper);
      });
    });

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

    this.physics.add.collider(this.ball, [leftWall, rightWall, this.leftFlipper, this.rightFlipper]);

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
    if (!this.isResetting && this.ball.y > 620) {
      this.loseBall();
    }

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

  createBumper(id, x, y) {
    const bumper = this.add.circle(x, y, 24, 0xf6bd60);
    bumper.id = id;

    this.physics.add.existing(bumper, true);
    bumper.body.setCircle(24);

    return bumper;
  }

  hitBumper(bumper) {
    const angle = Phaser.Math.Angle.Between(bumper.x, bumper.y, this.ball.x, this.ball.y);
    const impulseStrength = 520;

    this.ball.body.setVelocity(
      Math.cos(angle) * impulseStrength,
      Math.sin(angle) * impulseStrength,
    );

    if (this.hitBumpers.has(bumper.id)) {
      return;
    }

    this.hitBumpers.add(bumper.id);
    bumper.setFillStyle(0x84a59d);
    this.bumperText.setText(`Bumpers: ${this.hitBumpers.size}/5`);

    if (this.hitBumpers.size === this.bumpers.length) {
      this.scene.start('SummaryScene', {
        result: 'win',
        score: this.hitBumpers.size,
        nextScene: this.level < 3 ? 'PinballScene' : 'GameOverScene',
        nextLevelData: { level: this.level + 1 },
      });
    }
  }

  loseBall() {
    this.isResetting = true;
    this.ballsRemaining -= 1;
    this.livesText.setText(`Balls: ${this.ballsRemaining}`);

    if (this.ballsRemaining <= 0) {
      this.scene.start('SummaryScene', {
        result: 'lose',
        score: this.hitBumpers.size,
        nextScene: 'TitleScene',
        nextLevelData: { level: this.level },
      });
      return;
    }

    this.ball.body.reset(420, 560);
    this.ball.body.setVelocity(0, 0);
    this.hasLaunched = false;
    this.isResetting = false;
  }

  getLevelConfig(level) {
    const configs = {
      1: {
        gravityY: 980,
      },
      2: {
        gravityY: 200,
      },
      3: {
        gravityY: -980,
      },
    };

    return configs[level] ?? configs[1];
  }
}
