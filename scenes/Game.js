export default class Game extends Phaser.Scene {
  constructor() {
    super("main");
  }

  init() {
    this.gameOver = false;
    this.timer = 50;
    this.score = 0;
    this.shapes = {
      "triangulo": { points: 10, count: 0 },
      "cuadrado": { points: 20, count: 0 },
      "diamante": { points: 30, count: 0 }
    };
  }

  preload() {
    // Cargar assets
    this.load.image("cielo", "../public/assets/pizzeria.jpg");
    this.load.image("plataforma", "../public/assets/platform.png");
    this.load.image("personaje", "../public/assets/pizza1.webp");
    this.load.image("triangulo", "../public/assets/rucula.png");
    this.load.image("diamante", "../public/assets/cebolla.png");
    this.load.image("cuadrado", "../public/assets/champis.png");
  }

  create() {
    // Crear cielo y ajustarlo
    this.cielo = this.add.image(400, 300, "cielo");
    this.cielo.setScale(2);

    // Crear grupo de plataformas
    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(400, 568, "plataforma").setScale(2).refreshBody();
    this.plataformas.create(200, 400, "plataforma");

    // Crear personaje
    this.personaje = this.physics.add.sprite(400, 300, "personaje");
    this.personaje.setScale(0.1);
    this.personaje.setCollideWorldBounds(true);

    // Agregar colisión entre personaje y plataforma
    this.physics.add.collider(this.personaje, this.plataformas);

    // Crear teclas
    this.cursor = this.input.keyboard.createCursorKeys();

    // Crear grupo de recolectables
    this.recolectables = this.physics.add.group();
    this.physics.add.collider(this.personaje, this.recolectables, this.collectItem, null, this);

    this.physics.add.collider(this.plataformas, this.recolectables, this.Bounce, null, this);

    this.physics.add.collider(this.plataformas, this.recolectables, this.onRecolectableBounced, null, this);

    // Evento cada 1 segundo para crear recolectables
    this.time.addEvent({
      delay: 1000,
      callback: this.onSecond,
      callbackScope: this,
      loop: true,
    });

    // Tecla R para reiniciar
    this.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Timer cada 1 segundo
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Mostrar puntaje y tiempo restante
    this.scoreText = this.add.text(10, 50, `puntaje: ${this.score} / T: ${this.shapes["triangulo"].count} / C: ${this.shapes["cuadrado"].count} / D: ${this.shapes["diamante"].count}`);
    this.timerText = this.add.text(10, 10, `tiempo restante: ${this.timer}`, {
      fontSize: "32px",
      fill: "#fff",
    });


  }

  collectItem(personaje, recolectable) {
    const nombreFig = recolectable.texture.key;
    const puntosFig = this.shapes[nombreFig].points;
    this.score += puntosFig;
    this.shapes[nombreFig].count += 1;
    recolectable.destroy();

    this.scoreText.setText(
      `puntaje: ${this.score} / T: ${this.shapes["triangulo"].count} / C: ${this.shapes["cuadrado"].count} / D: ${this.shapes["diamante"].count}`
    );

    this.checkWin();
  }

  checkWin() {
    const cumplePuntos = this.score >= 100;
    const cumpleFiguras =
      this.shapes["triangulo"].count >= 2 &&
      this.shapes["cuadrado"].count >= 2 &&
      this.shapes["diamante"].count >= 2;

    if (cumplePuntos && cumpleFiguras) {
      console.log("Ganaste");
      this.scene.start("end", {
        score: this.score,
        gameOver: this.gameOver,
      });
    }
  }

  /*bounce(plataformas, recolectable) {
    recolectable.setVelocityY(-150);
    const nombreFig = recolectable.texture.key;
    recolectable.points -= 5;

    if (recolectable.points <= 0) {
      recolectable.destroy();
    }
  } */

  onSecond() {
    if (this.gameOver) {
      return;
    }

    const tipos = ["triangulo", "cuadrado", "diamante"];
    const tipo = Phaser.Math.RND.pick(tipos);

    let recolectable = this.recolectables.create(
      Phaser.Math.Between(15, 785),
      0,
      tipo
    );

    recolectable.setScale(0.25);
    recolectable.setBounce(1, 1);
    recolectable.setCollideWorldBounds(true);
    recolectable.setVelocity(0, 100);

    const nombreFig = recolectable.texture.key;
    recolectable.points = this.shapes[nombreFig].points;

    this.physics.add.collider(recolectable, this.recolectables);

  
    
    const rebote = Phaser.Math.FloatBetween(0.4, 0.8);
    
    recolectable.setBounceY(rebote);

    recolectable.setData("points", this.shapes[tipo].points);
    
  }

  onRecolectableBounced(recolectable, plataforma) {
    const points = recolectable.getData("points");
    points -= 5;

    if (points <= 0) {
      recolectable.destroy();
    }
    recolectable.setData("points", points)
  }

  updateTimer() {
    this.timer -= 1;
    this.timerText.setText(`tiempo restante: ${this.timer}`);
    if (this.timer === 0) {
      this.gameOver = true;
      this.scene.start("end", {
        score: this.score,
        gameOver: this.gameOver,
      });
    }
  }

  update() {
    if (this.cursor.left.isDown) {
      this.personaje.setVelocityX(-200);
    } else if (this.cursor.right.isDown) {
      this.personaje.setVelocityX(200);
    } else {
      this.personaje.setVelocityX(0);
    }

    if (this.cursor.up.isDown && this.personaje.body.touching.down) {
      this.personaje.setVelocityY(-300);
    }

    if (this.gameOver && this.r.isDown) {
      this.scene.restart();
      return;
    }

    if (this.gameOver) {
      this.physics.pause();
      this.timerText.setText("Game Over");
    }
  }
}