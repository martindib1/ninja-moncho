export default class End extends Phaser.Scene {
    constructor() {
      super("end");
    }
    
    init(data) {
      console.log("data", data);
      this.score = data.score || 0;
      this.gameOver = data.gameOver;
      console.log(this.gameOver);
    }
  
    create() {
      // Tecla R para reiniciar
      this.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  
      this.add
        .text(400, 300, this.gameOver ? "Game Over" : "You Win", {
          fontSize: "40px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
  
      this.add.text(400, 350, `Score ${this.score}`, {
        fontSize: "32px",
        color: "#ffffff",
      }).setOrigin(0.5);
    }
  
    update() {
      if (this.r.isDown) {
        this.scene.start("main");
      }
    }
  }