export default class Game extends Phaser.Scene {
  constructor() {
    super("main");
  }

  init() {
    this.gameOver = false;
    this.timer = 25;
    this.score = 0;
    this.shapes = {
      "triangulo": { points: 10, count: 0 },
      "cuadrado": { points: 20, count: 0 },
      "diamante": { points: 30, count: 0 },
      "bomb": { points: -10, count: 0 }
    };
  }

  preload() {
    // Cargar assets
    this.load.image("cielo", "./public/pizzeria.jpg");
    this.load.image("plataforma", "./public/plataforma1.jpg");
    this.load.image("personaje", "./public/pizza1.webp");
    this.load.image("triangulo", "./public/rucula.png");
    this.load.image("diamante", "./public/cebolla.png");
    this.load.image("cuadrado", "./public/champis.png");
    this.load.image("bomb", "./public/anana.png");
    this.load.audio('backmusic', ['./public/italiana.mp3']);
  }

  create() {
  //verificar si la musica esta sonando
  if (!this.backgroundMusic || !this.backgroundMusic.isPlaying) {

    // Agregar música de fondo
    this.backgroundMusic = this.sound.add('backmusic', { loop: true, volume: 0.2 });
    this.backgroundMusic.play();
}

    // Crear cielo y ajustarlo
    this.cielo = this.add.image(400, 300, "cielo");
    this.cielo.setScale(2);

    // Crear grupo de plataformas
    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(400, 568, "plataforma").setScale(2).refreshBody();
    this.plataformas.create(50, 400, "plataforma");
    this.plataformas.create(800, 400, "plataforma");

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
    this.physics.add.collider(this.recolectables, this.recolectables)
  
    this.physics.add.collider(this.personaje, this.recolectables, this.collectItem, null, this)
    
    this.physics.add.overlap(this.plataformas, this.recolectables, this.Bounce, null, this)
  
    //colision para el bounce

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
    /*const puntosFig = this.shapes[nombreFig].points;*/
    this.score += recolectable.getData("points");
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

  onSecond() {
    if (this.gameOver) {
      return;
    }

    const tipos = ["triangulo", "cuadrado", "diamante","bomb"];
    const tipo = Phaser.Math.RND.pick(tipos);

    let recolectable = this.recolectables.create(
      Phaser.Math.Between(15, 785),
      0,
      tipo
    );

    if(tipo=="bomb"){ //anana
      recolectable.setScale(0.15)
    }
    if(tipo=="triangulo"){ //rucula
      recolectable.setScale(0.15)
    }
    if(tipo=="cuadrado"){ //champi
      recolectable.setScale(0.2)
    }
    if(tipo=="diamante"){ //cebolla
      recolectable.setScale(0.25)
    }
    
    recolectable.setVelocity(0, 100);

    const nombreFig = recolectable.texture.key;
    recolectable.points = this.shapes[nombreFig].points;

    this.physics.add.collider(recolectable, this.recolectables);

  
    
    const rebote = Phaser.Math.FloatBetween(0.4, 0.8);
    
    recolectable.setBounceY(rebote);

    recolectable.setData("points", this.shapes[tipo].points);
    
  }

  onRecolectableBounced(platforms, recolectable) {
    console.log("recolectable rebote",recolectable);
    let points = recolectable.getData("points");
    points -= 5;
    console.log(points)
    recolectable.setData("points", points);
    if (points <= 0) {
      recolectable.destroy();
    }
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
    // Reiniciar la música al presionar la tecla "R"
    if (Phaser.Input.Keyboard.JustDown(this.r)) {
    // Detener la música actual
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
     }
      
   // Volver a agregar y reproducir la música
    this.backgroundMusic = this.sound.add('backmusic', { loop: true, volume: 0.2 });
   this.backgroundMusic.play();
    }
      
    
  }
}