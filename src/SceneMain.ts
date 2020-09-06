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

const points: String = '5 5 5 -5 -5 -5 -5 5';
class BetterShip extends Phaser.GameObjects.Polygon {
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

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, points, 0x222222);
        this.isFilled = true;
        this.isStroked = true;
        this.strokeColor = 0x00ff00;

        this.thrustVector = new Phaser.Math.Vector2(0, 0);
        this.gravityVector = new Phaser.Math.Vector2(0, 0);
        this.movementVector = new Phaser.Math.Vector2(0, 0);

        this.lineMovementVector = scene.add.line(0, 0, 0, 0, 0, 0, 0x00ff00).setOrigin(0, 0);
        this.lineGravityVector = scene.add.line(0, 0, 0, 0, 0, 0, 0xff00ff).setOrigin(0, 0);
        this.lineThrustVector = scene.add.line(0, 0, 0, 0, 0, 0, 0xffff00).setOrigin(0, 0);

        scene.add.existing(this);

        this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.position.x = x;
        this.body.position.y = y;
    }

    update() {
        if (this.alive) {
            this.gravityVector = this.gravityTotal(this.gravitySources, this);
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

        return localThrustVector;
    }

    gravityTotal(gravitySources: Phaser.GameObjects.Group, ship: BetterShip) {
        let totalGravityVector = new Phaser.Math.Vector2();
        gravitySources.getChildren()
            .map(obj => obj as Planet)
            .map((planet: Planet) => this.gravity(planet, ship))
            .forEach((gravityVector: Phaser.Math.Vector2) => {
                totalGravityVector.add(gravityVector);
            });

        return totalGravityVector;
    }

    gravity(planet: Planet, ship: BetterShip) {
        let distance = Phaser.Math.Distance.BetweenPoints(planet.body.position, ship.body.position);
        let gravitationalForce = (G * planet.mass) / Math.pow(distance, 2.0);

        let gravityVector = (planet.body.position as Phaser.Math.Vector2).clone().subtract(ship.body.position as Phaser.Math.Vector2).normalize().scale(gravitationalForce);
        return gravityVector;
    }

    drawVectorLines() {
        let movementTarget = (this.body.position as Phaser.Math.Vector2).clone().add(this.movementVector.clone().scale(30));
        this.lineMovementVector.setTo(this.body.position.x, this.body.position.y, movementTarget.x, movementTarget.y);

        let gravityTarget = (this.body.position as Phaser.Math.Vector2).clone().add(this.gravityVector.clone().scale(1000));
        this.lineGravityVector.setTo(this.body.position.x, this.body.position.y, gravityTarget.x, gravityTarget.y);

        let thrustTarget = (this.body.position as Phaser.Math.Vector2).clone().add(this.thrustVector.clone().scale(1000));
        this.lineThrustVector.setTo(this.body.position.x, this.body.position.y, thrustTarget.x, thrustTarget.y);
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
    constructor(seed: number) {

    }
}

export class SceneMain extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    camera: Phaser.Cameras.Scene2D.Camera;

    myShip: BetterShip;
    gravitySources: Phaser.GameObjects.Group;
    timeText: Phaser.GameObjects.Text;
    gameSpeed: number;
    startTime: number;
    fuelText: Phaser.GameObjects.Text;
    seedText: Phaser.GameObjects.Text;
    totalTime: number;

    constructor() {
        super({ key: "SceneMain" });
    }

    init(seed: number) {
        console.log(seed);
    }

    preload() {
        this.load.setBaseURL('https://labs.phaser.io');
        this.load.image('red', 'assets/particles/red.png');
        this.load.image('blue', 'assets/particles/blue.png');
    }

    create() {
        this.startTime = this.sys.game.loop.time;

        this.seedText = this.add.text(5, 5, "Seed");
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

        let a = new Planet(this, 0, 0, 9E11, 40);
        let b = new Planet(this, 200, 200, 7E11, 30);
        let c = new Planet(this, -50, -100, 5E11, 20);

        this.gravitySources = this.add.group();
        this.gravitySources.addMultiple([a, b, c]);

        this.myShip = new BetterShip(this, -100, 10);
        this.myShip.gravitySources = this.gravitySources;
        this.camera.startFollow(this.myShip);

        this.gameSpeed = Phaser.Math.GetSpeed(500, 5);
    }

    update() {
        if (this.myShip.alive) {
            this.myShip.thrusters(this.cursors.up.isDown, this.cursors.down.isDown, this.cursors.left.isDown, this.cursors.right.isDown)
            this.myShip.update();
            this.checkCollision(this.gravitySources.getChildren() as Planet[], this.myShip);
            this.totalTime = (this.sys.game.loop.time - this.startTime) / 1000;
            this.timeText.setText('Time: ' + this.totalTime);
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
                    data: { time: this.totalTime },
                });
            }
        }
    }
}