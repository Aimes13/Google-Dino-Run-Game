function GameDesign(game) {
    this.color = "black";
    this.fontSize = 12;
    this.fontFamily = "Helvetica";

    this.game = game;

    this.x = this.game.width - 20;
    this.y = 20;
};

GameDesign.prototype.draw = function (context) {
    context.save();

    if (this.game.gameOver) {
        this.x = this.game.width / 2;
        this.y = this.game.height / 2;

        context.fillStyle = this.color;
        context.textAlign = "center";
        context.font = this.fontSize * 2 + "px " + this.fontFamily;
        context.fillText("Game Over", this.x, this.y);
        context.font = this.fontSize + "px " + this.fontFamily;
        context.fillText("score: " + this.game.time, this.x, this.y + 20);
    } else {
        context.fillStyle = this.color;
        context.textAlign = "right";
        context.font = this.fontSize + "px " + this.fontFamily;
        context.fillText(this.game.time, this.x, this.y);
        context.fillText("lv: " + this.game.level, this.x, this.y + 12);
    }

    context.restore();
};

function Player(game) {
    this.game = game;

    this.width = 40;
    this.height = 40;

    this.x = 40;
    this.y = game.height - this.height;
    //To move up and down (vertically)
    this.vertical = 0;
    this.jump = false;
};

Player.prototype.draw = function(context) {
        context.save();

        context.fillStyle = "black";
        context.fillRect(this.x, this.y, this.width, this.height);

        context.restore();
};

Player.prototype.update = function() {
        if (this.jump === true) {
            this.y += this.vertical;
            this.vertical += this.game.gravity;
            if (this.y > canvas.height - this.height) {
                this.y = canvas.height - this.height;
                this.vertical = 0;
                this.jump = false;
            }
        }
};

function PlayerEnemy(game, type) {
    this.game = game;

    this.type = type;
    this.markedForDeletion = false;

    this.width = 60;
    this.height = 40;

    this.x = this.game.width;
    if (this.type === "ground") {
        this.y = this.game.height - this.height;
    } else {
        this.y = 40;
    }

    //To move left and right (horizontally)
    this.horizontal = 7 * (this.game.level * 0.2 + 1);
};

PlayerEnemy.prototype.draw = function (context) {
    context.save();

    context.fillStyle = "red";
    context.fillRect(this.x, this.y, this.width, this.height);

    context.restore();
};

PlayerEnemy.prototype.update = function () {
    this.x -= this.horizontal;
    if (this.x + this.width < 0) {
        this.markedForDeletion = true;
    }
};

function Game(width, height) {
    this.width = width;
    this.height = height;

    this.time = 0;
    this.gravity = 1;
    this.level = 1;
    this.keys = [];

    this.gamedesign = new GameDesign(this);
    this.player = new Player(this);

    this.enemyTimer = Math.random() * 100;
    this.enemyRespawn = 100;
    this.enemies = [];

    this.gameRunning = false;
    this.gameOver = false;

    window.addEventListener('keydown', (e) => {
        if(e.keyCode == 38 || e.keyCode == 32) {
            if (this.player.vertical == 0) {
                this.player.vertical = -13;
                this.player.jump = true;
            }
        }
        if(e.keyCode == 40) {
            if (this.player.jump) {
                this.player.vertical = 10;
            }
        }
    });
};

Game.prototype.draw = function (context) {
    this.gamedesign.draw(context)
    this.player.draw(context)
    this.enemies.forEach(enemy => {
        enemy.draw(context);
    });
};

Game.prototype.update = function () {
    if (!this.gameOver) {
        //Level cap
        if(this.time > this.level * 300) {
            this.level++;
        }
        //Create player enemies
        if (this.enemyTimer < this.enemyRespawn) {
            this.enemyTimer++;
        } else {
            if (this.level < 3) {
                this.enemies.push(new PlayerEnemy(this, "ground"));
            } else if (Math.random() < 0.7) this.enemies.push(new PlayerEnemy(this, "ground"));
            else this.enemies.push(new PlayerEnemy(this, "air"));

            this.enemyTimer = Math.random() * 50 * (this.level * 0.1 + 1);
        }
        //Update game progress
        this.player.update();
        this.enemies.forEach(enemy => {
            enemy.update();
            if (this.checkCollision(this.player, enemy)) {
                this.gameOver = true;
            }
        });
        //Clear enemies
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        //Update game time
        this.time++;
    }
};

Game.prototype.checkCollision = function (object1, object2) {
    return (
        object1.x < object2.x + object2.width &&
        object1.x + object1.width > object2.x &&
        object1.y < object2.y + object2.height &&
        object1.height + object1.y > object2.y
    );
};

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 150;

ctx.save();

ctx.fillStyle = "black";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = `${24}px Helvetica`;
ctx.fillText(`Press \"Enter\" to play`, canvas.width / 2, canvas.height / 2);

ctx.restore();

let game = new Game(canvas.width, canvas.height);
let lastTime = 0;

const animate = (timeStamp) => {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!game.gameOver) requestAnimationFrame(animate);

    game.draw(ctx);
    game.update();
};

window.addEventListener('keydown', (e) => {
    if(e.keyCode == 13) { 
        if (game.gameRunning == false) {
            game.gameRunning = true;
            animate(0);
        } else if (game.gameOver) {
            console.log("gameOver = true");
            game = new Game(canvas.width, canvas.height);
            game.gameRunning = true;
            lastTime = 0;
            animate(0);
        }
    }

    if (e.keyCode === 27) {
        let userInput;
        do {
            userInput = prompt(`Do you want to exit the game? \n Respond with 'Y' or 'N'`);
            if (userInput === null) {
                return; // Exit if the user cancels the prompt
            }
            userInput = userInput.trim().toUpperCase();
        } while (userInput !== 'Y' && userInput !== 'N');
        
        if (userInput === 'Y') {
            window.location.reload();
        }
    }
});
