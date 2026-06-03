export default class PinballScene extends Phaser.Scene {
  constructor() {
    super('PinballScene');
  }

  create(data = {}) {
    this.level = data.level ?? 1;
    this.totalScore = data.totalScore ?? 0;
    this.levelConfig = this.getLevelConfig(this.level);

    this.physics.world.setBounds(0, 0, 480, 640);
    this.physics.world.setBoundsCollision(...this.levelConfig.boundsCollision);
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
    this.ball.body.setAllowGravity(false);

    this.ballsRemaining = 3;
    this.hitBumpers = new Set();
    this.isResetting = false;

    this.livesText = this.add.text(32, 24, 'Balls: 3', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });

    this.bumperText = this.add.text(32, 52, `Targets: 0/${this.levelConfig.targetCount}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });

    this.levelText = this.add.text(32, 80, `Level: ${this.level}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });

    this.scoreText = this.add.text(32, 108, `Total: ${this.totalScore}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });

    this.bumpers = this.levelConfig.movingTargets
      ? [
        this.createMovingTarget('T1', 130, 150, 70),
        this.createMovingTarget('T2', 300, 170, 90),
        this.createMovingTarget('T3', 170, 280, 80),
        this.createMovingTarget('T4', 330, 310, 65),
      ]
      : this.levelConfig.bumperPositions.map((position, index) => (
        this.createBumper(`B${index + 1}`, position.x, position.y)
      ));

    this.bumpers.forEach((target) => {
      this.physics.add.overlap(this.ball, target, () => {
        this.hitBumper(target);
      });
    });

    this.leftFlipper = this.add.rectangle(
      this.levelConfig.leftFlipperX,
      this.levelConfig.flipperY,
      96,
      16,
      0xeaac8b,
    );
    this.rightFlipper = this.add.rectangle(
      this.levelConfig.rightFlipperX,
      this.levelConfig.flipperY,
      96,
      16,
      0xeaac8b,
    );

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
    this.nudgeLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.nudgeRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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

      this.ball.body.setAllowGravity(true);
      this.ball.body.setVelocityX(this.levelConfig.launchVelocityX);
      this.ball.body.setVelocityY(-launchVelocity);
      this.hasLaunched = true;
      chargeStartTime = null;
    });

    this.input.keyboard.on('keydown-A', () => {
      this.leftFlipper.body.setAngularVelocity(this.levelConfig.leftFlipperActiveVelocity);
    });

    this.input.keyboard.on('keyup-A', () => {
      this.leftFlipper.body.setAngularVelocity(this.levelConfig.leftFlipperRestVelocity);
    });

    this.input.keyboard.on('keydown-LEFT', () => {
      this.leftFlipper.body.setAngularVelocity(this.levelConfig.leftFlipperActiveVelocity);
    });

    this.input.keyboard.on('keyup-LEFT', () => {
      this.leftFlipper.body.setAngularVelocity(this.levelConfig.leftFlipperRestVelocity);
    });

    this.input.keyboard.on('keydown-D', () => {
      this.rightFlipper.body.setAngularVelocity(this.levelConfig.rightFlipperActiveVelocity);
    });

    this.input.keyboard.on('keyup-D', () => {
      this.rightFlipper.body.setAngularVelocity(this.levelConfig.rightFlipperRestVelocity);
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.rightFlipper.body.setAngularVelocity(this.levelConfig.rightFlipperActiveVelocity);
    });

    this.input.keyboard.on('keyup-RIGHT', () => {
      this.rightFlipper.body.setAngularVelocity(this.levelConfig.rightFlipperRestVelocity);
    });
  }

  update() {
    if (!this.isResetting && this.isBallLost()) {
      this.loseBall();
    }

    if (this.levelConfig.nudgeEnabled && this.hasLaunched) {
      this.applyNudge();
    }

    if (this.leftFlipper.rotation < this.levelConfig.leftFlipperMinRotation) {
      this.leftFlipper.rotation = this.levelConfig.leftFlipperMinRotation;
      this.leftFlipper.body.setAngularVelocity(0);
    }

    if (this.leftFlipper.rotation > this.levelConfig.leftFlipperMaxRotation) {
      this.leftFlipper.rotation = this.levelConfig.leftFlipperMaxRotation;
      this.leftFlipper.body.setAngularVelocity(0);
    }

    if (this.rightFlipper.rotation > this.levelConfig.rightFlipperMaxRotation) {
      this.rightFlipper.rotation = this.levelConfig.rightFlipperMaxRotation;
      this.rightFlipper.body.setAngularVelocity(0);
    }

    if (this.rightFlipper.rotation < this.levelConfig.rightFlipperMinRotation) {
      this.rightFlipper.rotation = this.levelConfig.rightFlipperMinRotation;
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

  createMovingTarget(id, x, y, travelDistance) {
    const target = this.add.rectangle(x, y, 58, 28, 0xf6bd60);
    target.id = id;

    this.physics.add.existing(target, true);

    this.tweens.add({
      targets: target,
      x: x + travelDistance,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        target.body.updateFromGameObject();
      },
    });

    return target;
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
    this.bumperText.setText(`Targets: ${this.hitBumpers.size}/${this.bumpers.length}`);

    if (this.hitBumpers.size === this.bumpers.length) {
      const totalScore = this.totalScore + this.hitBumpers.size;

      this.scene.start('SummaryScene', {
        result: 'win',
        score: this.hitBumpers.size,
        totalScore,
        nextScene: this.level < 3 ? 'PinballScene' : 'GameOverScene',
        nextLevelData: {
          level: this.level + 1,
          totalScore,
          score: totalScore,
        },
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
        totalScore: this.totalScore + this.hitBumpers.size,
        nextScene: 'TitleScene',
        nextLevelData: { level: this.level },
      });
      return;
    }

    this.ball.body.reset(420, 560);
    this.ball.body.setVelocity(0, 0);
    this.ball.body.setAllowGravity(false);
    this.hasLaunched = false;
    this.isResetting = false;
  }

  isBallLost() {
    if (this.levelConfig.ballLostDirection === 'up') {
      return this.ball.y < this.levelConfig.ballLostY;
    }

    return this.ball.y > this.levelConfig.ballLostY;
  }

  applyNudge() {
    const velocityX = this.ball.body.velocity.x;
    const nudgeStrength = this.levelConfig.nudgeStrength;
    const maxNudgeVelocity = this.levelConfig.maxNudgeVelocity;

    if (this.nudgeLeftKey.isDown) {
      this.ball.body.setVelocityX(Math.max(velocityX - nudgeStrength, -maxNudgeVelocity));
    }

    if (this.nudgeRightKey.isDown) {
      this.ball.body.setVelocityX(Math.min(velocityX + nudgeStrength, maxNudgeVelocity));
    }
  }

  getLevelConfig(level) {
    const configs = {
      1: {
        gravityY: 980,
        boundsCollision: [true, true, true, false],
        targetCount: 5,
        movingTargets: false,
        bumperPositions: [
          { x: 150, y: 130 },
          { x: 300, y: 120 },
          { x: 235, y: 215 },
          { x: 120, y: 300 },
          { x: 340, y: 300 },
        ],
        leftFlipperX: 145,
        rightFlipperX: 385,
        flipperY: 520,
        launchVelocityX: -180,
        ballLostY: 620,
        ballLostDirection: 'down',
        leftFlipperActiveVelocity: -900,
        leftFlipperRestVelocity: 900,
        leftFlipperMinRotation: -0.75,
        leftFlipperMaxRotation: 0,
        rightFlipperActiveVelocity: 900,
        rightFlipperRestVelocity: -900,
        rightFlipperMinRotation: 0,
        rightFlipperMaxRotation: 0.75,
        nudgeEnabled: false,
        nudgeStrength: 0,
        maxNudgeVelocity: 0,
      },
      2: {
        gravityY: 200,
        boundsCollision: [true, true, true, false],
        targetCount: 4,
        movingTargets: true,
        bumperPositions: [],
        leftFlipperX: 145,
        rightFlipperX: 385,
        flipperY: 520,
        launchVelocityX: -180,
        ballLostY: 620,
        ballLostDirection: 'down',
        leftFlipperActiveVelocity: -900,
        leftFlipperRestVelocity: 900,
        leftFlipperMinRotation: -0.75,
        leftFlipperMaxRotation: 0,
        rightFlipperActiveVelocity: 900,
        rightFlipperRestVelocity: -900,
        rightFlipperMinRotation: 0,
        rightFlipperMaxRotation: 0.75,
        nudgeEnabled: true,
        nudgeStrength: 16,
        maxNudgeVelocity: 500,
      },
      3: {
        gravityY: -980,
        boundsCollision: [true, true, false, true],
        targetCount: 5,
        movingTargets: false,
        bumperPositions: [
          { x: 135, y: 430 },
          { x: 300, y: 425 },
          { x: 220, y: 500 },
          { x: 115, y: 570 },
          { x: 350, y: 565 },
        ],
        leftFlipperX: 145,
        rightFlipperX: 385,
        flipperY: 120,
        launchVelocityX: -180,
        ballLostY: 20,
        ballLostDirection: 'up',
        leftFlipperActiveVelocity: 900,
        leftFlipperRestVelocity: -900,
        leftFlipperMinRotation: 0,
        leftFlipperMaxRotation: 0.75,
        rightFlipperActiveVelocity: -900,
        rightFlipperRestVelocity: 900,
        rightFlipperMinRotation: -0.75,
        rightFlipperMaxRotation: 0,
        nudgeEnabled: false,
        nudgeStrength: 0,
        maxNudgeVelocity: 0,
      },
    };

    return configs[level] ?? configs[1];
  }
}
