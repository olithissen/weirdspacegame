const points: String = '10 0 100 3 20 20 10 0';
class BetterShip extends Phaser.GameObjects.Polygon {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, points, 0xff0000);
        console.log(points);
        this.isStroked = true;
        this.isFilled = false;
        scene.add.existing(this);
    }
}

export class DemoScene extends Phaser.Scene {
    ship: BetterShip;
    constructor() {
        super({ key: "DemoScene" });
    }

    init(seed: number) {
        console.log(seed);
        
    }

    preload() {
    }

    create() {
        this.ship = new BetterShip(this, 40, 40);
    }

    update() {
        this.ship.update();
    }
}