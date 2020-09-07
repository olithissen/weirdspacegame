import { game } from "./main";
import { SceneMain } from "./SceneMain";

export class SceneGameOver extends Phaser.Scene {
    title: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;
    constructor() {
        super({ key: "SceneGameOver" });
    }

    preload() {
    }

    create(data) {
        this.title = this.add.text((this.game.config.width as number) * 0.5, 128, "WEIRD GRAVITY SPACE GAME", {
            fontFamily: 'monospace',
            fontSize: 48,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });

        this.hint = this.add.text((this.game.config.width as number) * 0.5, 200, "Star system '" + decodeURIComponent(data.seed) + "':\nYou survived for " + data.time + " seconds\n\nPress any key to play again", {
            fontFamily: 'monospace',
            fontSize: 20,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });
        this.title.setOrigin(0.5);
        this.hint.setOrigin(0.5);

        this.input.keyboard.on('keydown', function () {
            this.scene.transition({
                target: "SceneMain",
                duration: 0,
                moveAbove: true,
                sleep: false,
            });
        }, this);
    }
    update() {
    }
}