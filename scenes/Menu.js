export default class Menu extends Phaser.Scene {
    constructor() {
      super("menu");
    }
  
    preload() {
      // Cargar assets
      this.load.image("cielo", "./public/fondo.png");
      this.load.image("boton", "./public/boton.png"); // Cargar la imagen del botón
    }
  
    create() {
      // Fondo del menú
      this.add.image(600, 300, "cielo");
  
      // Botón para comenzar el juego
      const boton = this.add.image(600, 400, "boton").setScale(0.2).setInteractive();
  
      // Texto de bienvenida
      this.add.text(600, 300, "¡Bienvenido!", {
        fontSize: "32px",
        fill: "#000000",
        align: "center",
      }).setOrigin(0.5);
  
      // Texto en el botón
      this.add.text(boton.x, boton.y, "." , {
        fontSize: "24px",
        fill: "#ffffff",
        align: "center",
      }).setOrigin(0.5);
  
      // Agregar evento al botón para comenzar el juego
      boton.on('pointerdown', () => {
        this.scene.start('main');
      });
    }
  }