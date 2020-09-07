import { Tilemaps } from "phaser";

const G = 6.67408e-11;
const zeroVector = new Phaser.Math.Vector2(0, 0);

class Asteroid extends Phaser.GameObjects.Polygon {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "0 2 0 1 6 8 8 2 1 0");
        this.isFilled = false;
        this.isStroked = true;
        this.strokeColor = 0x444444;

        this.scene.add.tween({
            targets: this,
            angle: 360 * new Phaser.Math.RandomDataGenerator().sign(),
            duration: Phaser.Math.Between(2000, 10000),
            repeat: -1,
        });

        scene.add.existing(this);
    }
}

class AsteroidBelt extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, count: number, color: number, radius: { min: number, max: number }) {
        super(scene, 0, 0, []);

        let rnd = new Phaser.Math.RandomDataGenerator();

        for (let i = 0; i < count; i++) {
            let vector = new Phaser.Math.Vector2();
            vector.setToPolar(rnd.rotation(), rnd.between(radius.min, radius.max));
            let asteroid = new Asteroid(scene, vector.x, vector.y);
            asteroid.strokeColor = color;
        }

        this.scene.add.tween({
            targets: this,
            angle: 360,
            duration: 3000,
            repeat: -1,
        });

        scene.add.existing(this);
    }
}

class Planet extends Phaser.GameObjects.Ellipse {
    mass: number;
    x: number;
    y: number;
    diameter: number;

    constructor(scene: Phaser.Scene, x: number, y: number, mass: number, diameter: number, hasAtmosphere: boolean = false) {
        super(scene);

        this.mass = mass;
        this.diameter = diameter;

        if (hasAtmosphere) {
            let atmosphere = scene.add.ellipse(x, y, 50, 50, 0x00ccff, 0.3);
            atmosphere.isFilled = true;
            atmosphere.isStroked = true;
            atmosphere.strokeColor = 0x00ccff;
        }

        let planet = scene.add.ellipse(x, y, diameter, diameter, 0x000000);
        planet.isStroked = true;
        planet.strokeColor = 0xffffff;

        this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.STATIC_BODY);
        this.body.position.x = x;
        this.body.position.y = y;

        scene.add.existing(this);
    }
}

class GravityCalculator {
    static gravityTotal(gravitySources: Phaser.GameObjects.Group, position: Phaser.Math.Vector2) {
        let totalGravityVector = new Phaser.Math.Vector2();
        gravitySources.getChildren()
            .map(obj => obj as Planet)
            .map((planet: Planet) => this.gravity(planet, position))
            .forEach((gravityVector: Phaser.Math.Vector2) => {
                totalGravityVector.add(gravityVector);
            });

        return totalGravityVector;
    }

    static gravity(planet: Planet, position: Phaser.Math.Vector2) {
        let distance = Phaser.Math.Distance.BetweenPoints(planet.body.position, position);
        let gravitationalForce = (G * planet.mass) / Math.pow(distance, 2.0);

        let gravityVector = (planet.body.position as Phaser.Math.Vector2).clone().subtract(position).normalize().scale(gravitationalForce);
        return gravityVector;
    }
}

class GravityGrid extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, gravitySources: Phaser.GameObjects.Group) {
        super(scene, 0, 0, []);

        let gravityVectors = [];

        for (let i = -700; i < 700; i += 5) {
            for (let j = -700; j < 700; j += 5) {
                let position = new Phaser.Math.Vector2(i, j);
                let gravityVector = GravityCalculator.gravityTotal(gravitySources, position);
                gravityVectors.push({ pos: position, vec: gravityVector });
            }
        }

        gravityVectors = gravityVectors.filter(item => zeroVector.clone().add(item.pos).length() < 530);

        let lengths = gravityVectors.map(entry => entry.vec.length());

        gravityVectors.forEach(item => {
            let dot = scene.add.polygon(item.pos.x, item.pos.y, "0 0 0 5 5 5 5 0", 0xffffff);
            dot.isFilled = true;
            dot.setDepth(-10);
            let x = item.vec.length();
            let y = 1 + 239 * Math.exp(-32.79239 * x);
            dot.fillColor = (Phaser.Display.Color.HSVToRGB(y / 360, 1, 1) as Phaser.Display.Color).color;
        })

        scene.add.existing(this);
    }
}

const points: String = '5 5 5 -5 -5 -5 -5 5';
class BetterShip extends Phaser.GameObjects.Container {
    thrustValue: number = 0.02;
    fuel: number = 10;
    fuelConsumption: number = 2;
    thrustVector: Phaser.Math.Vector2;
    gravityVector: Phaser.Math.Vector2;
    movementVector: Phaser.Math.Vector2;
    gravitySources: Phaser.GameObjects.Group;
    radius: number = 5;
    alive: boolean = true;

    lineGravityVector: Phaser.GameObjects.Line;
    lineMovementVector: Phaser.GameObjects.Line;
    lineThrustVector: Phaser.GameObjects.Line;

    thrusterUp: boolean;
    thrusterDown: boolean;
    thrusterLeft: boolean;
    thrusterRight: boolean;

    polyThruster: Phaser.GameObjects.Triangle;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, []);

        let poly = new Phaser.GameObjects.Polygon(scene, 5, 5, points, 0x222222);
        poly.isFilled = true;
        poly.isStroked = true;
        poly.strokeColor = 0x00ff00;

        this.add(poly);

        this.thrustVector = new Phaser.Math.Vector2(0, 0);
        this.gravityVector = new Phaser.Math.Vector2(0, 0);
        this.movementVector = new Phaser.Math.Vector2(0, 0);

        this.lineMovementVector = new Phaser.GameObjects.Line(scene, 0, 0, 0, 0, 0, 0, 0x00ff00).setOrigin(0, 0);
        this.lineGravityVector = new Phaser.GameObjects.Line(scene, 0, 0, 0, 0, 0, 0, 0xff00ff).setOrigin(0, 0);
        this.lineThrustVector = new Phaser.GameObjects.Line(scene, 0, 0, 0, 0, 0, 0, 0xffff00).setOrigin(0, 0);

        this.polyThruster = new Phaser.GameObjects.Triangle(scene, 0, 0, 0, 10, 10, 10, 5, -10, 0x222222);
        this.polyThruster.isStroked = true;
        this.polyThruster.strokeColor = 0xffff00;
        this.polyThruster.visible = false;
        
        var tween = scene.tweens.add({
            targets: this.polyThruster,
            scaleY: 0.9,
            ease: 'Cubic',
            duration: 150,
            repeat: -1,
            yoyo: false
        });
        
        this.add([poly, this.polyThruster,this.lineMovementVector, this.lineGravityVector, this.lineThrustVector]);
        this.bringToTop(poly);

        scene.add.existing(this);

        this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.position.x = x;
        this.body.position.y = y;
    }

    update() {
        if (this.alive) {
            this.gravityVector = GravityCalculator.gravityTotal(this.gravitySources, this.body.position as Phaser.Math.Vector2);
            this.thrustVector = this.thrust();
            this.movementVector.add(this.gravityVector).add(this.thrustVector);
            this.body.position.x += this.movementVector.x;
            this.body.position.y += this.movementVector.y;
            // this.drawVectorLines();
        }
    }

    thrusters(up: boolean, down: boolean, left: boolean, right: boolean) {
        this.thrusterUp = up;
        this.thrusterDown = down;
        this.thrusterLeft = left;
        this.thrusterRight = right;
    }

    thrust() {
        let localThrustVector = new Phaser.Math.Vector2(0, 0);

        if (this.fuel > 0) {
            if (this.thrusterUp) {
                localThrustVector.add(new Phaser.Math.Vector2(0, -this.thrustValue));
            }
            if (this.thrusterDown) {
                localThrustVector.add(new Phaser.Math.Vector2(0, this.thrustValue));
            }
            if (this.thrusterRight) {
                localThrustVector.add(new Phaser.Math.Vector2(this.thrustValue, 0));
            }
            if (this.thrusterLeft) {
                localThrustVector.add(new Phaser.Math.Vector2(-this.thrustValue, 0));
            }

            this.fuel -= localThrustVector.length() * this.fuelConsumption;
            this.fuel = Phaser.Math.Clamp(this.fuel, 0, 10);
            
        }
        
        if (localThrustVector.length() > 0) {
            this.polyThruster.visible = true;
            this.polyThruster.setRotation(localThrustVector.angle() + 3 * Math.PI / 2);
        } else {
            this.polyThruster.visible = false;
        }

    return localThrustVector;
    }

    drawVectorLines() {
        // let pos = new Phaser.Math.Vector2(this.body.position.x, this.body.position.y);  
        let pos = new Phaser.Math.Vector2(0, 0);
        let movementTarget = pos.clone().add(this.movementVector.clone().scale(30));
        this.lineMovementVector.setTo(pos.x, pos.y, movementTarget.x, movementTarget.y);

        let gravityTarget = pos.clone().add(this.gravityVector.clone().scale(1000));
        this.lineGravityVector.setTo(pos.x, pos.y, gravityTarget.x, gravityTarget.y);

        let thrustTarget = pos.clone().add(this.thrustVector.clone().scale(1000));
        this.lineThrustVector.setTo(pos.x, pos.y, thrustTarget.x, thrustTarget.y);
    }

    destroy() {
        this.visible = false;
        this.lineGravityVector.visible = false;
        this.lineMovementVector.visible = false;
        this.lineThrustVector.visible = false

        let debrisParticles = this.scene.add.particles('red');
        debrisParticles.setPosition(this.body.position.x, this.body.position.y);

        let explosionParticles = this.scene.add.particles('blue');
        explosionParticles.setPosition(this.body.position.x, this.body.position.y);

        let angle: number = Phaser.Math.RadToDeg(this.movementVector.angle());
        let speed: number = this.movementVector.length() * 30;

        var debrisEmitter = debrisParticles.createEmitter({
            lifespan: { min: 200, max: 2000 },
            maxParticles: 30,
            speed: { min: speed * 0.1, max: speed },
            angle: { min: angle - 30, max: angle + 30 },
            scale: { start: 0.2, end: 0 },
            quantity: 30,
            blendMode: 'ADD'
        });

        var explosionEmitter = explosionParticles.createEmitter({
            lifespan: 2000,
            maxParticles: 1,
            speed: 0,
            angle: 0,
            scale: { start: 0.8, end: 0 },
            quantity: 1,
            blendMode: 'ADD'
        });

        debrisEmitter.start();
        explosionEmitter.start();
        this.alive = false;
    }
}

class GameCreator {
    scene: SceneMain;
    rnd: Phaser.Math.RandomDataGenerator;
    shipPosition: Phaser.Math.Vector2;
    planets: Planet[] = [];
    generated: boolean = false;

    constructor(scene: SceneMain, seed: string) {
        this.scene = scene;
        this.rnd = new Phaser.Math.RandomDataGenerator([seed]);
    }

    generate() {
        let numberOfPlanets = this.rnd.between(2, 7);

        for (let i = 0; i < numberOfPlanets; i++) {
            let position = new Phaser.Math.Vector2();
            position.setToPolar(this.rnd.rotation(), this.rnd.between(0, 450));
            let diameter = this.rnd.realInRange(10, 100);
            let mass = (49E10 * diameter) / 9 - 4E12 / 9;
            let planet = new Planet(this.scene, position.x, position.y, mass, diameter);
            this.planets.push(planet);
        }

        this.generated = true;
    }

    getPlanets(): Planet[] {
        if (!this.generated) {
            this.generate();
        }

        return this.planets;
    }

    getShipPosition(): Phaser.Math.Vector2 {
        if (!this.generated) {
            this.generate();
        }

        let position = new Phaser.Math.Vector2();
        position.setToPolar(this.rnd.rotation(), this.rnd.between(0, 450));

        return position;
    }
}

export class SceneMain extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    camera: Phaser.Cameras.Scene2D.Camera;

    myShip: BetterShip;
    gravitySources: Phaser.GameObjects.Group;
    timeText: Phaser.GameObjects.Text;
    startTime: number;
    fuelText: Phaser.GameObjects.Text;
    seedText: Phaser.GameObjects.Text;
    totalTime: number;
    seed: string;
    pointer: Phaser.Input.Pointer;

    constructor() {
        super({ key: "SceneMain" });
    }

    init() {
        let seed = window.location.search.substr(1);
        if (seed.length == 0) {
            seed = "1";
        }
        this.seed = seed;
    }

    preload() {
        this.load.setBaseURL('https://labs.phaser.io');
        this.load.image('red', 'assets/particles/red.png');
        this.load.image('blue', 'assets/particles/blue.png');
    }

    create() {
        this.totalTime = 0;

        this.seedText = this.add.text(5, 5, "Star System: " + decodeURIComponent(this.seed));
        this.seedText.setScrollFactor(0, 0);

        this.timeText = this.add.text(5, 25, "Time:");
        this.timeText.setScrollFactor(0, 0);

        this.fuelText = this.add.text(5, 45, "Fuel left:");
        this.fuelText.setScrollFactor(0, 0);

        new AsteroidBelt(this, 350, 0x777777, { min: 500, max: 600 });
        new AsteroidBelt(this, 600, 0x444444, { min: 530, max: 1000 });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.camera = this.cameras.main;
        this.camera.centerOn(0, 0);
        this.camera.setZoom(1);

        this.gravitySources = this.add.group();

        let generator = new GameCreator(this, this.seed);
        generator.generate()

        this.gravitySources.addMultiple(generator.getPlanets());

        // new GravityGrid(this, this.gravitySources);

        let shipPosition = generator.getShipPosition()
        this.myShip = new BetterShip(this, shipPosition.x, shipPosition.y);
        this.myShip.gravitySources = this.gravitySources;
        this.camera.startFollow(this.myShip);
    }

    update(time: number, delta: number) {
        if (this.myShip.alive) {
            this.myShip.thrusters(this.cursors.up.isDown, this.cursors.down.isDown, this.cursors.left.isDown, this.cursors.right.isDown)
            this.myShip.update();
            this.checkCollision(this.gravitySources.getChildren() as Planet[], this.myShip);
            this.totalTime += delta / 1000;
            this.timeText.setText('Time: ' + Phaser.Math.FloorTo(this.totalTime, -3, 10));
            this.fuelText.setText('Fuel left: ' + Phaser.Math.FloorTo(this.myShip.fuel, -2, 10));
        }
    }

    checkCollision(planets: Planet[], ship: BetterShip) {
        if (ship.alive) {
            let destroyed = false;
            if (zeroVector.clone().add(ship.body.position as Phaser.Math.Vector2).length() > 530) {
                destroyed = true
            }
            planets.forEach((planet: Planet) => {
                if (Math.pow(ship.body.position.x - planet.body.position.x, 2) + Math.pow(ship.body.position.y - planet.body.position.y, 2) <= Math.pow(ship.radius + planet.diameter / 2, 2)) {
                    destroyed = true
                }
            });

            if (destroyed) {
                ship.destroy();
                this.camera.fade(2000);
                this.scene.transition({
                    target: "SceneGameOver",
                    duration: 2000,
                    moveAbove: true,
                    sleep: false,
                    data: { time: Phaser.Math.FloorTo(this.totalTime, -3, 10), seed: this.seed },
                });
            }
        }
    }
}