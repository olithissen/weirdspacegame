import { Tilemaps } from "phaser";
import { Button } from "./Button"

export class ButtonArray extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, buttons: Button[]) {
        super(scene, x, y, buttons);

        let spacing = 16;

        let diff = 0 + width / 2 - (this.length * width + (this.length - 1) * spacing) / 2;

        for (let i = 0; i < this.length; i++) {
            let item = this.getAt(i) as Button;
            item.setX(diff);
            diff += width;
            if (i < this.length - 1) {
                diff += 16;
            }
        }

        scene.add.existing(this);
    }
}
