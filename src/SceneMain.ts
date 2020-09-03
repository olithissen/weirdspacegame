import { Game } from "phaser";
import { game } from "./main";

// const points: String = '0 1 1 0 -1 -1 0 0 1';
const points: String = '0 5 5 0 0 -5 -5 0';
class BetterShip extends Phaser.GameObjects.Polygon {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, points, 0x222222);
        console.log(points);
        this.isStroked = true;
        this.strokeColor = 0x00ff00;
        this.isFilled = true;
        // scene.add.existing(this);
    }

    update() {
    }
}

class FuelStats extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "10", {fontFamily: "Georgia"});
        scene.add.existing(this);
    }
}

class Ship {
    pos: Phaser.Math.Vector2;
    vec: Phaser.Math.Vector2;
    thrust: Phaser.Math.Vector2;
    fuel: number = 10.0;

    constructor(pos: Phaser.Math.Vector2) {
        this.pos = pos;
        this.vec = new Phaser.Math.Vector2(0, 0);
    }
}

export class SceneMain extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    graphics: Phaser.GameObjects.Graphics;
    camera: Phaser.Cameras.Scene2D.Camera;
    planets: {
        x: number; y: number;
        mass: number;
        // diameter: number;
    }[];
    // ship: { pos: Phaser.Math.Vector2; vec: Phaser.Math.Vector2; thrust: Phaser.Math.Vector2; };
    ship: Ship;
    lineVector: Phaser.GameObjects.Line;
    lineVectorGravity: Phaser.GameObjects.Line;
    
    readonly G = 6.67408e-11;
    poly: BetterShip;
    fuelStats: FuelStats;

    constructor() {
        super({ key: "SceneMain" });
    }

    init(seed: number) {
        console.log(seed);
    }

    preload() {
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.graphics = this.add.graphics();
        this.camera = this.cameras.main;
        this.camera.centerOn(0, 0);
        this.camera.setZoom(1);

        this.fuelStats = new FuelStats(this, 10, 10);
        this.fuelStats

        const planet = {
            x: 0,
            y: 0,
            // mass: 5.97219E24,
            // diameter: 12742E3
            mass: 9E11
        }

        const moon = {
            x: 200,
            y: 200,
            // mass: 7.342E22,
            // diameter: 3474.2E3
            mass: 7E11            
        }

        this.planets = [planet, moon, { x: -50, y: -100, mass: 5E11 }];

        this.poly = new BetterShip(this, 50, 50);

        console.log(this);

        console.log(this.poly);

        this.ship = new Ship(new Phaser.Math.Vector2(-200, -200));

        this.lineVector = this.add.line(0, 0, 0, 0, 0, 0, 0x00ff00).setOrigin(0, 0);
        this.lineVectorGravity = this.add.line(0, 0, 0, 0, 0, 0, 0xff00ff).setOrigin(0, 0);

        this.cameras.main.centerOn(0, 0);
    }

    update() {
        if (this.cursors.left.isDown) {
            this.ship.vec.add(new Phaser.Math.Vector2(-0.01, 0));
            this.ship.fuel -= 0.01;
        }
        else if (this.cursors.right.isDown) {
            this.ship.vec.add(new Phaser.Math.Vector2(0.01, 0));
            this.ship.fuel -= 0.01;
        }

        if (this.cursors.up.isDown) {
            this.ship.vec.add(new Phaser.Math.Vector2(0, -0.01));
            this.ship.fuel -= 0.01;
        }
        else if (this.cursors.down.isDown) {
            this.ship.vec.add(new Phaser.Math.Vector2(0, 0.01));
            this.ship.fuel -= 0.01;
        }

        this.graphics.clear();
        this.graphics.fillStyle(0xffffff, 1);

        this.planets.forEach(body => {
            this.graphics.fillCircle(body.x, body.y, body.mass / 5e10);
        });


        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillCircle(this.ship.pos.x, this.ship.pos.y, 4);

        // f = gravity(planet, ship);
        let f = this.gravityTotal(this.planets, this.ship);
        this.ship.vec.add(f);
        this.ship.pos.add(this.ship.vec);
        this.drawLineVectors(this.ship, f);
        this.fuelStats.setText(this.ship.fuel.toString());
        this.poly.update();
    }

    drawLineVectors(ship: { pos: any; vec: any; thrust?: Phaser.Math.Vector2; }, gravity: Phaser.Math.Vector2) {
        let origin = ship.pos.clone();

        let vec = ship.vec.clone();
        let target = ship.pos.clone();
        target.add(vec.scale(30));
        this.lineVector.setTo(origin.x, origin.y, target.x, target.y);

        let targetGravity = ship.pos.clone();
        targetGravity.add(gravity.clone().scale(3000));
        this.lineVectorGravity.setTo(origin.x, origin.y, targetGravity.x, targetGravity.y);

    }

    gravityTotal(bodies: any[], ship: { pos: Phaser.Math.Vector2; vec: Phaser.Math.Vector2; thrust: Phaser.Math.Vector2; }) {
        let sum = new Phaser.Math.Vector2();
        bodies
            .map((body: any) => this.gravity(body, ship))
            .forEach((gravity: Phaser.Math.Vector2) => {
                sum.add(gravity);
            });

        return sum;
    }

    gravity(so: { x: any; y: any; mass?: any; }, ship: { pos: Phaser.Math.Vector2; }) {
        let soVector = new Phaser.Math.Vector2(so.x, so.y);

        let distance = Phaser.Math.Distance.BetweenPoints(so, ship.pos);
        let r2 = Math.pow(distance, 2.0);
        let f = (this.G * so.mass) / r2;
        

        let v = soVector.subtract(ship.pos).normalize().scale(f);
        return v;
    }
}