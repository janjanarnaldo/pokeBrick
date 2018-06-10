const game = new Phaser.Game(480, 320, Phaser.CANVAS, null, {
  preload: preload, create: create, update: update
});

let ball;
let paddle;
let bricks;
let newBrick;
let brickInfo;
let scoreText;
let score = 0;
let lives = 3;
let livesText;
let lifeLostText;
let isPlaying = false;
let startButton;
let isPaused = false;
let pausedText;

const textStyle = { font: '18px Arial', fill: '#0095DD' };
const enemies = ['bulba', 'mew', 'charmeleon', 'spearow', 'weedle'];

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#eee';
  game.load.image('paddle', 'img/paddle.png');
  game.load.image('ball', 'img/pokeball.png');
  game.load.spritesheet('button', 'img/button.png', 120, 40);

  enemies.forEach((name) => {
    game.load.image(name, `img/enemies/${name}.png`);
  });
}

function ballLeaveScreen() {
  lives--;
  isPlaying = false;
  if(lives) {
    livesText.setText('Lives: ' + lives);
    lifeLostText.visible = true;
    ball.reset(game.world.width * 0.5, game.world.height - 25);
    paddle.reset(game.world.width * 0.5, game.world.height - 5);
    game.input.onDown.addOnce(function() {
      lifeLostText.visible = false;
      ball.body.velocity.set(150, -150);
      isPlaying = true;
    }, this);
  } else {
    alert('You lost, game over!');
    location.reload();
  }
}

function create() {
  startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.55, 'button', startGame, this, 1, 0, 2);
  startButton.anchor.set(0.5);

  scoreText = game.add.text(5, 5, 'Points: 0', { ...textStyle });
  livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, { ...textStyle });
  livesText.anchor.set(1, 0);
  lifeLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.55, 'Life lost, click to continue', { ...textStyle });
  lifeLostText.anchor.set(0.5);
  lifeLostText.visible = false;

  pausedText = game.add.text(game.world.width * 0.5, game.world.height * 0.55, 'Paused, click to continue ', { ...textStyle });
  pausedText.anchor.set(0.5);
  pausedText.visible = false;

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;

  ball = game.add.sprite(game.world.width * 0.5, game.world.height - 25, 'ball');
  ball.anchor.set(0.5);

  ball.checkWorldBounds = true;
  ball.events.onOutOfBounds.add(ballLeaveScreen, this);

  paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
  paddle.anchor.set(0.5, 1);

  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  
  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);

  paddle.body.immovable = true;

  initBricks();

  game.input.onDown.add(pauseUnpause, this);
}

function pauseUnpause() {
  if (!isPlaying) return;

  isPaused = !isPaused;
  game.paused = isPaused;
  pausedText.visible = isPaused;
}

function update() {
  game.physics.arcade.collide(ball, paddle, ballHitPaddle);
  game.physics.arcade.collide(ball, bricks, ballHitBrick);
  if (isPlaying) {
    paddle.x = game.input.x || game.world.width * 0.5;
  }
}

function getRandomEnemy() {
  return Math.floor((Math.random() * enemies.length));
}

function initBricks() {
  brickInfo = {
    width: 50,
    height: 30,
    count: {
      row: 3,
      col: 7,
    },
    offset: {
      top: 50,
      left: 60,
    },
    padding: 10,
  };

  bricks = game.add.group();

  for (let c = 0; c < brickInfo.count.col; c++) {
    for (let r = 0; r < brickInfo.count.row; r++) {
      const brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
      const brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;

      newBrick = game.add.sprite(brickX, brickY, enemies[getRandomEnemy()]);
      game.physics.enable(newBrick, Phaser.Physics.ARCADE);
      newBrick.body.immovable = true;
      newBrick.anchor.set(0.5);
      bricks.add(newBrick);
    }
  }
}

function ballHitPaddle(ball, paddle) {
  ball.animations.play('wobble');
  ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);
}

function ballHitBrick(ball, brick) {
  ball.animations.play('wobble');
  const killTween = game.add.tween(brick.scale);
  killTween.to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None);
  killTween.onComplete.addOnce(() => {
    brick.kill();
  });
  killTween.start();
  score += 10;
  scoreText.setText('Points: ' + score);

  const alive_bricks = bricks.children.filter(o => o.alive);
  if (alive_bricks.length === 1) {
    alert('You won the game, congratulations!');
    location.reload();
  }
}

function startGame() {
  startButton.destroy();
  ball.body.velocity.set(150, -150);
  isPlaying = true;
}