function gameDesign(game) {
    this.color = "black";
    this.fontSize = 12;
    this.fontFamily = "Helvetica";

    this.game = game;

    this.x = this.game.width - 20;
    this.y = 20;
};

gameDesign.prototype.draw = function (context) {
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

function player(game) {
    this.game = game;

    this.width = 40;
    this.height = 40;

    this.x = 40;
    this.y = game.height - this.height;
    //To move up and down (vertically)
    this.vertical = 0;
    this.jump = false;
};

player.prototype.draw = function(context) {
        context.save();

        context.fillStyle = "black";
        context.fillRect(this.x, this.y, this.width, this.height);

        context.restore();
};

player.prototype.update = function() {
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

function playerEnemy(game, type) {
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
    this.horizontal = 7 * (this.game.lvl * 0.2 + 1);
};

playerEnemy.prototype.draw = function (context) {
    context.save();

    context.fillStyle = "red";
    context.fillRect(this.x, this.y, this.width, this.height);

    context.restore();
};

playerEnemy.prototype.update = function () {
    this.x -= this.horizontal;
    if (this.x + this.width < 0) {
        this.markedForDeletion = true;
    }
};

function game(width, height) {
    this.width = width;
    this.height = height;

    this.time = 0;
    this.gravity = 1;
    this.level = 1;
    this.keys = [];

    this.gamedesign = new gameDesign(this);
    this.player = new player(this);

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
            if (this.player.jump = true) {
                this.player.vertical = 10;
            }
        }
    });
};

game.prototype.draw = function (context) {
    this.gamedesign.draw(context)
    this.player.draw(context)
    this.enemies.forEach(enemy => {
        enemy.draw(context);
    });
};

game.prototype.update = function () {
    if (!this.gameOver) {
        //Level cap
        if(this.time > this.level * 500) {
            this.level++;
        }
        //Create player enemies
        if (this.enemyTimer < this.enemyRespawn) {
            this.enemyTimer++;
        } else {
            if (this.level < 3) {
                this.enemies.push(new playerEnemy(this, "ground"));
            } else if (Math.random() < 0.7) this.enemies.push(new playerEnemy(this, "ground"));
            else this.enemies.push(new playerEnemy(this, "air"));

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

game.prototype.checkCollision = function (object1, object2) {
    return (
        object1.x < object2.x + object2.width &&
        object1.x + object1.width > object2.x &&
        object1.y < object2.y + object2.height &&
        object1.height + object1.y > object2.y
    );
};

const canvas = document.querySelector("#canvas");
const contxt = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 150;

contxt.save();

contxt.fillStyle = "black";
contxt.textAlign = "center";
contxt.textBaseline = "middle";
contxt.font = `${24}px Helvetica`;
contxt.fillText(`Press \"Enter\" to play`, canvas.width / 2, canvas.height / 2);

contxt.restore();

let newGame = new game(canvas.width, canvas.height);
let lastTime = 0;

const animate = (timeStamp) => {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    contxt.clearRect(0, 0, canvas.width, canvas.height);

    if (!newGame.gameOver) requestAnimationFrame(animate);

    newGame.draw(contxt);
    newGame.update();
};

window.addEventListener('keydown', (e) => {
    if(e.keyCode == 13) { 
        if (newGame.gameRunning == false) {
            newGame.gameRunning = true;
            animate(0);
        } else if (newGame.gameOver) {
            console.log("gameOver = true");
            newGame = new game(canvas.width, canvas.height);
            newGame.gameRunning = true;
            lastTime = 0;
            animate(0);
        }
    }
});
