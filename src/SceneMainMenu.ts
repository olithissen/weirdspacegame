export class SceneMainMenu extends Phaser.Scene {
    title: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;
    constructor() {
        super({ key: "SceneMainMenu" });
    }

    preload() {
    }

    create() {
        this.title = this.add.text((this.game.config.width as number)* 0.5, 128, "SOME WEIRD GRAVITY SPACE GAME", {
            fontFamily: 'monospace',
            fontSize: 48,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });

        this.hint = this.add.text((this.game.config.width as number) * 0.5, 200, "Use arrow-keys for thrust\nHang in there while there is fuel left\nPress any key to begin\n", {
            fontFamily: 'monospace',
            fontSize: 20,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });        
        this.title.setOrigin(0.5);
        this.hint.setOrigin(0.5);

        this.input.keyboard.on('keydown', function() {
            this.scene.start("SceneMain", 123);
        }, this);
    }
    update() {
    }
}