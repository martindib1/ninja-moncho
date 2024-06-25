export default class Game extends Phaser.Scene {
  constructor() {
    super("main");
  }

  init() {
    this.gameOver = false;
    this.timer = 25;
    this.score = 0;
    this.lastDirection = 'right'; // Nueva propiedad para rastrear la última dirección
    this.shapes = {
      "tomate": { points: 10, count: 0 },
      "champi": { points: 20, count: 0 },
      "cebolla": { points: 30, count: 0 },
      "anana": { points: -10, count: 0 }
    };
  }

  preload() {
    // Cargar assets
    this.load.image("cielo", "./public/tamaño fondo preuba.png");
    this.load.image("plataforma", "./public/plataforma.jpg");
    this.load.spritesheet("personaje", "./public/pj96x124.png", {
      frameWidth: 96,
      frameHeight: 124
    });
    this.load.image("tomate", "./public/tomate.png");
    this.load.image("cebolla", "./public/cebolla.png");
    this.load.image("champi", "./public/champis.png");
    this.load.image("anana", "./public/anana.png");
    this.load.image("bala", "./public/bombucha.png");
    this.load.audio('backmusic', ['./public/italiana.mp3']);
  }

  create() {
    // Crear grupo de balas
    this.balas = this.physics.add.group();

    // Evento para disparar al hacer click
    this.input.on('pointerdown', this.disparar, this);

    // Verificar si la música está sonando
    if (!this.backgroundMusic || !this.backgroundMusic.isPlaying) {
      // Agregar música de fondo
      this.backgroundMusic = this.sound.add('backmusic', { loop: true, volume: 0.2 });
      this.backgroundMusic.play();
    }

    // Crear cielo y ajustarlo
    this.cielo = this.add.image(600, 300, "cielo");

    // Crear grupo de plataformas
    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(400, 600, "plataforma").setScale(2).refreshBody();
    this.plataformas.create(1200, 600, "plataforma").setScale(2).refreshBody();

    // Crear personaje con sprite sheet
    this.personaje = this.physics.add.sprite(400, 300, "personaje").setScale(1);
    this.personaje.setCollideWorldBounds(true);

    // Definir animaciones del personaje
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('personaje', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turnLeft',
      frames: [{ key: 'personaje', frame: 9 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'turnRight',
      frames: [{ key: 'personaje', frame: 10 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('personaje', { start: 10, end: 19 }),
      frameRate: 10,
      repeat: -1
    });

    // Agregar colisión entre personaje y plataforma
    this.physics.add.collider(this.personaje, this.plataformas);

    // Crear teclas
    this.cursor = this.input.keyboard.createCursorKeys();

    // Crear grupo de recolectables
    this.recolectables = this.physics.add.group();
    this.physics.add.collider(this.recolectables, this.recolectables);
    this.physics.add.collider(this.personaje, this.recolectables, this.collectItem, null, this);
    this.physics.add.overlap(this.plataformas, this.recolectables, this.Bounce, null, this);
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
    this.scoreText = this.add.text(10, 50, `Puntaje: ${this.score} / T: ${this.shapes["tomate"].count} / H: ${this.shapes["champi"].count} / C: ${this.shapes["cebolla"].count} / A: ${this.shapes["anana"].count}`);
    this.timerText = this.add.text(10, 10, `Tiempo restante: ${this.timer}`, {
      fontSize: "32px",
      fill: "#fff",
    });
  }

  collectItem(personaje, recolectable) {
    const nombreFig = recolectable.texture.key;
    this.score += recolectable.getData("points");
    this.shapes[nombreFig].count += 1;
    recolectable.destroy();
    this.scoreText.setText(`Puntaje: ${this.score} / T: ${this.shapes["tomate"].count} / H: ${this.shapes["champi"].count} / C: ${this.shapes["cebolla"].count} / A: ${this.shapes["anana"].count}`);
    this.checkWin();
  }

  checkWin() {
    const cumplePuntos = this.score >= 100;
    const cumpleFiguras = this.shapes["tomate"].count >= 3 && this.shapes["champi"].count >= 3 && this.shapes["cebolla"].count >= 3;

    if (cumplePuntos && cumpleFiguras) {
      console.log("Ganaste");
      this.scene.start("end", {
        score: this.score,
        gameOver: this.gameOver,
      });
    }
  }

  onSecond() {
    if (this.gameOver) return;

    const tipos = ["tomate", "champi", "cebolla", "anana"];
    const tipo = Phaser.Math.RND.pick(tipos);

    let recolectable = this.recolectables.create(Phaser.Math.Between(15, 1150), 0, tipo);

    switch (tipo) {
      case "anana":
        recolectable.setScale(0.15);
        break;
      case "tomate":
        recolectable.setScale(0.03);
        break;
      case "champi":
        recolectable.setScale(0.2);
        break;
      case "cebolla":
        recolectable.setScale(0.25);
        break;
    }

    recolectable.setVelocity(0, 10); // Velocidad con la que caen los objetos
    const nombreFig = recolectable.texture.key;
    recolectable.points = this.shapes[nombreFig].points;
    this.physics.add.collider(recolectable, this.recolectables);
    const rebote = Phaser.Math.FloatBetween(0.4, 0.8);
    recolectable.setBounceY(rebote);
    recolectable.setData("points", this.shapes[tipo].points);
  }

  onRecolectableBounced(platforms, recolectable) {
    console.log("Recolectable rebote", recolectable);
    let points = recolectable.getData("points");
    points -= 5;
    console.log(points);
    recolectable.setData("points", points);
    if (points <= 0) {
      recolectable.destroy();
    }
  }

  disparar(pointer) {
    if (this.gameOver) return;

    // Crear bala en la posición del personaje
    let bala = this.balas.create(this.personaje.x, this.personaje.y, 'bala');
    this.physics.add.collider(bala, this.plataformas, this.destruirBala, null, this);
    this.physics.add.collider(bala, this.recolectables, this.destruirRecolectable, null, this);

    // Calcular dirección de la bala hacia el mouse
    let angle = Phaser.Math.Angle.Between(this.personaje.x, this.personaje.y, pointer.worldX, pointer.worldY);
    let velocity = this.physics.velocityFromRotation(angle, 600);
    bala.setVelocity(velocity.x, velocity.y);
  }

  destruirRecolectable(bala, recolectable) {
    bala.destroy();
    recolectable.destroy();
  }

  destruirBala(bala, plataformas) {
    bala.destroy();
  }

  updateTimer() {
    this.timer -= 1;
    this.timerText.setText(`Tiempo restante: ${this.timer}`);
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
      this.personaje.setVelocityX(-250);
      this.personaje.anims.play('left', true);
      this.lastDirection = 'left';
    } else if (this.cursor.right.isDown) {
      this.personaje.setVelocityX(250);
      this.personaje.anims.play('right', true);
      this.lastDirection = 'right';
    } else {
      this.personaje.setVelocityX(0);
      if (this.lastDirection === 'left') {
        this.personaje.anims.play('turnLeft');
      } else {
        this.personaje.anims.play('turnRight');
      }
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
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
      }
      this.backgroundMusic = this.sound.add('backmusic', { loop: true, volume: 0.2 });
      this.backgroundMusic.play();
    }
  }
}