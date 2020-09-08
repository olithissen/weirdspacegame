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

const linkConfig = {
    fontFamily: 'monospace',
    fontSize: 20,
    fontStyle: 'bold',
    color: '#ffff00',
    align: 'center'
};

export class SceneGameOver extends Phaser.Scene {
    title: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;
    twitter: Phaser.GameObjects.Text;
    randomSeed: Phaser.GameObjects.Text;
    constructor() {
        super({ key: "SceneGameOver" });
    }

    create(data: { seed: string; time: string; }) {
        let tweet = `I survived @wrdgrvty level '${data.seed}' for ${data.time} seconds. Challenge me on ${window.location.href}`;
        let twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet);

        this.title = this.add.text((this.game.config.width as number) * 0.5, 128, "WEIRD GRAVITY SPACE GAME", headingConfig);
        this.hint = this.add.text((this.game.config.width as number) * 0.5, 200, "Star system '" + decodeURIComponent(data.seed) + "':\nYou survived for " + data.time + " seconds\n\nPress any key to play again", textConfig);
        this.twitter = this.add.text((this.game.config.width as number) * 0.5, 300, "Or click here to brag about it on Twitter", linkConfig);
        this.randomSeed = this.add.text((this.game.config.width as number) * 0.5, 330, "Or click here to try a new level at random", linkConfig);

        this.title.setOrigin(0.5);
        this.hint.setOrigin(0.5);
        this.twitter.setOrigin(0.5);
        this.randomSeed.setOrigin(0.5);
        this.twitter.setInteractive();
        this.randomSeed.setInteractive();

        this.twitter.on('pointerup', function() {
            this.openExternalLink(twitterUrl);
        }, this);

        this.randomSeed.on('pointerup', function () {
            this.scene.transition({
                target: "SceneMain",
                duration: 0,
                moveAbove: true,
                sleep: false,
                data: new Phaser.Math.RandomDataGenerator().integer().toString(),
            });
        }, this);

        this.input.keyboard.on('keydown', function () {
            this.scene.transition({
                target: "SceneMain",
                duration: 0,
                moveAbove: true,
                sleep: false,
                data: data.seed,
            });
        }, this);
    }

    openExternalLink(url: string) {
        var s = window.open(url, '_blank');

        if (s && s.focus)
        {
            s.focus();
        }
        else if (!s)
        {
            window.location.href = url;
        }        
    }
}