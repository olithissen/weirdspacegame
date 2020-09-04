import { Game } from "phaser";
import { game } from "./main";

class Planet extends Phaser.GameObjects.GameObject {
    constructor(scene: Phaser.Scene, x: number, y: number, mass: number, diameter: number, hasAtmosphere: boolean = false) {
        super(scene, "test");

        if (hasAtmosphere) {
            let atmosphere = scene.add.ellipse(x, y, 50, 50, 0x00ccff, 0.3);
            atmosphere.isFilled = true;
            atmosphere.isStroked = true;
            atmosphere.strokeColor = 0x00ccff;
        }

        let planet = scene.add.ellipse(x, y, 30, 30, 0x000000);
        planet.isStroked = true;
        planet.strokeColor = 0xffffff;

        this.scene.physics.world.enableBody(this, 0);

        scene.add.existing(this);
    }
}

const points: String = '0 5 5 0 0 -5 -5 0';
class BetterShip extends Phaser.GameObjects.Polygon {
    thrustValue: number;
    fuel: number;
    fuelConsumption: number;
    thrustVector: Phaser.Math.Vector2;
    gravityVector: Phaser.Math.Vector2;
    movementVector: Phaser.Math.Vector2;
    gravitySources: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, points, 0x222222);
        this.isFilled = true;
        this.isStroked = true;
        this.strokeColor = 0x00ff00;

        this.thrustValue = 2.01;
        this.fuel = 10.0;
        this.fuelConsumption = 0.1;

        this.thrustVector = new Phaser.Math.Vector2(0, 0);
        this.gravityVector = new Phaser.Math.Vector2(0, 0);
        this.movementVector = new Phaser.Math.Vector2(0, 0);

        scene.add.existing(this);

        this.scene.physics.world.enableBody(this, 0);
    }

    setGravitySources(gravitySources: Phaser.GameObjects.Group) {
        this.gravitySources = gravitySources;
    }

    update() {
        let f = this.gravityTotal(this.gravitySources, this);
        this.ship.vec.add(f);
        this.ship.pos.add(this.ship.vec);

    }

    gravityTotal(gravitySources: Phaser.GameObjects.Group, self: this) {
        let sum = new Phaser.Math.Vector2();
        gravitySources.getChildren()
            .map(obj => obj as Planet)
            .map((planet: Planet) => this.gravity(planet, ship))
            .forEach((gravity: Phaser.Math.Vector2) => {
                sum.add(gravity);
            });

        return sum;
    }

    gravity(planet: Planet, ship: { pos: Phaser.Math.Vector2; }) {
        let soVector = new Phaser.Math.Vector2(so.x, so.y);

        let distance = Phaser.Math.Distance.BetweenPoints(so, ship.pos);
        let r2 = Math.pow(distance, 2.0);
        let f = (this.G * so.mass) / r2;


        let v = soVector.subtract(ship.pos).normalize().scale(f);
        return v;
    }}

class FuelStats extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "10", { fontFamily: "Georgia" });
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
    gravitySources: Phaser.GameObjects.Group;
    gs: Planet;

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

        let earth     = new Planet(this, 300, 300, 5.97219E11, 12742E3, true);
        let earthMoon = new Planet(this, -100, 0, 7.342E9, 3474.2E3);

        this.gravitySources = this.add.group();
        this.gravitySources.addMultiple([earth, earthMoon]);

        this.planets = [planet, moon, { x: -50, y: -100, mass: 5E11 }];

        this.poly = new BetterShip(this, 50, 50);
        this.poly.setGravitySources(this.gravitySources);

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