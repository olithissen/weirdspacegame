import { Button } from "./Button"
import { ButtonArray } from "./ButtonArray"

export class SceneMainMenu extends Phaser.Scene {
    title: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;
    constructor() {
        super({ key: "SceneMainMenu" });
    }

    preload() {
        this.load.svg('play', 'assets/play.svg', { width: 36, height: 36 });
        this.load.svg('github', 'assets/github.svg', { width: 48, height: 48 });
    }

    create() {
        const start = function (): void {
            this.scene.start("SceneMain");
        };

        let playButton = new Button(this, 0, 0, "play", "play").on('pointerup', start, this);
        let githubButton = new Button(this, 0, 0, "github", "github").on('pointerup', this.openExternal(), this);
        new ButtonArray(this, (this.game.config.width as number) * 0.5, 300, 64, [playButton, githubButton]);

        this.title = this.add.text((this.game.config.width as number) * 0.5, 128, "WEIRD GRAVITY SPACE GAME", {
            fontFamily: 'monospace',
            fontSize: 48,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });

        this.hint = this.add.text((this.game.config.width as number) * 0.5, 200, "Use arrow-keys for thrust\nHang in there while there is fuel left\nThings might explode\nPress any key to begin", {
            fontFamily: 'monospace',
            fontSize: 20,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });
        this.title.setOrigin(0.5);
        this.hint.setOrigin(0.5);

        this.input.keyboard.on('keydown', start, this);
    }
    
    private openExternal(): Function {
        return function () {
            let url = "https://github.com/olithissen/weirdspacegame";
            var s = window.open(url, '_blank');
            if (s && s.focus) {
                s.focus();
            }
            else if (!s) {
                window.location.href = url;
            }
        };
    }

    update() {
    }
}