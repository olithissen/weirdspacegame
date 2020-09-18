import { Button } from "./Button"
import { ButtonArray } from "./ButtonArray"

const headingConfig = {
    fontFamily: 'monospace',
    fontSize: 48,
    fontStyle: 'bold',
    color: '#ffffff',
    align: 'center'
};

const textConfig = {
    fontFamily: 'monospace',
    fontSize: 20,
    fontStyle: 'bold',
    color: '#ffffff',
    align: 'center'
};

export class SceneGameOver extends Phaser.Scene {
    title: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "SceneGameOver" });
    }

    preload() {
        this.load.svg('replay', 'assets/undo.svg', { width: 32, height: 32 });
        this.load.svg('random', 'assets/random.svg', { width: 32, height: 32 });
        this.load.svg('twitter', 'assets/twitter.svg', { width: 32, height: 32 });
    }

    create(data: { seed: string; time: string; }) {
        let tweet = `I survived @wrdgrvty level '${data.seed}' for ${data.time} seconds. Challenge me on ${window.location.href}`;
        let twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet);
        
        let replayButton = new Button(this, 0, 0, "replay", "replay").on('pointerup', function () {
            this.scene.transition({
                target: "SceneMain",
                duration: 0,
                moveAbove: true,
                sleep: false,
                data: data.seed
            });
        }, this);

        let randomButton = new Button(this, 0, 0, "random", "random").on('pointerup', function () {
            this.scene.transition({
                target: "SceneMain",
                duration: 0,
                moveAbove: true,
                sleep: false,
                data: new Phaser.Math.RandomDataGenerator().integer().toString(),
            });
        }, this);

        let twitterButton = new Button(this, 0, 0, "twitter", "tweet").on('pointerup', () => this.openExternalLink(twitterUrl), this);
        new ButtonArray(this, (this.game.config.width as number) * 0.5, 300, 64, [replayButton, randomButton, twitterButton]);

        this.title = this.add.text((this.game.config.width as number) * 0.5, 128, "WEIRD GRAVITY SPACE GAME", headingConfig);
        this.hint = this.add.text((this.game.config.width as number) * 0.5, 200, "Star system '" + decodeURIComponent(data.seed) + "':\nYou survived for " + data.time + " seconds\n\nPress any key to play again", textConfig);

        this.title.setOrigin(0.5);
        this.hint.setOrigin(0.5);
    }

    openExternalLink(url: string) {
        var s = window.open(url, '_blank');

        if (s && s.focus) {
            s.focus();
        }
        else if (!s) {
            window.location.href = url;
        }
    }
}