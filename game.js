function gameDesign(game) {
    this.color = "black";
    this.fontSize = 12;
    this.fontFamily = "Helvetica";

    this.game = game;

    this.x = this.game.width - 20;
    this.y = 20;
}

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
        context.fillText("lv: " + this.game.lvl, this.x, this.y + 12);
    }

    context.restore();
};
