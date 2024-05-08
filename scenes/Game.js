// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("main");
  }

  init() {}

  preload() {
    //cargar assets

    //import cielo
    
    this.load.image("cielo", "../public/assets/Cielo.webp");
    
    //import plataforma
    
    this.load.image("plataforma", "../public/assets/platform.png");
   
    //import personaje
   
    this.load.image("personaje", "../public/assets/teemo.webp"); 

    //import recolectable

    this.load.image("triangulo", "../public/assets/triangle.png");
    this.load.image("diamante", "../public/assets/diamond.png");
    this.load.image("cuadrado", "../public/assets/square.png");

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

    //unma tecla a la vez

    //this.w = input.keyboard.addKey(Phaser.Input.Keyboard.Keycodes.W)
    //this.a = input.keyboard.addKey(Phaser.Input.Keyboard.Keycodes.A)
    //this.s = input.keyboard.addKey(Phaser.Input.Keyboard.Keycodes.S)
    //this.d = input.keyboard.addKey(Phaser.Input.Keyboard.Keycodes.D)

    // crear grupo de recolectables

    this.recolectables = this.physics.add.group();

    this.physics.add.collider(this.personaje, this.recolectables)

    this.physics.add.collider(this.personaje, this.recolectables, this.pj, null, this)

    this.physics.add.overlap(this.plataformas, this.recolectables, this.floor, null, this)


    //evento 1 seg

    this.time.addEvent({
      delay: 1000,
      callback: this.onSecond,
      callbackScope: this,
      loop: true,
    });

  }
  
  pj(personaje, recolectables){
    recolectables.destroy();
  }

  floor(plataformas, recolectables){
    recolectables.disableBody(true,true)
  }

  onSecond() {
    //crear recolectables

    const tipos = ["triangulo", "cuadrado", "diamante"];
    const tipo = Phaser.Math.RND.pick(tipos);

    let recolectable = this.recolectables.create(
      Phaser.Math.Between(10, 790),
      0,
      tipo
    );
    recolectable.setVelocity(0, 100);
    this.physics.add.collider(recolectable, this.recolectables)
  }

  update() {
    //movimineot personajae
    if (this.cursor.left.isDown) {
      this.personaje.setVelocityX(-160);
    } else if (this.cursor.right.isDown) {
      this.personaje.setVelocityX(160)
    } else if (this.cursor.up.isDown && this.personaje.body.touching.down) {
      this.personaje.setVelocityY(-330)
    } else {
      this.personaje.setVelocityX(0)
    }
    if (this.cursor.up.isDown && this.personaje.body.touching.down) {
      this.personaje.setVelocityY(-330)
    }
  }

}
