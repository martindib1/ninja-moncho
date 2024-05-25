// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("main");
  }

  init() {
    this.gameOver = false;
    this.timer = 50;
    this.score = 0;
    this.shapes = {
      "triangulo": {points: 10, count: 0},
      "cuadrado": {points: 20, count: 0},
      "diamante": {points: 30, count: 0}
    }

    
  }

  preload() {
    //cargar assets

    //import cielo
    
    this.load.image("cielo", "../public/assets/pizzeria.jpg");
    
    //import plataforma
    
    this.load.image("plataforma", "../public/assets/platform.png");
   
    //import personaje
   
    this.load.image("personaje", "../public/assets/pizza1.webp"); 

    //import recolectable

    this.load.image("triangulo", "../public/assets/rucula.png");
    this.load.image("diamante", "../public/assets/cebolla.png");
    this.load.image("cuadrado", "../public/assets/champis.png");

  }

  create() {
    this.cielo = this.add.image(400, 300, "cielo")
    this.cielo.setScale(2);
    
    //crear grupo de plataformas
    
    this.plataformas = this.physics.add.staticGroup();

    // al grupo de plataformas agregar una plataforma

    this.plataformas.create(400, 568, "plataforma").setScale(2).refreshBody();

    // agregar una plataforma en otro lugar

    this.plataformas.create(200, 400, "plataforma")
    
    //crear personaje

    this.personaje = this.physics.add.sprite(400, 300, "personaje");
    this.personaje.setScale(0.1);
    this.personaje.setCollideWorldBounds(true);

    //agregar colision entre personaje y plataforma

    this.physics.add.collider(this.personaje, this.plataformas)

    //crear teclas

    this.cursor = this.input.keyboard.createCursorKeys();

    //una tecla a la vez

    //this.w = input.keyboard.addKey(Phaser.Input.Keyboard.Keycodes.W)
    //this.a = input.keyboard.addKey(Phaser.Input.Keyboard.Keycodes.A)
    //this.s = input.keyboard.addKey(Phaser.Input.Keyboard.Keycodes.S)
    //this.d = input.keyboard.addKey(Phaser.Input.Keyboard.Keycodes.D)

    // crear grupo de recolectables

    this.recolectables = this.physics.add.group();


    this.physics.add.collider(this.personaje, this.recolectables, this.pj, null, this)

    this.physics.add.overlap(this.plataformas, this.recolectables, this.floor, null, this)


    //evento 1 seg

    this.time.addEvent({
      delay: 1000,
      callback: this.onSecond,
      callbackScope: this,
      loop: true,
    });

    // tecla r

    this.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);


    //timer cada 1 seg

    this.time.addEvent({
      delay: 1000,
      callback: this.handlerTimer,
      callbackScope: this,
      loop: true,
    });

    // agregar el score arriba

    this.scoreText = this.add.text(10, 50, `puntaje: ${this.score} / T: ${this.shapes["triangulo"].count} / C: ${this.shapes["cuadrado"].count} / D: ${this.shapes["diamante"].count}`)

    //agregar texto de timer en la esquina superior

    this.timerText = this.add.text(10,10, `tiempo restante: ${this.timer}`,{

      fontSize: "32px",
      fill: "#fff",
    })
  }
  
  pj(personaje, recolectables){
    const nombreFig = recolectables.texture.key;
    const puntosFig = this.shapes[nombreFig].points;
    this.score += puntosFig;
    this.shapes [nombreFig].count += 1;
    console.table(this.shapes);
    console.log("score", this.score);
    recolectables.destroy();

    this.scoreText.setText(
      `puntaje: ${this.score} / T: ${this.shapes["triangulo"].count} / C: ${this.shapes["cuadrado"].count} / D: ${this.shapes["diamante"].count}`
    );

    this.checkWin();
    
  }

  checkWin(){
    const cumplePuntos = this.score >= 100;
    const cumpleFiguras = 
    this.shapes["triangulo"].count >= 2 &&
    this.shapes["cuadrado"].count >= 2 &&
    this.shapes["diamante"].count >= 2;

    if (cumplePuntos && cumpleFiguras) {
      console.log("Ganaste");
      this.scene.start("end",{
        score: this.score,
        gameOver: this.gameOver,
      })
    }
  }

  floor(plataformas, recolectables){
    recolectables.disableBody(true,true)
  }

  onSecond() {
    //crear recolectables
    if (this.gameOver) {
      return
    }

    const tipos = ["triangulo", "cuadrado", "diamante"];
    const tipo = Phaser.Math.RND.pick(tipos);

    let recolectable = this.recolectables.create(
      Phaser.Math.Between(15, 785),
      0,
      tipo
    );

    // Ajustar la escala del recolectable
    recolectable.setScale(0.25);

    recolectable.setVelocity(0, 100);
    this.physics.add.collider(recolectable, this.recolectables)
  }

  handlerTimer() {
    this.timer -= 1;
    this.timerText.setText(`tiempo restante: ${this.timer}`);
    if (this.timer === 0){
      this.gameOver = true;
      this.scene.start("end",{
        score: this.score,
        gameOver: this.gameOver,
      })
    }
  }

  update() {
    //movimineot personajae
    if (this.cursor.left.isDown) {
      this.personaje.setVelocityX(-200);
    } else if (this.cursor.right.isDown) {
      this.personaje.setVelocityX(200)
    } else if (this.cursor.up.isDown && this.personaje.body.touching.down) {
      this.personaje.setVelocityY(-300)
    } else {
      this.personaje.setVelocityX(0)
    }
    if (this.cursor.up.isDown && this.personaje.body.touching.down) {
      this.personaje.setVelocityY(-300)
    }

    

    if (this.gameOver && this.r.isDown) {
      this.scene.restart();
    return
    }
    if (this.gameOver) {
      this.physics.pause();
      this.timerText.setText("Game Over");

    }

    

  }

}
