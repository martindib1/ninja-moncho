export default class Menu extends Phaser.Scene {
    constructor() {
      super("menu");
    }
  
    create() {
      // Fondo del menú
      this.add.image(600, 300, "cielo");
  
      // Texto de bienvenida
      this.add.text(555, 300, "¡Bienvenido!\nToca para comenzar", {
        fontSize: "32px",
        fill: "#000000",
        align: "center",
      }).setOrigin(0.5);
  
      // Agregar evento de click/touch para comenzar el juego
      this.input.on('pointerdown', () => {
        this.scene.start('main');
      });
    }
  }