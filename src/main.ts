import * as Phaser from 'phaser';
import { SceneMainMenu } from "./SceneMainMenu";
import { SceneMain } from "./SceneMain";
import { DemoScene } from "./DemoScene";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Game"
}

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Some Weird Space Game',

    type: Phaser.WEBGL,

    scale: {
        width: window.innerWidth,
        height: window.innerHeight,
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
        },
    },

    scene: [SceneMainMenu, SceneMain, DemoScene],

    parent: 'game',
    backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);