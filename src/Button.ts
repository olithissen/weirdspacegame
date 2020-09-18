export class Button extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, icon: string, text: string) {
        super(scene, x, y, []);

        let i = scene.add.image(0, 0, icon);
        let f = new Phaser.GameObjects.Ellipse(scene, 0, 0, 64, 64, 0xffffff);

        let t = scene.add.text(0, 36, text, {
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0);

        this.add(f);
        this.add(i);
        this.add(t);

        this.setSize(64, 64);
        this.setInteractive();

        scene.add.existing(this);
    }
}
