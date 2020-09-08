export class SceneMainMenu extends Phaser.Scene {
    title: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;
    github: Phaser.GameObjects.Text;
    constructor() {
        super({ key: "SceneMainMenu" });
    }

    preload() {
    }

    create() {
        this.github = this.add.text((this.game.config.width as number) * 0.5, 80, "Fork me on GitHub", {
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#cccccc',
            align: 'center'
        });

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
        this.github.setOrigin(0.5);
        this.github.setInteractive();

        this.github.on('pointerup', function () {
            let url = "https://github.com/olithissen/weirdspacegame";
            var s = window.open(url, '_blank');
            if (s && s.focus) {
                s.focus();
            }
            else if (!s) {
                window.location.href = url;
            }
        }, this);

this.input.keyboard.on('keydown', function () {
    this.scene.start("SceneMain");
}, this);
    }
update() {
}
}